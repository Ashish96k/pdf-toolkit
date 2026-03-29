"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, FileType2, Upload } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DownloadButton } from "@/components/ui/DownloadButton";
import { FileList } from "@/components/ui/FileList";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { UploadZone } from "@/components/ui/UploadZone";
import { TOOL_PAGE_CONTENT } from "@/data/toolPageContent";
import { usePDFProcess } from "@/hooks/usePDFProcess";
import { trackToolUsed } from "@/lib/analytics";
import { suggestedDocxFilename } from "@/lib/suggestedDocxFilename";
import { useUploadStore } from "@/store/useUploadStore";

const content = TOOL_PAGE_CONTENT["pdf-to-word"];
const howIcons = [Upload, FileType2, Download] as const;

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(i > 0 ? 1 : 0))} ${sizes[i]}`;
}

export function PdfToWordClient() {
  const files = useUploadStore((s) => s.files);
  const setFiles = useUploadStore((s) => s.setFiles);
  const removeFile = useUploadStore((s) => s.removeFile);
  const isProcessing = useUploadStore((s) => s.isProcessing);
  const progress = useUploadStore((s) => s.progress);
  const downloadUrl = useUploadStore((s) => s.downloadUrl);
  const downloadFilename = useUploadStore((s) => s.downloadFilename);
  const error = useUploadStore((s) => s.error);
  const resetStore = useUploadStore((s) => s.reset);

  const { convertPDFToWord, revokeBlobUrl } = usePDFProcess();

  const file = files[0] ?? null;
  const fileKey = file ? `${file.name}-${file.size}-${file.lastModified}` : "";

  const [pageMeta, setPageMeta] = useState<{
    loading: boolean;
    count: number | null;
  }>({ loading: false, count: null });

  const prevFileKeyRef = useRef<string>("");

  useEffect(() => {
    if (fileKey === prevFileKeyRef.current) return;
    prevFileKeyRef.current = fileKey;
    setPageMeta({ loading: false, count: null });
  }, [fileKey]);

  useEffect(() => {
    if (!file) {
      setPageMeta({ loading: false, count: null });
      return;
    }

    let cancelled = false;
    setPageMeta({ loading: true, count: null });

    (async () => {
      try {
        const { getDocument, GlobalWorkerOptions, version } = await import(
          "pdfjs-dist"
        );
        GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
        const data = new Uint8Array(await file.arrayBuffer());
        const doc = await getDocument({ data }).promise;
        const n = doc.numPages;
        await doc.destroy().catch(() => {});
        if (!cancelled) setPageMeta({ loading: false, count: n });
      } catch {
        if (!cancelled) setPageMeta({ loading: false, count: null });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [file]);

  const handleReset = () => {
    revokeBlobUrl();
    resetStore();
  };

  const handleConvert = useCallback(async () => {
    if (!file || isProcessing) return;
    trackToolUsed("PDF to Word");
    await convertPDFToWord(file);
  }, [file, isProcessing, convertPDFToWord]);

  const docxName = file
    ? downloadFilename ?? suggestedDocxFilename(file.name)
    : "document.docx";

  return (
    <ToolPageLayout
      toolId="pdf-to-word"
      title="PDF to Word"
      subtitle="Turn a PDF into an editable .docx file. We try LibreOffice first, then fall back to pdf2docx when needed."
      howItWorksSteps={content.howToSteps.map((step, i) => ({
        ...step,
        icon: howIcons[i] ?? Upload,
      }))}
      faqs={content.faqs}
    >
      <div className="flex flex-col gap-6">
        <p
          className="rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-4 py-3 text-sm text-amber-100/90"
          role="note"
        >
          Conversion quality depends on the PDF. Scanned PDFs may not convert
          perfectly.
        </p>

        <UploadZone
          accept="application/pdf"
          multiple={false}
          onFiles={(picked) => setFiles(picked)}
        />

        {file ? (
          <>
            <FileList files={files} onRemove={removeFile} />
            <dl className="space-y-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm">
              <div className="flex flex-wrap gap-x-2 gap-y-1">
                <dt className="font-medium text-white/90">File name</dt>
                <dd className="text-text-secondary">{file.name}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2 gap-y-1">
                <dt className="font-medium text-white/90">Size</dt>
                <dd className="text-text-secondary">{formatFileSize(file.size)}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2 gap-y-1">
                <dt className="font-medium text-white/90">Pages</dt>
                <dd className="text-text-secondary">
                  {pageMeta.loading
                    ? "Reading…"
                    : pageMeta.count != null
                      ? `${pageMeta.count} page${pageMeta.count === 1 ? "" : "s"}`
                      : "Could not detect (file may still convert)"}
                </dd>
              </div>
            </dl>
          </>
        ) : null}

        {error ? (
          <p className="text-sm text-primary-light" role="alert">
            {error}
          </p>
        ) : null}

        {isProcessing ? (
          <ProgressBar progress={progress} label="Uploading & converting…" />
        ) : null}

        {downloadUrl ? (
          <DownloadButton
            url={downloadUrl}
            filename={docxName}
            toolName="PDF to Word"
          />
        ) : null}

        <button
          type="button"
          onClick={() => void handleConvert()}
          disabled={!file || isProcessing}
          className="w-full rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-white shadow-card transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#080010] disabled:pointer-events-none disabled:opacity-40"
        >
          Convert to Word
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={isProcessing}
          className="w-full rounded-2xl border border-white/[0.12] bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white/90 transition-colors hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#080010] disabled:pointer-events-none disabled:opacity-40"
        >
          Start over
        </button>
      </div>
    </ToolPageLayout>
  );
}

"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Layers, Upload } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { PageRangeInput } from "@/components/tools/PageRangeInput";
import type { PageRangeMode } from "@/components/tools/PageRangeInput";
import { DownloadButton } from "@/components/ui/DownloadButton";
import { FileList } from "@/components/ui/FileList";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { UploadZone } from "@/components/ui/UploadZone";
import { TOOL_PAGE_CONTENT } from "@/data/toolPageContent";
import { usePDFProcess } from "@/hooks/usePDFProcess";
import { trackToolUsed } from "@/lib/analytics";
import { pagesToRangeString, parsePageRange } from "@/lib/pageRange";
import { useUploadStore } from "@/store/useUploadStore";

const content = TOOL_PAGE_CONTENT["split-pdf"];
const howIcons = [Upload, Layers, Download] as const;

const PageThumbnails = dynamic(
  () =>
    import("@/components/tools/PageThumbnails").then((m) => ({
      default: m.PageThumbnails,
    })),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-text-secondary" aria-live="polite">
        Loading preview module…
      </p>
    ),
  }
);

export function SplitPDFClient() {
  const files = useUploadStore((s) => s.files);
  const setFiles = useUploadStore((s) => s.setFiles);
  const removeFile = useUploadStore((s) => s.removeFile);
  const isProcessing = useUploadStore((s) => s.isProcessing);
  const progress = useUploadStore((s) => s.progress);
  const downloadUrl = useUploadStore((s) => s.downloadUrl);
  const downloadFilename = useUploadStore((s) => s.downloadFilename);
  const error = useUploadStore((s) => s.error);
  const resetStore = useUploadStore((s) => s.reset);

  const { splitPDF, revokeBlobUrl } = usePDFProcess();

  const file = files[0] ?? null;
  const fileKey = file ? `${file.name}-${file.size}` : "";

  const [pageCount, setPageCount] = useState(0);
  const [splitMode, setSplitMode] = useState<PageRangeMode>("all");
  const [rangeInput, setRangeInput] = useState("");
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());

  const prevFileKeyRef = useRef<string>("");

  useEffect(() => {
    if (fileKey === prevFileKeyRef.current) return;
    prevFileKeyRef.current = fileKey;
    setPageCount(0);
    setSplitMode("all");
    setRangeInput("");
    setSelectedPages(new Set());
  }, [fileKey]);

  useEffect(() => {
    if (pageCount <= 0 || !file) return;
    const all = new Set(Array.from({ length: pageCount }, (_, i) => i + 1));
    setSelectedPages(all);
    setRangeInput(pagesToRangeString(Array.from(all)));
  }, [pageCount, fileKey, file]);

  const handlePageCount = useCallback((n: number) => {
    setPageCount(n);
  }, []);

  const handleRangeChange = useCallback(
    (value: string) => {
      setRangeInput(value);
      const parsed = parsePageRange(value, pageCount > 0 ? pageCount : undefined);
      if (parsed.ok) {
        setSelectedPages(new Set(parsed.pages));
      }
    },
    [pageCount]
  );

  const handleSelectionChange = useCallback((pages: Set<number>) => {
    setSelectedPages(pages);
    const sorted = Array.from(pages).sort((a, b) => a - b);
    setRangeInput(pagesToRangeString(sorted));
  }, []);

  const rangeSubmitOk = useMemo(() => {
    if (splitMode !== "range") return true;
    const parsed = parsePageRange(
      rangeInput.trim(),
      pageCount > 0 ? pageCount : undefined
    );
    return parsed.ok && parsed.pages.length > 0;
  }, [splitMode, rangeInput, pageCount]);

  const handleReset = () => {
    revokeBlobUrl();
    resetStore();
  };

  const handleSplit = () => {
    if (!file || isProcessing) return;
    if (splitMode === "all") {
      trackToolUsed("Split PDF");
      void splitPDF(file, { mode: "all" });
      return;
    }
    const trimmed = rangeInput.trim();
    const parsed = parsePageRange(
      trimmed,
      pageCount > 0 ? pageCount : undefined
    );
    if (!parsed.ok || parsed.pages.length === 0) return;
    trackToolUsed("Split PDF");
    void splitPDF(file, { mode: "range", range: trimmed });
  };

  const canSplit =
    Boolean(file) &&
    !isProcessing &&
    (splitMode === "all" || rangeSubmitOk);

  return (
    <ToolPageLayout
      toolId="split-pdf"
      title="Split PDF online"
      subtitle="Extract every page into its own file, or choose specific pages. Multiple pages download as a ZIP; a single page downloads as one PDF."
      howItWorksSteps={content.howToSteps.map((step, i) => ({
        ...step,
        icon: howIcons[i] ?? Upload,
      }))}
      faqs={content.faqs}
    >
      <div className="flex flex-col gap-6">
        <UploadZone
          accept="application/pdf"
          multiple={false}
          onFiles={(picked) => setFiles(picked)}
        />

        {file ? (
          <FileList files={files} onRemove={removeFile} />
        ) : null}

        {file ? (
          <PageRangeInput
            mode={splitMode}
            onModeChange={setSplitMode}
            value={rangeInput}
            onChange={handleRangeChange}
            pageCount={pageCount > 0 ? pageCount : undefined}
          />
        ) : null}

        {file ? (
          <PageThumbnails
            file={file}
            selectedPages={selectedPages}
            onSelectionChange={handleSelectionChange}
            onPageCount={handlePageCount}
            interactive={splitMode === "range"}
          />
        ) : null}

        {error ? (
          <p className="text-sm text-primary-light" role="alert">
            {error}
          </p>
        ) : null}

        {isProcessing ? (
          <ProgressBar progress={progress} label="Uploading & splitting…" />
        ) : null}

        {downloadUrl ? (
          <DownloadButton
            url={downloadUrl}
            filename={downloadFilename ?? "split.pdf"}
            toolName="Split PDF"
          />
        ) : null}

        <button
          type="button"
          onClick={handleSplit}
          disabled={!canSplit}
          className="w-full rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-white shadow-card transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#080010] disabled:pointer-events-none disabled:opacity-40"
        >
          Split PDF
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

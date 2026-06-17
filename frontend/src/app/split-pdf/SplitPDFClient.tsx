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
import {
  buildRangePreviewRows,
  createEmptyRangeSegment,
  pagesToSegmentInputs,
  type PageRangeSegmentInput,
  validateRangeSegments,
} from "@/lib/pageRange";
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

  const { splitPDF, resetToolSession } = usePDFProcess();

  const file = files[0] ?? null;
  const fileKey = file ? `${file.name}-${file.size}` : "";

  const [pageCount, setPageCount] = useState(0);
  const [splitMode, setSplitMode] = useState<PageRangeMode>("all");
  const [rangeSegments, setRangeSegments] = useState<PageRangeSegmentInput[]>([
    createEmptyRangeSegment(),
  ]);

  const prevFileKeyRef = useRef<string>("");

  useEffect(() => {
    if (fileKey === prevFileKeyRef.current) return;
    prevFileKeyRef.current = fileKey;
    setPageCount(0);
    setSplitMode("all");
    setRangeSegments([createEmptyRangeSegment()]);
  }, [fileKey]);

  useEffect(() => {
    if (pageCount <= 0 || !file) return;
    const all = Array.from({ length: pageCount }, (_, i) => i + 1);
    setRangeSegments(pagesToSegmentInputs(all));
  }, [pageCount, fileKey, file]);

  const handlePageCount = useCallback((n: number) => {
    setPageCount(n);
  }, []);

  const handleSegmentsChange = useCallback(
    (segments: PageRangeSegmentInput[]) => {
      setRangeSegments(segments);
    },
    []
  );

  const rangePreviewRows = useMemo(() => {
    if (splitMode !== "range") return null;
    return buildRangePreviewRows(
      rangeSegments,
      pageCount > 0 ? pageCount : undefined
    );
  }, [splitMode, rangeSegments, pageCount]);

  const rangeSubmitOk = useMemo(() => {
    if (splitMode !== "range") return true;
    const parsed = validateRangeSegments(
      rangeSegments,
      pageCount > 0 ? pageCount : undefined
    );
    return parsed.ok && parsed.pages.length > 0;
  }, [splitMode, rangeSegments, pageCount]);

  const handleReset = () => {
    resetToolSession();
  };

  const handleSplit = () => {
    if (!file || isProcessing) return;
    if (splitMode === "all") {
      trackToolUsed("Split PDF");
      void splitPDF(file, { mode: "all" });
      return;
    }
    const parsed = validateRangeSegments(
      rangeSegments,
      pageCount > 0 ? pageCount : undefined
    );
    if (!parsed.ok || parsed.pages.length === 0) return;
    trackToolUsed("Split PDF");
    void splitPDF(file, { mode: "range", range: parsed.rangeString });
  };

  const canSplit =
    Boolean(file) &&
    !isProcessing &&
    (splitMode === "all" || rangeSubmitOk);

  return (
    <ToolPageLayout
      toolId="split-pdf"
      title="Split PDF online"
      subtitle="Split every page into its own file with All pages, or add custom ranges—each range becomes one combined PDF. Multiple outputs download as a ZIP."
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
            segments={rangeSegments}
            onSegmentsChange={handleSegmentsChange}
            pageCount={pageCount > 0 ? pageCount : undefined}
          />
        ) : null}

        {file ? (
          <PageThumbnails
            file={file}
            onPageCount={handlePageCount}
            rangePreviewRows={rangePreviewRows}
            interactive={false}
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

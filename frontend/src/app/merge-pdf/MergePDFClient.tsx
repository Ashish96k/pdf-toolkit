"use client";

import { useCallback } from "react";
import { Download, Layers, Upload } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DownloadButton } from "@/components/ui/DownloadButton";
import { FileList } from "@/components/ui/FileList";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { UploadZone } from "@/components/ui/UploadZone";
import { TOOL_PAGE_CONTENT } from "@/data/toolPageContent";
import { usePDFProcess } from "@/hooks/usePDFProcess";
import { trackToolUsed } from "@/lib/analytics";
import { useUploadStore } from "@/store/useUploadStore";

const content = TOOL_PAGE_CONTENT["merge-pdf"];
const howIcons = [Upload, Layers, Download] as const;

export function MergePDFClient() {
  const files = useUploadStore((s) => s.files);
  const addFiles = useUploadStore((s) => s.addFiles);
  const setFiles = useUploadStore((s) => s.setFiles);
  const removeFile = useUploadStore((s) => s.removeFile);
  const isProcessing = useUploadStore((s) => s.isProcessing);
  const progress = useUploadStore((s) => s.progress);
  const downloadUrl = useUploadStore((s) => s.downloadUrl);
  const error = useUploadStore((s) => s.error);
  const resetStore = useUploadStore((s) => s.reset);

  const { mergePDF, revokeBlobUrl } = usePDFProcess();

  const onReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      const next = [...files];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      setFiles(next);
    },
    [files, setFiles]
  );

  const handleReset = () => {
    revokeBlobUrl();
    resetStore();
  };

  const handleMerge = () => {
    if (files.length === 0 || isProcessing) return;
    trackToolUsed("Merge PDF");
    void mergePDF(files);
  };

  return (
    <ToolPageLayout
      toolId="merge-pdf"
      title="Merge PDF files online"
      subtitle="Combine multiple PDFs into one document. Drag to reorder pages—order is preserved in the merged file."
      howItWorksSteps={content.howToSteps.map((step, i) => ({
        ...step,
        icon: howIcons[i] ?? Upload,
      }))}
      faqs={content.faqs}
    >
      <div className="flex flex-col gap-6">
        <UploadZone
          accept="application/pdf"
          multiple
          onFiles={(picked) => addFiles(picked)}
        />

        {files.length > 0 ? (
          <FileList
            files={files}
            onRemove={removeFile}
            reorderable
            onReorder={onReorder}
          />
        ) : null}

        {error ? (
          <p className="text-sm text-primary-light" role="alert">
            {error}
          </p>
        ) : null}

        {isProcessing ? (
          <ProgressBar progress={progress} label="Uploading & merging…" />
        ) : null}

        {downloadUrl ? (
          <DownloadButton
            url={downloadUrl}
            filename="merged.pdf"
            toolName="Merge PDF"
          />
        ) : null}

        <button
          type="button"
          onClick={handleMerge}
          disabled={files.length === 0 || isProcessing}
          className="w-full rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-white shadow-card transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#080010] disabled:pointer-events-none disabled:opacity-40"
        >
          Merge PDF
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

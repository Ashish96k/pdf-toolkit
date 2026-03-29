"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Minimize2, Upload } from "lucide-react";
import { CompressionSelector } from "@/components/tools/CompressionSelector";
import { CompressionSizeDiff } from "@/components/tools/CompressionSizeDiff";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DownloadButton } from "@/components/ui/DownloadButton";
import { FileList } from "@/components/ui/FileList";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { UploadZone } from "@/components/ui/UploadZone";
import { TOOL_PAGE_CONTENT } from "@/data/toolPageContent";
import {
  type CompressionLevel,
  usePDFProcess,
} from "@/hooks/usePDFProcess";
import { trackToolUsed } from "@/lib/analytics";
import { useUploadStore } from "@/store/useUploadStore";

const content = TOOL_PAGE_CONTENT["compress-pdf"];
const howIcons = [Upload, Minimize2, Download] as const;

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(i > 0 ? 1 : 0))} ${sizes[i]}`;
}

export function CompressPDFClient() {
  const files = useUploadStore((s) => s.files);
  const setFiles = useUploadStore((s) => s.setFiles);
  const removeFile = useUploadStore((s) => s.removeFile);
  const isProcessing = useUploadStore((s) => s.isProcessing);
  const progress = useUploadStore((s) => s.progress);
  const downloadUrl = useUploadStore((s) => s.downloadUrl);
  const error = useUploadStore((s) => s.error);
  const resetStore = useUploadStore((s) => s.reset);

  const { compressPDF, revokeBlobUrl } = usePDFProcess();

  const [level, setLevel] = useState<CompressionLevel>("medium");
  const [sizeDiff, setSizeDiff] = useState<{
    originalSize: number;
    compressedSize: number;
  } | null>(null);

  const file = files[0] ?? null;
  const fileKey = file ? `${file.name}-${file.size}-${file.lastModified}` : "";
  const prevFileKeyRef = useRef<string>("");

  useEffect(() => {
    if (fileKey === prevFileKeyRef.current) return;
    prevFileKeyRef.current = fileKey;
    setSizeDiff(null);
  }, [fileKey]);

  const handleReset = () => {
    revokeBlobUrl();
    setSizeDiff(null);
    resetStore();
  };

  const handleCompress = useCallback(async () => {
    if (!file || isProcessing) return;
    trackToolUsed("Compress PDF");
    setSizeDiff(null);
    const result = await compressPDF(file, level);
    if (result) {
      setSizeDiff({
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
      });
    }
  }, [file, isProcessing, level, compressPDF]);

  return (
    <ToolPageLayout
      toolId="compress-pdf"
      title="Compress PDF online"
      subtitle="Shrink PDF file size with Ghostscript-powered compression. Pick a preset that matches how you will use the file."
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
          <>
            <FileList files={files} onRemove={removeFile} />
            <p className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-text-secondary">
              <span className="font-medium text-white/90">Original file size: </span>
              {formatFileSize(file.size)}
            </p>
            <CompressionSelector value={level} onChange={setLevel} />
          </>
        ) : null}

        {error ? (
          <p className="text-sm text-primary-light" role="alert">
            {error}
          </p>
        ) : null}

        {isProcessing ? (
          <ProgressBar progress={progress} label="Uploading & compressing…" />
        ) : null}

        {sizeDiff ? (
          <CompressionSizeDiff
            originalSize={sizeDiff.originalSize}
            compressedSize={sizeDiff.compressedSize}
          />
        ) : null}

        {downloadUrl ? (
          <DownloadButton
            url={downloadUrl}
            filename="compressed.pdf"
            toolName="Compress PDF"
          />
        ) : null}

        <button
          type="button"
          onClick={() => void handleCompress()}
          disabled={!file || isProcessing}
          className="w-full rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-white shadow-card transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#080010] disabled:pointer-events-none disabled:opacity-40"
        >
          Compress PDF
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

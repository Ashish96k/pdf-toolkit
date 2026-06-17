"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Minimize2, Upload } from "lucide-react";
import { CompressionCustomPanel } from "@/components/tools/CompressionCustomPanel";
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
  type CompressionRequest,
  usePDFProcess,
} from "@/hooks/usePDFProcess";
import { trackToolUsed } from "@/lib/analytics";
import { useUploadStore } from "@/store/useUploadStore";
import {
  COMPRESSION_LEVELS,
  DEFAULT_CUSTOM_STRENGTH,
  getCompressionChoiceLabel,
  getSizeChangePercent,
  isOutputLargerThanOriginal,
  pickRecommendedCompressionLevel,
} from "@/utils/compressionLevels";
import { formatFileSize } from "@/utils/formatFileSize";

const content = TOOL_PAGE_CONTENT["compress-pdf"];
const howIcons = [Upload, Minimize2, Download] as const;
const CUSTOM_PREVIEW_DEBOUNCE_MS = 450;

export function CompressPDFClient() {
  const files = useUploadStore((s) => s.files);
  const setFiles = useUploadStore((s) => s.setFiles);
  const removeFile = useUploadStore((s) => s.removeFile);
  const isProcessing = useUploadStore((s) => s.isProcessing);
  const progress = useUploadStore((s) => s.progress);
  const downloadUrl = useUploadStore((s) => s.downloadUrl);
  const error = useUploadStore((s) => s.error);

  const { compressPDF, previewCompressPDF, resetToolSession } = usePDFProcess();

  const [compressionRequest, setCompressionRequest] = useState<CompressionRequest>({
    mode: "preset",
    level: "medium",
  });
  const [customStrength, setCustomStrength] = useState(DEFAULT_CUSTOM_STRENGTH);
  const [previewSizes, setPreviewSizes] = useState<
    Partial<Record<CompressionLevel, number>>
  >({});
  const [customPreviewSize, setCustomPreviewSize] = useState<number | null>(null);
  const [presetPreviewLoading, setPresetPreviewLoading] = useState(false);
  const [customPreviewLoading, setCustomPreviewLoading] = useState(false);
  const [recommendedLevel, setRecommendedLevel] = useState<CompressionLevel | null>(
    null
  );
  const [sizeDiff, setSizeDiff] = useState<{
    originalSize: number;
    compressedSize: number;
  } | null>(null);

  const file = files[0] ?? null;
  const fileKey = file ? `${file.name}-${file.size}-${file.lastModified}` : "";
  const prevFileKeyRef = useRef<string>("");
  const userPickedCompressionRef = useRef(false);
  const customPreviewRequestIdRef = useRef(0);

  const isCustomMode = compressionRequest.mode === "custom";
  const selectedPreset =
    compressionRequest.mode === "preset" ? compressionRequest.level : null;
  const activePreviewSize = isCustomMode
    ? customPreviewSize
    : compressionRequest.mode === "preset"
      ? previewSizes[compressionRequest.level]
      : null;
  const previewLoading = isCustomMode ? customPreviewLoading : presetPreviewLoading;

  const selectedOutputLarger =
    file != null &&
    activePreviewSize != null &&
    isOutputLargerThanOriginal(file.size, activePreviewSize);
  const selectedSizeChangePct =
    file != null && activePreviewSize != null
      ? getSizeChangePercent(file.size, activePreviewSize)
      : null;

  useEffect(() => {
    if (fileKey === prevFileKeyRef.current) return;
    prevFileKeyRef.current = fileKey;
    userPickedCompressionRef.current = false;
    setCompressionRequest({ mode: "preset", level: "medium" });
    setCustomStrength(DEFAULT_CUSTOM_STRENGTH);
    setRecommendedLevel(null);
    setSizeDiff(null);
    setPreviewSizes({});
    setCustomPreviewSize(null);
  }, [fileKey]);

  useEffect(() => {
    if (!file) {
      setPresetPreviewLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchPresetPreviews() {
      setPresetPreviewLoading(true);
      setPreviewSizes({});
      setRecommendedLevel(null);

      const results = await Promise.all(
        COMPRESSION_LEVELS.map(async (compressionLevel) => {
          const result = await previewCompressPDF(file!, {
            mode: "preset",
            level: compressionLevel,
          });
          return { compressionLevel, compressedSize: result?.compressedSize };
        })
      );

      if (cancelled) return;

      const nextSizes: Partial<Record<CompressionLevel, number>> = {};
      for (const { compressionLevel, compressedSize } of results) {
        if (typeof compressedSize === "number") {
          nextSizes[compressionLevel] = compressedSize;
        }
      }

      const recommended = pickRecommendedCompressionLevel(file!.size, nextSizes);

      setPreviewSizes(nextSizes);
      setRecommendedLevel(recommended);
      setPresetPreviewLoading(false);

      if (!userPickedCompressionRef.current && recommended) {
        setCompressionRequest({ mode: "preset", level: recommended });
      }
    }

    void fetchPresetPreviews();

    return () => {
      cancelled = true;
    };
  }, [file, fileKey, previewCompressPDF]);

  useEffect(() => {
    if (!file || !isCustomMode) {
      setCustomPreviewLoading(false);
      return;
    }

    const requestId = ++customPreviewRequestIdRef.current;
    setCustomPreviewLoading(true);

    const timeoutId = window.setTimeout(() => {
      void (async () => {
        const result = await previewCompressPDF(file, {
          mode: "custom",
          strength: customStrength,
        });

        if (customPreviewRequestIdRef.current !== requestId) return;

        setCustomPreviewSize(result?.compressedSize ?? null);
        setCustomPreviewLoading(false);
      })();
    }, CUSTOM_PREVIEW_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [file, fileKey, isCustomMode, customStrength, previewCompressPDF]);

  const handlePresetSelect = useCallback((level: CompressionLevel) => {
    userPickedCompressionRef.current = true;
    setCompressionRequest({ mode: "preset", level });
  }, []);

  const handleCustomActivate = useCallback(() => {
    userPickedCompressionRef.current = true;
    setCompressionRequest({ mode: "custom", strength: customStrength });
  }, [customStrength]);

  const handleCustomStrengthChange = useCallback((strength: number) => {
    userPickedCompressionRef.current = true;
    setCustomStrength(strength);
    setCompressionRequest({ mode: "custom", strength });
  }, []);

  const handleReset = () => {
    userPickedCompressionRef.current = false;
    setRecommendedLevel(null);
    setSizeDiff(null);
    setPreviewSizes({});
    setCustomPreviewSize(null);
    setCustomStrength(DEFAULT_CUSTOM_STRENGTH);
    setCompressionRequest({ mode: "preset", level: "medium" });
    resetToolSession();
  };

  const handleCompress = useCallback(async () => {
    if (!file || isProcessing) return;
    trackToolUsed("Compress PDF");
    setSizeDiff(null);

    const request: CompressionRequest =
      compressionRequest.mode === "custom"
        ? { mode: "custom", strength: customStrength }
        : compressionRequest;

    const result = await compressPDF(file, request);
    if (result) {
      setSizeDiff({
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
      });
    }
  }, [file, isProcessing, compressionRequest, customStrength, compressPDF]);

  const choiceLabel = getCompressionChoiceLabel(
    compressionRequest.mode === "custom"
      ? { mode: "custom", strength: customStrength }
      : compressionRequest
  );

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
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-text-secondary">
              <p>
                <span className="font-medium text-white/90">Original file size: </span>
                {formatFileSize(file.size)}
                {activePreviewSize != null ? (
                  <>
                    <span className="mx-2 text-white/20" aria-hidden>
                      ·
                    </span>
                    <span className="font-medium text-white/90">
                      Est. output ({choiceLabel}):{" "}
                    </span>
                    <span
                      className={[
                        "font-semibold tabular-nums",
                        selectedOutputLarger ? "text-amber-200/95" : "text-primary-light",
                      ].join(" ")}
                    >
                      {formatFileSize(activePreviewSize)}
                    </span>
                  </>
                ) : previewLoading ? (
                  <>
                    <span className="mx-2 text-white/20" aria-hidden>
                      ·
                    </span>
                    Estimating output size…
                  </>
                ) : null}
              </p>
              {activePreviewSize != null && selectedSizeChangePct != null ? (
                <p
                  className={[
                    "mt-1.5 text-xs",
                    selectedOutputLarger
                      ? "text-amber-200/85"
                      : selectedSizeChangePct > 0
                        ? "text-emerald-300/90"
                        : "text-text-muted",
                  ].join(" ")}
                >
                  {selectedOutputLarger
                    ? `This option may produce a file about ${Math.abs(selectedSizeChangePct)}% larger — try Balanced, Smallest file, or Extreme shrink.`
                    : selectedSizeChangePct > 0
                      ? `About ${selectedSizeChangePct}% smaller with ${choiceLabel}.`
                      : "Output size is similar to the original — this PDF may already be optimized."}
                </p>
              ) : null}
            </div>
            <CompressionSelector
              selectedPreset={selectedPreset}
              onPresetSelect={handlePresetSelect}
              originalSize={file.size}
              previewSizes={previewSizes}
              previewLoading={presetPreviewLoading}
              recommendedLevel={recommendedLevel}
            />
            <CompressionCustomPanel
              strength={customStrength}
              onStrengthChange={handleCustomStrengthChange}
              active={isCustomMode}
              onActivate={handleCustomActivate}
              originalSize={file.size}
              previewSize={customPreviewSize}
              previewLoading={customPreviewLoading}
            />
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

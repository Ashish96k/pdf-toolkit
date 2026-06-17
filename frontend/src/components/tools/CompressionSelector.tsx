"use client";

import { Check, Loader2, Sparkles } from "lucide-react";
import type { CompressionLevel } from "@/hooks/usePDFProcess";
import {
  COMPRESSION_OPTIONS,
  getSizeChangePercent,
  isOutputLargerThanOriginal,
} from "@/utils/compressionLevels";
import { formatFileSize } from "@/utils/formatFileSize";

export type CompressionSelectorProps = {
  selectedPreset: CompressionLevel | null;
  onPresetSelect: (level: CompressionLevel) => void;
  originalSize?: number;
  previewSizes?: Partial<Record<CompressionLevel, number>>;
  previewLoading?: boolean;
  recommendedLevel?: CompressionLevel | null;
};

export function CompressionSelector({
  selectedPreset,
  onPresetSelect,
  originalSize,
  previewSizes,
  previewLoading = false,
  recommendedLevel = null,
}: CompressionSelectorProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="section-label mb-1 text-left">Presets</legend>
      <p className="mb-3 text-xs leading-relaxed text-text-muted">
        Presets trade quality for file size. Best quality may rebuild the PDF and
        make it larger.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {COMPRESSION_OPTIONS.map((opt) => {
          const selected = selectedPreset === opt.id;
          const outputSize = previewSizes?.[opt.id];
          const isLoadingSize = previewLoading && outputSize == null;
          const isRecommended = recommendedLevel === opt.id;
          const outputLarger =
            originalSize != null &&
            outputSize != null &&
            isOutputLargerThanOriginal(originalSize, outputSize);
          const sizeChangePct =
            originalSize != null && outputSize != null
              ? getSizeChangePercent(originalSize, outputSize)
              : null;

          return (
            <label
              key={opt.id}
              className={[
                "relative flex cursor-pointer flex-col rounded-2xl border p-4 text-left transition-colors",
                selected
                  ? "border-primary bg-primary/10 ring-2 ring-primary/35"
                  : "border-white/[0.12] bg-white/[0.03] hover:border-white/[0.18] hover:bg-white/[0.05]",
              ].join(" ")}
            >
              <input
                type="radio"
                name="compression-level"
                value={opt.id}
                checked={selected}
                onChange={() => onPresetSelect(opt.id)}
                className="sr-only"
              />
              {selected ? (
                <span
                  className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-card"
                  aria-hidden
                >
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                </span>
              ) : null}
              {isRecommended && !selected ? (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                  <Sparkles className="h-3 w-3" aria-hidden />
                  Pick
                </span>
              ) : null}
              {isRecommended && selected ? (
                <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                  <Sparkles className="h-3 w-3" aria-hidden />
                  Recommended
                </span>
              ) : null}
              <span className="pr-10 text-sm font-semibold text-white">{opt.title}</span>
              <span className="mt-1 text-xs text-text-secondary">{opt.subtitle}</span>
              <span className="mt-3 text-xs leading-relaxed text-text-muted">{opt.quality}</span>
              {outputSize != null ? (
                <div className="mt-2 space-y-1">
                  <span
                    className={[
                      "block text-xs font-semibold tabular-nums",
                      outputLarger ? "text-amber-200/95" : "text-primary-light",
                    ].join(" ")}
                  >
                    Est. output: {formatFileSize(outputSize)}
                  </span>
                  {sizeChangePct != null && sizeChangePct > 0 ? (
                    <span className="block text-xs text-emerald-300/90">
                      About {sizeChangePct}% smaller
                    </span>
                  ) : sizeChangePct != null && sizeChangePct < 0 ? (
                    <span className="block text-xs text-amber-200/90">
                      About {Math.abs(sizeChangePct)}% larger than original
                    </span>
                  ) : sizeChangePct === 0 ? (
                    <span className="block text-xs text-text-muted">
                      Same size as original
                    </span>
                  ) : null}
                  {outputLarger ? (
                    <span className="block text-xs leading-relaxed text-amber-200/80">
                      This preset prioritizes quality and may not reduce size.
                    </span>
                  ) : null}
                </div>
              ) : isLoadingSize ? (
                <span className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                  Estimating output size…
                </span>
              ) : (
                <span className="mt-2 text-xs font-medium text-primary-light">{opt.sizeHint}</span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

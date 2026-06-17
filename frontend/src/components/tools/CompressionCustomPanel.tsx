"use client";

import { Check, Loader2 } from "lucide-react";
import {
  describeCustomStrength,
  getSizeChangePercent,
  isOutputLargerThanOriginal,
} from "@/utils/compressionLevels";
import { formatFileSize } from "@/utils/formatFileSize";

export type CompressionCustomPanelProps = {
  strength: number;
  onStrengthChange: (strength: number) => void;
  active: boolean;
  onActivate: () => void;
  originalSize?: number;
  previewSize?: number | null;
  previewLoading?: boolean;
};

export function CompressionCustomPanel({
  strength,
  onStrengthChange,
  active,
  onActivate,
  originalSize,
  previewSize,
  previewLoading = false,
}: CompressionCustomPanelProps) {
  const { summary, isExtreme } = describeCustomStrength(strength);
  const outputLarger =
    originalSize != null &&
    previewSize != null &&
    isOutputLargerThanOriginal(originalSize, previewSize);
  const sizeChangePct =
    originalSize != null && previewSize != null
      ? getSizeChangePercent(originalSize, previewSize)
      : null;

  return (
    <div
      className={[
        "rounded-2xl border p-5 transition-colors",
        active
          ? "border-primary bg-primary/10 ring-2 ring-primary/35"
          : "border-white/[0.12] bg-white/[0.03]",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onActivate}
        className="flex w-full items-start gap-3 text-left"
      >
        <span
          className={[
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
            active
              ? "border-primary bg-primary text-white"
              : "border-white/25 bg-transparent",
          ].join(" ")}
          aria-hidden
        >
          {active ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
        </span>
        <span className="flex-1">
          <span className="block text-sm font-semibold text-white">
            Extreme shrink (custom)
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-text-secondary">
            Go beyond the Smallest-file preset with lower DPI, stronger JPEG
            compression, and optional grayscale — best for scans and image-heavy
            PDFs.
          </span>
        </span>
      </button>

      {active ? (
        <div className="mt-5 space-y-4 border-t border-white/[0.08] pt-5">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3 text-xs">
              <span className="text-text-muted">Same as Smallest file</span>
              <span className="font-medium text-white/90">Maximum shrink</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={strength}
              onChange={(event) => {
                onActivate();
                onStrengthChange(Number(event.target.value));
              }}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/[0.12] accent-primary"
              aria-label="Extreme compression strength"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={strength}
            />
            <p className="mt-2 text-xs text-text-muted">
              Strength: <span className="font-medium text-white/80">{strength}%</span>
              {" · "}
              {summary}
            </p>
          </div>

          {isExtreme ? (
            <p className="rounded-xl border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-100/90">
              Maximum shrink may blur text and images, remove color, and reduce
              readability. Use for sharing or storage when quality is not critical.
            </p>
          ) : null}

          {previewLoading && previewSize == null ? (
            <p className="flex items-center gap-1.5 text-xs text-text-muted">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
              Estimating output size…
            </p>
          ) : previewSize != null ? (
            <div className="space-y-1">
              <p
                className={[
                  "text-xs font-semibold tabular-nums",
                  outputLarger ? "text-amber-200/95" : "text-primary-light",
                ].join(" ")}
              >
                Est. output: {formatFileSize(previewSize)}
              </p>
              {sizeChangePct != null && sizeChangePct > 0 ? (
                <p className="text-xs text-emerald-300/90">
                  About {sizeChangePct}% smaller than original
                </p>
              ) : sizeChangePct != null && sizeChangePct < 0 ? (
                <p className="text-xs text-amber-200/90">
                  About {Math.abs(sizeChangePct)}% larger than original
                </p>
              ) : (
                <p className="text-xs text-text-muted">
                  Similar size to original — this PDF may have little image data to
                  compress further.
                </p>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

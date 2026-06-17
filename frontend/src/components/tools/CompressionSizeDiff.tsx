"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getSizeChangePercent } from "@/utils/compressionLevels";
import { formatFileSize } from "@/utils/formatFileSize";

export type CompressionSizeDiffProps = {
  originalSize: number;
  compressedSize: number;
};

export function CompressionSizeDiff({
  originalSize,
  compressedSize,
}: CompressionSizeDiffProps) {
  const max = Math.max(originalSize, compressedSize, 1);
  const beforePct = (originalSize / max) * 100;
  const afterPct = (compressedSize / max) * 100;
  const saved = getSizeChangePercent(originalSize, compressedSize);
  const outputLarger = compressedSize > originalSize;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className="overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5"
      role="region"
      aria-label="File size comparison"
    >
      <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-text-muted">
        Size comparison
      </p>
      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
        <div className="flex-1 space-y-2">
          <p className="text-xs text-text-muted">Before</p>
          <p className="text-lg font-bold tabular-nums text-white">
            {formatFileSize(originalSize)}
          </p>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full rounded-full bg-white/35 transition-all duration-500"
              style={{ width: `${beforePct}%` }}
            />
          </div>
        </div>
        <div
          className="flex shrink-0 justify-center text-primary-light sm:px-2"
          aria-hidden
        >
          <ArrowRight className="h-6 w-6 rotate-90 sm:rotate-0" />
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-xs text-text-muted">Output</p>
          <p
            className={[
              "text-lg font-bold tabular-nums",
              outputLarger ? "text-amber-200/95" : "text-primary-light",
            ].join(" ")}
          >
            {formatFileSize(compressedSize)}
          </p>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${afterPct}%` }}
            />
          </div>
        </div>
      </div>
      {saved > 0 ? (
        <p className="mt-4 text-center text-sm text-emerald-300/95">
          About {saved}% smaller than the original
        </p>
      ) : outputLarger ? (
        <p className="mt-4 text-center text-sm text-amber-200/90">
          Output is about {Math.abs(saved)}% larger — this preset prioritized quality
          over size, or the PDF was already optimized.
        </p>
      ) : (
        <p className="mt-4 text-center text-sm text-text-secondary">
          Output is similar size to the original — this PDF may already be optimized.
        </p>
      )}
    </motion.div>
  );
}

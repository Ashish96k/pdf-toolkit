"use client";

import { motion } from "framer-motion";

export interface ProgressBarProps {
  progress: number;
  label: string;
}

export function ProgressBar({ progress, label }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));
  if (clamped <= 0) return null;

  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between text-xs text-text-muted">
        <span>{label}</span>
        <span className="tabular-nums">{Math.round(clamped)}%</span>
      </div>
      <div
        className="relative h-1.5 w-full overflow-visible rounded-pill bg-white/5"
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <motion.div
          className="absolute left-0 top-0 h-full rounded-pill bg-progress-fill shadow-progress-fill"
          initial={false}
          animate={{ width: `${clamped}%` }}
          transition={{ type: "spring", stiffness: 60, damping: 18 }}
        >
          <span
            className="absolute right-0 top-1/2 size-2.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-progress-tip shadow-progress-tip"
            aria-hidden
          />
        </motion.div>
      </div>
    </div>
  );
}

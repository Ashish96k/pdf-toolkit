"use client";

import { Check } from "lucide-react";
import type { CompressionLevel } from "@/hooks/usePDFProcess";

export type CompressionSelectorProps = {
  value: CompressionLevel;
  onChange: (level: CompressionLevel) => void;
};

type Option = {
  id: CompressionLevel;
  title: string;
  subtitle: string;
  quality: string;
  sizeHint: string;
};

const OPTIONS: Option[] = [
  {
    id: "low",
    title: "Low compression",
    subtitle: "Larger file, best quality",
    quality: "Excellent — ideal for print and archival",
    sizeHint: "Roughly 10–30% smaller (varies by PDF)",
  },
  {
    id: "medium",
    title: "Medium",
    subtitle: "Balanced quality and size",
    quality: "Very good — suitable for sharing and screens",
    sizeHint: "Often 25–55% smaller (varies by PDF)",
  },
  {
    id: "high",
    title: "High compression",
    subtitle: "Smallest file, lower quality",
    quality: "Good — fine for quick sharing and preview",
    sizeHint: "Often 40–75% smaller (varies by PDF)",
  },
];

export function CompressionSelector({ value, onChange }: CompressionSelectorProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="section-label mb-3 text-left">Compression level</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {OPTIONS.map((opt) => {
          const selected = value === opt.id;
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
                onChange={() => onChange(opt.id)}
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
              <span className="pr-10 text-sm font-semibold text-white">{opt.title}</span>
              <span className="mt-1 text-xs text-text-secondary">{opt.subtitle}</span>
              <span className="mt-3 text-xs leading-relaxed text-text-muted">{opt.quality}</span>
              <span className="mt-2 text-xs font-medium text-primary-light">{opt.sizeHint}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

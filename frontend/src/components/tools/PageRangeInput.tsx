"use client";

import { useId, useMemo } from "react";
import { parsePageRange } from "@/lib/pageRange";

export type PageRangeMode = "all" | "range";

export interface PageRangeInputProps {
  mode: PageRangeMode;
  onModeChange: (mode: PageRangeMode) => void;
  value: string;
  onChange: (value: string) => void;
  pageCount?: number;
}

export function PageRangeInput({
  mode,
  onModeChange,
  value,
  onChange,
  pageCount,
}: PageRangeInputProps) {
  const groupId = useId();
  const inputId = useId();

  const rangeError = useMemo(() => {
    if (mode !== "range") return null;
    const result = parsePageRange(
      value,
      pageCount && pageCount > 0 ? pageCount : undefined
    );
    return result.ok ? null : result.error;
  }, [mode, value, pageCount]);

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-white">
          Split mode
        </legend>
        <div
          className="flex flex-wrap gap-3"
          role="radiogroup"
          aria-labelledby={`${groupId}-legend`}
        >
          <span id={`${groupId}-legend`} className="sr-only">
            Choose split mode
          </span>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-sm text-white/90 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10">
            <input
              type="radio"
              name={`split-mode-${groupId}`}
              className="h-4 w-4 accent-primary"
              checked={mode === "all"}
              onChange={() => onModeChange("all")}
            />
            All pages
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-sm text-white/90 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10">
            <input
              type="radio"
              name={`split-mode-${groupId}`}
              className="h-4 w-4 accent-primary"
              checked={mode === "range"}
              onChange={() => onModeChange("range")}
            />
            Custom range
          </label>
        </div>
      </fieldset>

      {mode === "range" ? (
        <div className="space-y-2">
          <label htmlFor={inputId} className="text-sm font-semibold text-white">
            Page range
          </label>
          <input
            id={inputId}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. 1-3, 5, 7-9"
            aria-invalid={rangeError ? true : undefined}
            aria-describedby={`${inputId}-help ${inputId}-err`}
            className="w-full rounded-xl border border-white/[0.12] bg-white/[0.06] px-4 py-3 text-sm text-white placeholder:text-text-muted outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
          <p id={`${inputId}-help`} className="text-xs text-text-secondary">
            Use commas between groups. Hyphens mean inclusive ranges (1-3 is pages 1,
            2, and 3). Page numbers start at 1.
          </p>
          {rangeError ? (
            <p id={`${inputId}-err`} className="text-sm text-primary-light" role="alert">
              {rangeError}
            </p>
          ) : (
            <span id={`${inputId}-err`} className="sr-only">
              No errors
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}

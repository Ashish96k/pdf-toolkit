"use client";

import { Plus, Trash2 } from "lucide-react";
import { useId, useMemo } from "react";
import {
  createEmptyRangeSegment,
  type PageRangeSegmentInput,
  validateRangeSegments,
} from "@/lib/pageRange";

export type PageRangeMode = "all" | "range";

export interface PageRangeInputProps {
  mode: PageRangeMode;
  onModeChange: (mode: PageRangeMode) => void;
  segments: PageRangeSegmentInput[];
  onSegmentsChange: (segments: PageRangeSegmentInput[]) => void;
  pageCount?: number;
}

export function PageRangeInput({
  mode,
  onModeChange,
  segments,
  onSegmentsChange,
  pageCount,
}: PageRangeInputProps) {
  const groupId = useId();
  const helpId = useId();
  const errorId = useId();

  const rangeError = useMemo(() => {
    if (mode !== "range") return null;
    const result = validateRangeSegments(
      segments,
      pageCount && pageCount > 0 ? pageCount : undefined
    );
    return result.ok ? null : result.error;
  }, [mode, segments, pageCount]);

  const updateSegment = (
    index: number,
    field: keyof PageRangeSegmentInput,
    value: string
  ) => {
    onSegmentsChange(
      segments.map((segment, i) =>
        i === index ? { ...segment, [field]: value } : segment
      )
    );
  };

  const addSegment = () => {
    onSegmentsChange([...segments, createEmptyRangeSegment()]);
  };

  const removeSegment = (index: number) => {
    if (segments.length <= 1) return;
    onSegmentsChange(segments.filter((_, i) => i !== index));
  };

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
        <div
          className="space-y-3"
          aria-describedby={`${helpId} ${errorId}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-white">Page ranges</p>
            {pageCount ? (
              <p className="text-xs text-text-secondary">
                Document has {pageCount} page{pageCount === 1 ? "" : "s"}
              </p>
            ) : null}
          </div>

          <ul className="space-y-3" aria-label="Page ranges">
            {segments.map((segment, index) => {
              const rowId = `${groupId}-range-${index}`;
              return (
                <li
                  key={rowId}
                  className="rounded-xl border border-white/[0.1] bg-white/[0.03] p-3"
                >
                  <div className="flex flex-wrap items-end gap-3">
                    <p className="w-full text-xs font-medium text-text-secondary sm:w-auto sm:min-w-[4.5rem]">
                      Range {index + 1}
                    </p>

                    <div className="flex min-w-0 flex-1 flex-wrap items-end gap-2 sm:flex-none">
                      <div className="min-w-[5.5rem] flex-1 sm:flex-none">
                        <label
                          htmlFor={`${rowId}-from`}
                          className="mb-1 block text-xs text-text-secondary"
                        >
                          From page
                        </label>
                        <input
                          id={`${rowId}-from`}
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={pageCount && pageCount > 0 ? pageCount : undefined}
                          value={segment.from}
                          onChange={(e) =>
                            updateSegment(index, "from", e.target.value)
                          }
                          placeholder="1"
                          className="w-full rounded-lg border border-white/[0.12] bg-white/[0.06] px-3 py-2.5 text-sm text-white placeholder:text-text-muted outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/30"
                        />
                      </div>

                      <span
                        className="hidden pb-2.5 text-xs text-text-muted sm:inline"
                        aria-hidden
                      >
                        to
                      </span>

                      <div className="min-w-[5.5rem] flex-1 sm:flex-none">
                        <label
                          htmlFor={`${rowId}-to`}
                          className="mb-1 block text-xs text-text-secondary"
                        >
                          To page
                        </label>
                        <input
                          id={`${rowId}-to`}
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={pageCount && pageCount > 0 ? pageCount : undefined}
                          value={segment.to}
                          onChange={(e) =>
                            updateSegment(index, "to", e.target.value)
                          }
                          placeholder={
                            pageCount && pageCount > 0
                              ? String(pageCount)
                              : "10"
                          }
                          className="w-full rounded-lg border border-white/[0.12] bg-white/[0.06] px-3 py-2.5 text-sm text-white placeholder:text-text-muted outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                    </div>

                    {segments.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeSegment(index)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label={`Remove range ${index + 1}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        Remove
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={addSegment}
            className="inline-flex items-center gap-2 rounded-xl border border-dashed border-white/[0.18] bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/90 transition-colors hover:border-primary/50 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add another range
          </button>

          <p id={helpId} className="text-xs text-text-secondary">
            Add one or more ranges—for example, pages 1–2 and pages 3–4 as
            separate rows. Each range becomes one combined PDF. Click any
            thumbnail below—or use Preview range—to inspect pages before
            splitting.
          </p>

          {rangeError ? (
            <p id={errorId} className="text-sm text-primary-light" role="alert">
              {rangeError}
            </p>
          ) : (
            <span id={errorId} className="sr-only">
              No errors
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}

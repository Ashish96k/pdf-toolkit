"use client";

import { Expand, Eye } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions, version } from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { RangePreviewRow } from "@/lib/pageRange";
import {
  PagePreviewModal,
  type PagePreviewModalState,
} from "@/components/tools/PagePreviewModal";
import { cn } from "@/utils/cn";

GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

type PageThumbnailsProps = {
  file: File | null;
  onPageCount?: (count: number) => void;
  /** Flat grid of all pages (used for “All pages” mode). */
  selectedPages?: Set<number>;
  onSelectionChange?: (pages: Set<number>) => void;
  interactive?: boolean;
  /** Grouped previews per custom range row. */
  rangePreviewRows?: RangePreviewRow[] | null;
};

function ThumbnailTile({
  pdf,
  pageNumber,
  selected,
  onToggle,
  onView,
  interactive,
}: {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  selected?: boolean;
  onToggle?: () => void;
  onView?: () => void;
  interactive: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseId = useId();
  const checkId = `${baseId}-p${pageNumber}`;
  const viewable = Boolean(onView);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const page = await pdf.getPage(pageNumber);
      const scale = 0.22;
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;
    })().catch(() => {
      /* render errors are non-fatal for thumbnails */
    });

    return () => {
      cancelled = true;
    };
  }, [pdf, pageNumber]);

  const previewCanvas = (
    <canvas
      ref={canvasRef}
      aria-hidden={viewable || interactive}
      role={viewable || interactive ? undefined : "img"}
      aria-label={
        viewable || interactive ? undefined : `Preview of PDF page ${pageNumber}`
      }
      className="mx-auto block h-auto max-h-40 w-full object-contain"
    />
  );

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2 rounded-xl border-2 bg-white/[0.03] p-2 transition-[border-color,box-shadow]",
        interactive && selected
          ? "border-primary shadow-[0_0_0_1px_rgba(230,57,70,0.35)]"
          : "border-white/[0.08]",
        viewable && "group"
      )}
    >
      <div className="flex items-center justify-between gap-2 px-1">
        {interactive ? (
          <div className="flex items-center gap-2">
            <input
              id={checkId}
              type="checkbox"
              checked={selected}
              onChange={() => onToggle?.()}
              className="h-4 w-4 shrink-0 cursor-pointer rounded border-white/30 bg-white/10 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <label
              htmlFor={checkId}
              className="cursor-pointer text-xs font-medium text-text-secondary"
            >
              Page {pageNumber}
            </label>
          </div>
        ) : (
          <p className="text-xs font-medium text-text-secondary">
            Page {pageNumber}
          </p>
        )}
        {viewable ? (
          <button
            type="button"
            onClick={onView}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-text-secondary transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`View full preview of page ${pageNumber}`}
          >
            <Expand className="h-3.5 w-3.5" aria-hidden />
            View
          </button>
        ) : null}
      </div>
      {interactive ? (
        <button
          type="button"
          onClick={onToggle}
          className="relative w-full overflow-hidden rounded-lg bg-white/[0.06] text-left outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-pressed={selected}
          aria-label={`${selected ? "Deselect" : "Select"} page ${pageNumber} preview`}
        >
          {previewCanvas}
        </button>
      ) : viewable ? (
        <button
          type="button"
          onClick={onView}
          className="relative w-full overflow-hidden rounded-lg bg-white/[0.06] text-left outline-none transition-colors hover:bg-white/[0.09] focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={`View full preview of page ${pageNumber}`}
        >
          {previewCanvas}
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/25 group-hover:opacity-100 group-focus-within:bg-black/25 group-focus-within:opacity-100">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white">
              <Eye className="h-3.5 w-3.5" aria-hidden />
              View page
            </span>
          </span>
        </button>
      ) : (
        <div className="relative w-full overflow-hidden rounded-lg bg-white/[0.06]">
          {previewCanvas}
        </div>
      )}
    </div>
  );
}

function RangeGroupPreview({
  pdf,
  row,
  onViewPage,
  onPreviewRange,
}: {
  pdf: PDFDocumentProxy;
  row: RangePreviewRow;
  onViewPage: (row: RangePreviewRow, pageIndex: number) => void;
  onPreviewRange: (row: RangePreviewRow) => void;
}) {
  const pages = row.pages;

  return (
    <section
      aria-label={row.label}
      className="rounded-2xl border border-white/[0.12] bg-white/[0.02] p-4"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">{row.label}</h3>
        <div className="flex flex-wrap items-center gap-2">
          {pages && pages.length > 0 ? (
            <>
              <p className="text-xs text-text-secondary">
                {pages.length} page{pages.length === 1 ? "" : "s"} · 1 PDF
              </p>
              <button
                type="button"
                onClick={() => onPreviewRange(row)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04] px-2.5 py-1.5 text-xs font-semibold text-white/90 transition-colors hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Eye className="h-3.5 w-3.5" aria-hidden />
                Preview range
              </button>
            </>
          ) : null}
        </div>
      </div>

      {pages && pages.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {pages.map((pageNum, pageIndex) => (
            <ThumbnailTile
              key={`${row.index}-${pageNum}`}
              pdf={pdf}
              pageNumber={pageNum}
              interactive={false}
              onView={() => onViewPage(row, pageIndex)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/[0.14] bg-white/[0.02] px-4 py-8 text-center">
          <p className="text-sm text-text-secondary">
            Enter valid from and to pages above to preview this range.
          </p>
        </div>
      )}
    </section>
  );
}

export function PageThumbnails({
  file,
  selectedPages = new Set(),
  onSelectionChange,
  onPageCount,
  interactive = true,
  rangePreviewRows = null,
}: PageThumbnailsProps) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [previewState, setPreviewState] = useState<PagePreviewModalState | null>(
    null
  );

  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const groupedMode = rangePreviewRows != null;

  useEffect(() => {
    if (!file) {
      pdfDocRef.current?.destroy().catch(() => {});
      pdfDocRef.current = null;
      setPdf(null);
      setNumPages(0);
      setLoadError(null);
      setPreviewState(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const buffer = await file.arrayBuffer();
        if (cancelled) return;
        const nextDoc = await getDocument({ data: new Uint8Array(buffer) })
          .promise;
        if (cancelled) {
          nextDoc.destroy().catch(() => {});
          return;
        }
        pdfDocRef.current?.destroy().catch(() => {});
        pdfDocRef.current = nextDoc;
        setPdf(nextDoc);
        const n = nextDoc.numPages;
        setNumPages(n);
        setLoadError(null);
        onPageCount?.(n);
      } catch {
        if (!cancelled) {
          setLoadError("Could not load PDF previews.");
          setPdf(null);
          setNumPages(0);
        }
      }
    })();

    return () => {
      cancelled = true;
      pdfDocRef.current?.destroy().catch(() => {});
      pdfDocRef.current = null;
    };
  }, [file, onPageCount]);

  const openRangePreview = useCallback(
    (row: RangePreviewRow, pageIndex: number) => {
      if (!row.pages?.length) return;
      setPreviewState({
        rangeLabel: row.label,
        pages: row.pages,
        pageIndex,
      });
    },
    []
  );

  const openRangePreviewAtStart = useCallback((row: RangePreviewRow) => {
    openRangePreview(row, 0);
  }, [openRangePreview]);

  const toggle = useCallback(
    (page: number) => {
      if (!onSelectionChange) return;
      const next = new Set(selectedPages);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      onSelectionChange(next);
    },
    [selectedPages, onSelectionChange]
  );

  const selectAll = useCallback(() => {
    if (!onSelectionChange || numPages === 0) return;
    onSelectionChange(
      new Set(Array.from({ length: numPages }, (_, i) => i + 1))
    );
  }, [numPages, onSelectionChange]);

  const deselectAll = useCallback(() => {
    onSelectionChange?.(new Set());
  }, [onSelectionChange]);

  if (!file) return null;

  if (loadError) {
    return (
      <p className="text-sm text-primary-light" role="alert">
        {loadError}
      </p>
    );
  }

  if (!pdf || numPages === 0) {
    return (
      <p className="text-sm text-text-secondary" aria-live="polite">
        Loading page previews…
      </p>
    );
  }

  const previewModal = (
    <PagePreviewModal
      pdf={pdf}
      state={previewState}
      onClose={() => setPreviewState(null)}
      onPageIndexChange={(pageIndex) =>
        setPreviewState((current) =>
          current ? { ...current, pageIndex } : current
        )
      }
    />
  );

  if (groupedMode) {
    const readyCount = rangePreviewRows.filter((row) => row.pages?.length).length;

    return (
      <>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-white">Range previews</p>
            {readyCount > 0 ? (
              <p className="text-xs text-text-secondary">
                {readyCount} combined PDF{readyCount === 1 ? "" : "s"} will be
                created · Click a page to view it larger
              </p>
            ) : null}
          </div>

          <div className="space-y-4">
            {rangePreviewRows.map((row) => (
              <RangeGroupPreview
                key={row.index}
                pdf={pdf}
                row={row}
                onViewPage={openRangePreview}
                onPreviewRange={openRangePreviewAtStart}
              />
            ))}
          </div>
        </div>
        {previewModal}
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {interactive ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-white">Select pages</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="rounded-lg border border-white/[0.14] bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-white/90 transition-colors hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className="rounded-lg border border-white/[0.14] bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-white/90 transition-colors hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Deselect all
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm font-semibold text-white">Page previews</p>
        )}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
            <ThumbnailTile
              key={pageNum}
              pdf={pdf}
              pageNumber={pageNum}
              selected={selectedPages.has(pageNum)}
              onToggle={() => toggle(pageNum)}
              interactive={interactive}
              onView={
                !interactive
                  ? () =>
                      setPreviewState({
                        rangeLabel: "All pages",
                        pages: Array.from(
                          { length: numPages },
                          (_, i) => i + 1
                        ),
                        pageIndex: pageNum - 1,
                      })
                  : undefined
              }
            />
          ))}
        </div>
      </div>
      {previewModal}
    </>
  );
}

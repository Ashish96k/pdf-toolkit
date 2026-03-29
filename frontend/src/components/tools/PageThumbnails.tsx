"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions, version } from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { cn } from "@/utils/cn";

GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

type PageThumbnailsProps = {
  file: File | null;
  selectedPages: Set<number>;
  onSelectionChange: (pages: Set<number>) => void;
  onPageCount?: (count: number) => void;
  /** When false, show previews only (no checkboxes or bulk actions). */
  interactive?: boolean;
};

function ThumbnailTile({
  pdf,
  pageNumber,
  selected,
  onToggle,
  interactive,
}: {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  selected: boolean;
  onToggle: () => void;
  interactive: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseId = useId();
  const checkId = `${baseId}-p${pageNumber}`;

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

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2 rounded-xl border-2 bg-white/[0.03] p-2 transition-[border-color,box-shadow]",
        interactive && selected
          ? "border-primary shadow-[0_0_0_1px_rgba(230,57,70,0.35)]"
          : "border-white/[0.08]"
      )}
    >
      {interactive ? (
        <div className="flex items-center gap-2 px-1">
          <input
            id={checkId}
            type="checkbox"
            checked={selected}
            onChange={() => onToggle()}
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
        <p className="px-1 text-xs font-medium text-text-secondary">Page {pageNumber}</p>
      )}
      {interactive ? (
        <button
          type="button"
          onClick={onToggle}
          className="relative w-full overflow-hidden rounded-lg bg-white/[0.06] text-left outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-pressed={selected}
          aria-label={`${selected ? "Deselect" : "Select"} page ${pageNumber} preview`}
        >
          <canvas
            ref={canvasRef}
            aria-hidden
            className="mx-auto block h-auto max-h-40 w-full object-contain"
          />
        </button>
      ) : (
        <div className="relative w-full overflow-hidden rounded-lg bg-white/[0.06]">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={`Preview of PDF page ${pageNumber}`}
            className="mx-auto block h-auto max-h-40 w-full object-contain"
          />
        </div>
      )}
    </div>
  );
}

export function PageThumbnails({
  file,
  selectedPages,
  onSelectionChange,
  onPageCount,
  interactive = true,
}: PageThumbnailsProps) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);

  useEffect(() => {
    if (!file) {
      pdfDocRef.current?.destroy().catch(() => {});
      pdfDocRef.current = null;
      setPdf(null);
      setNumPages(0);
      setLoadError(null);
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

  const toggle = useCallback(
    (page: number) => {
      const next = new Set(selectedPages);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      onSelectionChange(next);
    },
    [selectedPages, onSelectionChange]
  );

  const selectAll = useCallback(() => {
    if (numPages === 0) return;
    onSelectionChange(new Set(Array.from({ length: numPages }, (_, i) => i + 1)));
  }, [numPages, onSelectionChange]);

  const deselectAll = useCallback(() => {
    onSelectionChange(new Set());
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

  return (
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
          />
        ))}
      </div>
    </div>
  );
}

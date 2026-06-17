"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { cn } from "@/utils/cn";

const MAX_RENDER_SCALE = 1.35;
const MAX_CACHED_PAGES = 16;

export type PagePreviewModalState = {
  rangeLabel: string;
  pages: number[];
  pageIndex: number;
};

type PagePreviewModalProps = {
  pdf: PDFDocumentProxy;
  state: PagePreviewModalState | null;
  onClose: () => void;
  onPageIndexChange: (pageIndex: number) => void;
};

type CachedRender = {
  width: number;
  height: number;
  bitmap: ImageBitmap;
};

function renderCacheKey(pageNumber: number, scale: number) {
  return `${pageNumber}:${scale.toFixed(2)}`;
}

function trimRenderCache(cache: Map<string, CachedRender>) {
  while (cache.size > MAX_CACHED_PAGES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey == null) break;
    const entry = cache.get(oldestKey);
    entry?.bitmap.close();
    cache.delete(oldestKey);
  }
}

export function PagePreviewModal({
  pdf,
  state,
  onClose,
  onPageIndexChange,
}: PagePreviewModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const renderCacheRef = useRef<Map<string, CachedRender>>(new Map());
  const [isRendering, setIsRendering] = useState(false);

  const open = state != null;
  const pages = state?.pages ?? [];
  const pageIndex = state?.pageIndex ?? 0;
  const pageNumber = pages[pageIndex] ?? 1;
  const canGoPrev = pageIndex > 0;
  const canGoNext = pageIndex < pages.length - 1;

  const goPrev = useCallback(() => {
    if (!canGoPrev) return;
    onPageIndexChange(pageIndex - 1);
  }, [canGoPrev, onPageIndexChange, pageIndex]);

  const goNext = useCallback(() => {
    if (!canGoNext) return;
    onPageIndexChange(pageIndex + 1);
  }, [canGoNext, onPageIndexChange, pageIndex]);

  const clearRenderCache = useCallback(() => {
    renderCacheRef.current.forEach((entry) => {
      entry.bitmap.close();
    });
    renderCacheRef.current.clear();
  }, []);

  useEffect(() => {
    if (!open) {
      clearRenderCache();
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
      clearRenderCache();
    };
  }, [open, clearRenderCache]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, goPrev, goNext]);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [open, pageNumber]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const drawCached = (cached: CachedRender) => {
      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = cached.width;
      canvas.height = cached.height;
      ctx.drawImage(cached.bitmap, 0, 0);
    };

    (async () => {
      const canvas = canvasRef.current;
      const container = scrollRef.current;
      if (!canvas || !container) return;

      const containerWidth = Math.max(container.clientWidth - 32, 320);

      try {
        const page = await pdf.getPage(pageNumber);
        if (cancelled) return;

        const baseViewport = page.getViewport({ scale: 1 });
        const scale = Math.min(
          Math.max(containerWidth / baseViewport.width, 1),
          MAX_RENDER_SCALE
        );
        const cacheKey = renderCacheKey(pageNumber, scale);
        const cached = renderCacheRef.current.get(cacheKey);

        if (cached) {
          drawCached(cached);
          if (!cancelled) setIsRendering(false);
          return;
        }

        setIsRendering(true);

        const viewport = page.getViewport({ scale });
        const offscreen = document.createElement("canvas");
        offscreen.width = viewport.width;
        offscreen.height = viewport.height;
        const offscreenCtx = offscreen.getContext("2d");
        if (!offscreenCtx || cancelled) return;

        await page.render({
          canvasContext: offscreenCtx,
          viewport,
        }).promise;

        if (cancelled) return;

        const bitmap = await createImageBitmap(offscreen);
        const entry: CachedRender = {
          width: viewport.width,
          height: viewport.height,
          bitmap,
        };

        renderCacheRef.current.set(cacheKey, entry);
        trimRenderCache(renderCacheRef.current);
        drawCached(entry);
      } catch {
        /* non-fatal */
      } finally {
        if (!cancelled) setIsRendering(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, pdf, pageNumber]);

  return (
    <AnimatePresence>
      {open && state ? (
        <motion.div
          key="page-preview-modal"
          className="fixed inset-0 z-[100] overscroll-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            role="presentation"
            className="absolute inset-0 overscroll-none bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />
          <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center overscroll-none p-3 sm:p-6">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="page-preview-modal-title"
              className="pointer-events-auto flex h-[min(92vh,900px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/[0.12] bg-[#120818] shadow-2xl"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] px-4 py-3 sm:px-5 sm:py-4">
                <div className="min-w-0">
                  <h2
                    id="page-preview-modal-title"
                    className="truncate text-base font-semibold text-white sm:text-lg"
                  >
                    {state.rangeLabel}
                  </h2>
                  <p className="mt-0.5 text-xs text-text-secondary sm:text-sm">
                    Page {pageNumber}
                    {pages.length > 1
                      ? ` · ${pageIndex + 1} of ${pages.length} in this range`
                      : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 rounded-lg p-2 text-text-secondary transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Close preview"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div
                ref={scrollRef}
                className="relative min-h-0 flex-1 overflow-auto overscroll-contain bg-white/[0.03] p-4 sm:p-6"
              >
                {isRendering ? (
                  <div
                    className="pointer-events-none absolute right-5 top-5 z-[1] inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-xs text-white/90"
                    aria-live="polite"
                  >
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    Loading…
                  </div>
                ) : null}
                <canvas
                  ref={canvasRef}
                  role="img"
                  aria-label={`Full preview of page ${pageNumber}`}
                  className={cn(
                    "mx-auto block h-auto max-w-full shadow-card transition-opacity duration-150",
                    isRendering ? "opacity-80" : "opacity-100"
                  )}
                />
              </div>

              {pages.length > 1 ? (
                <div className="flex items-center justify-between gap-3 border-t border-white/[0.08] px-4 py-3 sm:px-5">
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={!canGoPrev}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden />
                    Previous
                  </button>
                  <p className="hidden text-xs text-text-secondary sm:block sm:text-sm">
                    Use arrow keys to move between pages
                  </p>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canGoNext}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-40"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              ) : null}
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

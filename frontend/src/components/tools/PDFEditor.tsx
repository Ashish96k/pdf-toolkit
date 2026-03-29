"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";
import {
  Canvas,
  FabricImage,
  Group,
  IText,
  Line,
  PencilBrush,
  Polygon,
  Rect,
  StaticCanvas,
} from "fabric";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
} from "lucide-react";
import {
  EditorToolbar,
  type EditorTool,
  type ShapeKind,
} from "@/components/tools/EditorToolbar";
import { SignatureModal } from "@/components/tools/SignatureModal";
import { trackToolUsed } from "@/lib/analytics";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

const RENDER_SCALE = 1.5;

const HIGHLIGHT_FILL = "rgba(255, 255, 0, 0.35)";

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1];
  if (!base64) return new Uint8Array();
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function fabricJsonHasObjects(json: Record<string, unknown>): boolean {
  const objects = json.objects;
  return Array.isArray(objects) && objects.length > 0;
}

function buildArrow(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  strokeWidth: number
): Group {
  const headLen = 18;
  const headWidth = 10;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const ux = Math.cos(angle);
  const uy = Math.sin(angle);
  const bx = x2 - headLen * ux;
  const by = y2 - headLen * uy;
  const px = -uy;
  const py = ux;
  const lx = bx + headWidth * px;
  const ly = by + headWidth * py;
  const rx = bx - headWidth * px;
  const ry = by - headWidth * py;
  const shaft = new Line([x1, y1, bx, by], {
    stroke: color,
    strokeWidth,
    strokeLineCap: "round",
  });
  const head = new Polygon(
    [
      { x: x2, y: y2 },
      { x: lx, y: ly },
      { x: rx, y: ry },
    ],
    { fill: color, stroke: color, strokeWidth: 1 }
  );
  return new Group([shaft, head], { selectable: true, subTargetCheck: true });
}

export type PDFEditorProps = {
  file: File;
  onExported: (blobUrl: string) => void;
  /** GA4 `tool_used` — same value as `tool_name` on download events. */
  analyticsToolName?: string;
};

export default function PDFEditor({
  file,
  onExported,
  analyticsToolName,
}: PDFEditorProps) {
  const [numPages, setNumPages] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [pageRendering, setPageRendering] = useState(false);
  const [canvasVersion, setCanvasVersion] = useState(0);

  const [activeTool, setActiveTool] = useState<EditorTool>("select");
  const activeToolRef = useRef(activeTool);
  activeToolRef.current = activeTool;

  const [shapeKind, setShapeKind] = useState<ShapeKind>("rectangle");
  const shapeKindRef = useRef(shapeKind);
  shapeKindRef.current = shapeKind;

  const [drawColor, setDrawColor] = useState("#e63946");
  const [drawWidth, setDrawWidth] = useState(4);
  const drawColorRef = useRef(drawColor);
  const drawWidthRef = useRef(drawWidth);
  drawColorRef.current = drawColor;
  drawWidthRef.current = drawWidth;

  const [textFontSize, setTextFontSize] = useState(18);
  const [textColor, setTextColor] = useState("#ffffff");
  const textFontSizeRef = useRef(textFontSize);
  const textColorRef = useRef(textColor);
  textFontSizeRef.current = textFontSize;
  textColorRef.current = textColor;

  const [shapeStrokeColor, setShapeStrokeColor] = useState("#e63946");
  const [shapeStrokeWidth, setShapeStrokeWidth] = useState(3);
  const shapeStrokeColorRef = useRef(shapeStrokeColor);
  const shapeStrokeWidthRef = useRef(shapeStrokeWidth);
  shapeStrokeColorRef.current = shapeStrokeColor;
  shapeStrokeWidthRef.current = shapeStrokeWidth;

  const [signatureOpen, setSignatureOpen] = useState(false);

  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const pdfBytesRef = useRef<ArrayBuffer | null>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const fabricJsonByPageRef = useRef<Map<number, Record<string, unknown>>>(
    new Map()
  );
  const pageSizeRef = useRef<Map<number, { width: number; height: number }>>(
    new Map()
  );
  const imageInputRef = useRef<HTMLInputElement>(null);

  const saveCurrentFabricToMap = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const idx = pageNum - 1;
    fabricJsonByPageRef.current.set(idx, canvas.toJSON() as Record<string, unknown>);
  }, [pageNum]);

  useEffect(() => {
    let cancelled = false;
    setPdfLoading(true);
    setLoadError(null);

    (async () => {
      try {
        const buf = await file.arrayBuffer();
        if (cancelled) return;
        pdfBytesRef.current = buf;
        const task = pdfjsLib.getDocument({ data: new Uint8Array(buf) });
        const pdf = await task.promise;
        if (cancelled) return;
        pdfDocRef.current = pdf;
        fabricJsonByPageRef.current.clear();
        pageSizeRef.current.clear();
        setNumPages(pdf.numPages);
        setPageNum(1);
      } catch (e) {
        if (!cancelled) {
          setLoadError(
            e instanceof Error ? e.message : "Could not load this PDF."
          );
        }
      } finally {
        if (!cancelled) setPdfLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      pdfDocRef.current = null;
    };
  }, [file]);

  useEffect(() => {
    const pdf = pdfDocRef.current;
    const pdfCanvas = pdfCanvasRef.current;
    const fabricEl = fabricCanvasRef.current;
    if (!pdf || !pdfCanvas || !fabricEl || numPages === 0 || pdfLoading) {
      return;
    }

    let alive = true;

    (async () => {
      setPageRendering(true);

      const prevFabric = fabricRef.current;
      if (prevFabric) {
        await prevFabric.dispose();
        fabricRef.current = null;
      }

      const page = await pdf.getPage(pageNum);
      if (!alive) return;

      const viewport = page.getViewport({ scale: RENDER_SCALE });
      const w = Math.floor(viewport.width);
      const h = Math.floor(viewport.height);

      pageSizeRef.current.set(pageNum - 1, { width: w, height: h });

      pdfCanvas.width = w;
      pdfCanvas.height = h;
      pdfCanvas.style.width = `${w}px`;
      pdfCanvas.style.height = `${h}px`;

      const ctx = pdfCanvas.getContext("2d");
      if (!ctx) {
        setPageRendering(false);
        return;
      }

      await page.render({ canvasContext: ctx, viewport }).promise;
      if (!alive) return;

      fabricEl.width = w;
      fabricEl.height = h;
      fabricEl.style.width = `${w}px`;
      fabricEl.style.height = `${h}px`;

      const fabricCanvas = new Canvas(fabricEl, {
        width: w,
        height: h,
        backgroundColor: "transparent",
        preserveObjectStacking: true,
      });

      fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas);
      fabricCanvas.freeDrawingBrush.width = drawWidthRef.current;
      fabricCanvas.freeDrawingBrush.color = drawColorRef.current;

      const saved = fabricJsonByPageRef.current.get(pageNum - 1);
      if (saved && fabricJsonHasObjects(saved)) {
        await fabricCanvas.loadFromJSON(saved);
      }

      applyToolMode(fabricCanvas, activeToolRef.current);
      fabricRef.current = fabricCanvas;
      fabricCanvas.requestRenderAll();
      setPageRendering(false);
      setCanvasVersion((v) => v + 1);
    })();

    return () => {
      alive = false;
    };
  }, [file, numPages, pageNum, pdfLoading]);

  function applyToolMode(canvas: Canvas, tool: EditorTool) {
    const isDraw = tool === "draw";
    canvas.isDrawingMode = isDraw;
    canvas.selection =
      tool === "select" || tool === "eraser" || tool === "textBox";
    switch (tool) {
      case "draw":
        canvas.defaultCursor = "crosshair";
        canvas.hoverCursor = "crosshair";
        break;
      case "highlight":
      case "shape":
        canvas.defaultCursor = "crosshair";
        canvas.hoverCursor = "crosshair";
        break;
      case "textBox":
        canvas.defaultCursor = "text";
        canvas.hoverCursor = "text";
        break;
      case "eraser":
        canvas.defaultCursor = "cell";
        canvas.hoverCursor = "cell";
        break;
      default:
        canvas.defaultCursor = "default";
        canvas.hoverCursor = "move";
    }
    if (isDraw) {
      canvas.freeDrawingBrush = new PencilBrush(canvas);
      canvas.freeDrawingBrush.width = drawWidthRef.current;
      canvas.freeDrawingBrush.color = drawColorRef.current;
    }
  }

  useEffect(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    applyToolMode(fc, activeTool);
    fc.requestRenderAll();
  }, [activeTool, canvasVersion]);

  useEffect(() => {
    const fc = fabricRef.current;
    if (!fc || activeTool !== "draw") return;
    fc.freeDrawingBrush = new PencilBrush(fc);
    fc.freeDrawingBrush.width = drawWidth;
    fc.freeDrawingBrush.color = drawColor;
    fc.requestRenderAll();
  }, [drawColor, drawWidth, activeTool, canvasVersion]);

  useEffect(() => {
    return () => {
      const fc = fabricRef.current;
      fabricRef.current = null;
      void fc?.dispose();
    };
  }, []);

  useEffect(() => {
    const c = fabricRef.current;
    if (!c || pdfLoading || pageRendering) return;

    let isDown = false;
    let origX = 0;
    let origY = 0;
    let currentRect: Rect | null = null;
    let previewLine: Line | null = null;

    const onMouseDown = (opt: {
      e?: Event;
      target?: unknown;
    }) => {
      const tool = activeToolRef.current;
      const canvas = c;
      const e = opt.e as MouseEvent | undefined;
      if (e && e.button !== undefined && e.button !== 0) return;

      const p = canvas.getScenePoint(opt.e as MouseEvent);
      const target = opt.target;

      if (tool === "eraser" && target) {
        canvas.remove(target as never);
        canvas.requestRenderAll();
        return;
      }

      if ((tool === "highlight" || tool === "shape") && target) {
        return;
      }

      if (tool === "textBox" && !target) {
        const text = new IText("Edit text", {
          left: p.x,
          top: p.y,
          fill: textColorRef.current,
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: textFontSizeRef.current,
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.requestRenderAll();
        setActiveTool("select");
        applyToolMode(canvas, "select");
        return;
      }

      if (tool === "highlight") {
        isDown = true;
        origX = p.x;
        origY = p.y;
        currentRect = new Rect({
          left: origX,
          top: origY,
          width: 0,
          height: 0,
          fill: HIGHLIGHT_FILL,
          stroke: undefined,
          selectable: true,
          evented: true,
        });
        canvas.add(currentRect);
        canvas.requestRenderAll();
        return;
      }

      if (tool === "shape") {
        isDown = true;
        origX = p.x;
        origY = p.y;
        if (shapeKindRef.current === "rectangle") {
          currentRect = new Rect({
            left: origX,
            top: origY,
            width: 0,
            height: 0,
            fill: "transparent",
            stroke: shapeStrokeColorRef.current,
            strokeWidth: shapeStrokeWidthRef.current,
            selectable: true,
          });
          canvas.add(currentRect);
        } else {
          previewLine = new Line([origX, origY, origX, origY], {
            stroke: shapeStrokeColorRef.current,
            strokeWidth: shapeStrokeWidthRef.current,
            strokeLineCap: "round",
          });
          canvas.add(previewLine);
        }
        canvas.requestRenderAll();
      }
    };

    const onMouseMove = (opt: { e?: Event }) => {
      const tool = activeToolRef.current;
      if (!isDown) return;
      const p = c.getScenePoint(opt.e as MouseEvent);

      if (tool === "highlight" && currentRect) {
        currentRect.set({
          width: Math.abs(p.x - origX),
          height: Math.abs(p.y - origY),
          left: Math.min(origX, p.x),
          top: Math.min(origY, p.y),
        });
        c.requestRenderAll();
        return;
      }

      if (tool === "shape" && shapeKindRef.current === "rectangle" && currentRect) {
        currentRect.set({
          width: Math.abs(p.x - origX),
          height: Math.abs(p.y - origY),
          left: Math.min(origX, p.x),
          top: Math.min(origY, p.y),
        });
        c.requestRenderAll();
        return;
      }

      if (tool === "shape" && shapeKindRef.current === "arrow" && previewLine) {
        previewLine.set({ x2: p.x, y2: p.y });
        previewLine.setCoords();
        c.requestRenderAll();
      }
    };

    const onMouseUp = () => {
      const tool = activeToolRef.current;
      if (!isDown) return;
      isDown = false;

      if (tool === "shape" && shapeKindRef.current === "arrow" && previewLine) {
        const x1 = previewLine.x1 ?? origX;
        const y1 = previewLine.y1 ?? origY;
        const x2 = previewLine.x2 ?? origX;
        const y2 = previewLine.y2 ?? origY;
        c.remove(previewLine);
        previewLine = null;
        const dist = Math.hypot(x2 - x1, y2 - y1);
        if (dist > 4) {
          const arrow = buildArrow(
            x1,
            y1,
            x2,
            y2,
            shapeStrokeColorRef.current,
            shapeStrokeWidthRef.current
          );
          c.add(arrow);
        }
        c.requestRenderAll();
        return;
      }

      currentRect = null;
      previewLine = null;
    };

    c.on("mouse:down", onMouseDown);
    c.on("mouse:move", onMouseMove);
    c.on("mouse:up", onMouseUp);

    return () => {
      c.off("mouse:down", onMouseDown);
      c.off("mouse:move", onMouseMove);
      c.off("mouse:up", onMouseUp);
    };
  }, [canvasVersion, pdfLoading, pageRendering]);

  const goPrev = () => {
    if (pageNum <= 1) return;
    saveCurrentFabricToMap();
    setPageNum((p) => p - 1);
  };

  const goNext = () => {
    if (pageNum >= numPages) return;
    saveCurrentFabricToMap();
    setPageNum((p) => p + 1);
  };

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f || !f.type.startsWith("image/")) return;
    const fc = fabricRef.current;
    if (!fc) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      void FabricImage.fromURL(url).then((img) => {
        img.set({ left: 60, top: 80 });
        img.scaleToWidth(Math.min(200, fc.getWidth() - 80));
        fc.add(img);
        fc.setActiveObject(img);
        fc.requestRenderAll();
      });
    };
    reader.readAsDataURL(f);
    setActiveTool("select");
    if (fabricRef.current) applyToolMode(fabricRef.current, "select");
  };

  const onSignatureConfirm = (dataUrl: string) => {
    const fc = fabricRef.current;
    if (!fc) return;
    void FabricImage.fromURL(dataUrl).then((img) => {
      img.set({ left: 80, top: 120 });
      img.scaleToWidth(Math.min(220, fc.getWidth() - 100));
      fc.add(img);
      fc.setActiveObject(img);
      fc.requestRenderAll();
    });
    setActiveTool("select");
    if (fabricRef.current) applyToolMode(fabricRef.current, "select");
  };

  const handleExport = async () => {
    const bytes = pdfBytesRef.current;
    if (!bytes || exporting) return;

    if (analyticsToolName) trackToolUsed(analyticsToolName);
    saveCurrentFabricToMap();
    setExporting(true);
    try {
      const pdfDoc = await PDFDocument.load(bytes);
      const pages = pdfDoc.getPages();

      for (let i = 0; i < pages.length; i++) {
        const json = fabricJsonByPageRef.current.get(i);
        if (!json || !fabricJsonHasObjects(json)) continue;

        const size = pageSizeRef.current.get(i);
        if (!size) continue;

        const el = document.createElement("canvas");
        const staticCanvas = new StaticCanvas(el, {
          width: size.width,
          height: size.height,
          backgroundColor: "transparent",
        });
        await staticCanvas.loadFromJSON(json);
        const dataUrl = staticCanvas.toDataURL({ format: "png", multiplier: 1 });
        await staticCanvas.dispose();

        const pngBytes = dataUrlToUint8Array(dataUrl);
        if (pngBytes.length === 0) continue;

        const pngImage = await pdfDoc.embedPng(pngBytes);
        const page = pages[i];
        const { width, height } = page.getSize();
        page.drawImage(pngImage, {
          x: 0,
          y: 0,
          width,
          height,
        });
      }

      const out = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(out)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      onExported(url);
    } catch (err) {
      console.error(err);
      setLoadError(
        err instanceof Error ? err.message : "Export failed. Try again."
      );
    } finally {
      setExporting(false);
    }
  };

  if (loadError && !pdfLoading) {
    return (
      <p className="text-sm text-primary-light" role="alert">
        {loadError}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="glass-card rounded-2xl border border-white/[0.08] p-4">
        <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              disabled={pageNum <= 1 || pdfLoading || pageRendering}
              className="rounded-xl border border-white/[0.12] bg-white/[0.04] p-2 text-white transition-colors hover:bg-white/[0.08] disabled:pointer-events-none disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="min-w-[5rem] text-center text-sm tabular-nums text-text-secondary">
              {pdfLoading ? "—" : `${pageNum} / ${numPages || 1}`}
            </span>
            <button
              type="button"
              onClick={goNext}
              disabled={pageNum >= numPages || pdfLoading || pageRendering}
              className="rounded-xl border border-white/[0.12] bg-white/[0.04] p-2 text-white transition-colors hover:bg-white/[0.08] disabled:pointer-events-none disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative flex min-h-[min(70vh,800px)] justify-center gap-3 overflow-auto rounded-xl bg-black/20 p-4 pl-2 sm:pl-4">
          {!pdfLoading && !pageRendering ? (
            <EditorToolbar
              activeTool={activeTool}
              onToolChange={(t) => {
                setActiveTool(t);
                const fc = fabricRef.current;
                if (fc) applyToolMode(fc, t);
              }}
              shapeKind={shapeKind}
              onShapeKindChange={setShapeKind}
              drawColor={drawColor}
              onDrawColorChange={setDrawColor}
              drawWidth={drawWidth}
              onDrawWidthChange={setDrawWidth}
              textFontSize={textFontSize}
              onTextFontSizeChange={setTextFontSize}
              textColor={textColor}
              onTextColorChange={setTextColor}
              shapeStrokeColor={shapeStrokeColor}
              onShapeStrokeColorChange={setShapeStrokeColor}
              shapeStrokeWidth={shapeStrokeWidth}
              onShapeStrokeWidthChange={setShapeStrokeWidth}
              onImagePick={() => imageInputRef.current?.click()}
              onSignatureOpen={() => setSignatureOpen(true)}
            />
          ) : null}

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPickImage}
          />

          <div className="flex min-w-0 flex-1 justify-center overflow-auto pl-2">
            {pdfLoading || pageRendering ? (
              <div className="flex min-h-[320px] w-full items-center justify-center gap-2 text-text-secondary">
                <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
                <span className="text-sm">
                  {pdfLoading ? "Loading PDF…" : "Rendering page…"}
                </span>
              </div>
            ) : (
              <div className="relative inline-block max-w-full shadow-2xl">
                <canvas
                  ref={pdfCanvasRef}
                  className="block max-w-full rounded-lg bg-white"
                />
                <canvas
                  ref={fabricCanvasRef}
                  className="absolute left-0 top-0 block max-w-full rounded-lg"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => void handleExport()}
        disabled={pdfLoading || exporting || numPages === 0}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-white shadow-card transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#080010] disabled:pointer-events-none disabled:opacity-40"
      >
        {exporting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Exporting…
          </>
        ) : (
          <>
            <Download className="h-5 w-5" aria-hidden />
            Export edited PDF
          </>
        )}
      </button>

      <SignatureModal
        open={signatureOpen}
        onClose={() => {
          setSignatureOpen(false);
          setActiveTool("select");
          const fc = fabricRef.current;
          if (fc) applyToolMode(fc, "select");
        }}
        onConfirm={(dataUrl) => {
          onSignatureConfirm(dataUrl);
        }}
      />
    </div>
  );
}

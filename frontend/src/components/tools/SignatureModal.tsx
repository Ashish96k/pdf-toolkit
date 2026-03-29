"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const SIGNATURE_FONTS = [
  { id: "dancing", label: "Dancing Script", family: '"Dancing Script", cursive' },
  { id: "great", label: "Great Vibes", family: '"Great Vibes", cursive' },
  { id: "pacifico", label: "Pacifico", family: '"Pacifico", cursive' },
] as const;

function loadSignatureFonts(): void {
  const id = "pdf-toolkit-signature-fonts";
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Dancing+Script&family=Great+Vibes&family=Pacifico&display=swap";
  document.head.appendChild(link);
}

export type SignatureModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (dataUrl: string) => void;
};

export function SignatureModal({ open, onClose, onConfirm }: SignatureModalProps) {
  const [tab, setTab] = useState<"draw" | "type">("draw");
  const [typedText, setTypedText] = useState("");
  const [fontId, setFontId] = useState<(typeof SIGNATURE_FONTS)[number]["id"]>(
    "dancing"
  );

  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (open) loadSignatureFonts();
  }, [open]);

  const clearDrawCanvas = useCallback(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    if (!open || tab !== "draw") return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = 400;
    const h = 160;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [open, tab]);

  const getDrawCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0]?.clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0]?.clientY : e.clientY;
    if (clientX === undefined || clientY === undefined) return null;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const p = getDrawCoords(e);
    if (!p) return;
    drawingRef.current = true;
    lastPointRef.current = p;
  };

  const moveDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const p = getDrawCoords(e);
    if (!p) return;
    const canvas = drawCanvasRef.current;
    const last = lastPointRef.current;
    if (!canvas || !last) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastPointRef.current = p;
  };

  const endDraw = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  const rasterizeTypedSignature = async (): Promise<string | null> => {
    const text = typedText.trim();
    if (!text) return null;
    const font = SIGNATURE_FONTS.find((f) => f.id === fontId) ?? SIGNATURE_FONTS[0];
    try {
      await document.fonts.load(`48px ${font.family}`);
    } catch {
      /* ignore */
    }
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const fontSize = 42;
    ctx.font = `${fontSize}px ${font.family}`;
    const metrics = ctx.measureText(text);
    const pad = 24;
    const w = Math.ceil(metrics.width + pad * 2);
    const h = Math.ceil(fontSize * 1.4 + pad);
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#111111";
    ctx.font = `${fontSize}px ${font.family}`;
    ctx.textBaseline = "middle";
    ctx.fillText(text, pad, h / 2);
    return canvas.toDataURL("image/png");
  };

  const handleConfirm = () => {
    void (async () => {
      if (tab === "draw") {
        const canvas = drawCanvasRef.current;
        if (!canvas) return;
        onConfirm(canvas.toDataURL("image/png"));
      } else {
        const url = await rasterizeTypedSignature();
        if (!url) return;
        onConfirm(url);
      }
      onClose();
    })();
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="signature-modal"
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            role="presentation"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="absolute inset-0 z-[1] flex items-center justify-center p-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="signature-modal-title"
              className="pointer-events-auto w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.12] bg-[#120818] shadow-2xl"
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
                <h2
                  id="signature-modal-title"
                  className="text-lg font-semibold text-white"
                >
                  Add signature
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-white/[0.06] hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex gap-1 border-b border-white/[0.08] px-4 pt-3">
                <button
                  type="button"
                  onClick={() => setTab("draw")}
                  className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                    tab === "draw"
                      ? "bg-primary text-white"
                      : "text-text-secondary hover:text-white"
                  }`}
                >
                  Draw
                </button>
                <button
                  type="button"
                  onClick={() => setTab("type")}
                  className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                    tab === "type"
                      ? "bg-primary text-white"
                      : "text-text-secondary hover:text-white"
                  }`}
                >
                  Type
                </button>
              </div>

              <div className="p-5">
                {tab === "draw" ? (
                  <div className="space-y-3">
                    <p className="text-sm text-text-secondary">
                      Draw your signature in the box below.
                    </p>
                    <div className="overflow-hidden rounded-xl border border-white/[0.12] bg-white">
                      <canvas
                        ref={drawCanvasRef}
                        className="block w-full touch-none cursor-crosshair"
                        onMouseDown={startDraw}
                        onMouseMove={moveDraw}
                        onMouseUp={endDraw}
                        onMouseLeave={endDraw}
                        onTouchStart={startDraw}
                        onTouchMove={moveDraw}
                        onTouchEnd={endDraw}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={clearDrawCanvas}
                      className="rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/[0.08]"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <label className="block text-sm text-text-secondary">
                      Your name
                      <input
                        type="text"
                        value={typedText}
                        onChange={(e) => setTypedText(e.target.value)}
                        placeholder="Type your signature"
                        className="mt-2 w-full rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-text-muted focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </label>
                    <div>
                      <span className="text-sm text-text-secondary">Font</span>
                      <div className="mt-2 flex flex-col gap-2">
                        {SIGNATURE_FONTS.map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setFontId(f.id)}
                            className={`rounded-xl border px-4 py-3 text-left text-lg transition-colors ${
                              fontId === f.id
                                ? "border-primary bg-primary/15 text-white"
                                : "border-white/[0.08] bg-white/[0.03] text-white/80 hover:bg-white/[0.06]"
                            }`}
                            style={{ fontFamily: f.family }}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-white/[0.08] px-5 py-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-text-secondary hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-primary-dark"
                >
                  Place signature
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

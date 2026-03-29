"use client";

import {
  Eraser,
  Highlighter,
  ImagePlus,
  MousePointer2,
  Pencil,
  PenLine,
  Shapes,
  Square,
  Type,
} from "lucide-react";
import { clsx } from "clsx";

export type EditorTool =
  | "select"
  | "textBox"
  | "draw"
  | "highlight"
  | "shape"
  | "image"
  | "signature"
  | "eraser";

export type ShapeKind = "rectangle" | "arrow";

type ToolbarButtonProps = {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function ToolbarButton({ label, active, onClick, children }: ToolbarButtonProps) {
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-pressed={active}
        className={clsx(
          "flex h-11 w-11 items-center justify-center rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white",
          active
            ? "border-primary bg-primary text-white shadow-md"
            : "border-neutral-200 bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
        )}
      >
        {children}
      </button>
      <span
        className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg border border-neutral-200 bg-neutral-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
        role="tooltip"
      >
        {label}
      </span>
    </div>
  );
}

export type EditorToolbarProps = {
  activeTool: EditorTool;
  onToolChange: (tool: EditorTool) => void;
  shapeKind: ShapeKind;
  onShapeKindChange: (kind: ShapeKind) => void;
  drawColor: string;
  onDrawColorChange: (c: string) => void;
  drawWidth: number;
  onDrawWidthChange: (w: number) => void;
  textFontSize: number;
  onTextFontSizeChange: (n: number) => void;
  textColor: string;
  onTextColorChange: (c: string) => void;
  shapeStrokeColor: string;
  onShapeStrokeColorChange: (c: string) => void;
  shapeStrokeWidth: number;
  onShapeStrokeWidthChange: (w: number) => void;
  onImagePick: () => void;
  onSignatureOpen: () => void;
};

export function EditorToolbar({
  activeTool,
  onToolChange,
  shapeKind,
  onShapeKindChange,
  drawColor,
  onDrawColorChange,
  drawWidth,
  onDrawWidthChange,
  textFontSize,
  onTextFontSizeChange,
  textColor,
  onTextColorChange,
  shapeStrokeColor,
  onShapeStrokeColorChange,
  shapeStrokeWidth,
  onShapeStrokeWidthChange,
  onImagePick,
  onSignatureOpen,
}: EditorToolbarProps) {
  return (
    <div className="pointer-events-auto flex shrink-0 flex-col gap-2">
      <nav
        className="flex flex-col gap-1.5 rounded-2xl border border-neutral-200 bg-white/95 p-2 shadow-xl backdrop-blur-sm"
        aria-label="PDF editor tools"
      >
        <ToolbarButton
          label="Select / Move"
          active={activeTool === "select"}
          onClick={() => onToolChange("select")}
        >
          <MousePointer2 className="h-5 w-5" strokeWidth={1.75} />
        </ToolbarButton>
        <ToolbarButton
          label="Text box"
          active={activeTool === "textBox"}
          onClick={() => onToolChange("textBox")}
        >
          <Type className="h-5 w-5" strokeWidth={1.75} />
        </ToolbarButton>
        <ToolbarButton
          label="Draw"
          active={activeTool === "draw"}
          onClick={() => onToolChange("draw")}
        >
          <Pencil className="h-5 w-5" strokeWidth={1.75} />
        </ToolbarButton>
        <ToolbarButton
          label="Highlight"
          active={activeTool === "highlight"}
          onClick={() => onToolChange("highlight")}
        >
          <Highlighter className="h-5 w-5" strokeWidth={1.75} />
        </ToolbarButton>
        <ToolbarButton
          label="Shape"
          active={activeTool === "shape"}
          onClick={() => onToolChange("shape")}
        >
          <Shapes className="h-5 w-5" strokeWidth={1.75} />
        </ToolbarButton>
        <ToolbarButton
          label="Image"
          active={activeTool === "image"}
          onClick={() => {
            onToolChange("image");
            onImagePick();
          }}
        >
          <ImagePlus className="h-5 w-5" strokeWidth={1.75} />
        </ToolbarButton>
        <ToolbarButton
          label="Signature"
          active={activeTool === "signature"}
          onClick={() => {
            onToolChange("signature");
            onSignatureOpen();
          }}
        >
          <PenLine className="h-5 w-5" strokeWidth={1.75} />
        </ToolbarButton>
        <ToolbarButton
          label="Eraser"
          active={activeTool === "eraser"}
          onClick={() => onToolChange("eraser")}
        >
          <Eraser className="h-5 w-5" strokeWidth={1.75} />
        </ToolbarButton>
      </nav>

      {activeTool === "draw" ? (
        <div className="w-14 space-y-2 rounded-2xl border border-neutral-200 bg-white/95 p-2 shadow-lg">
          <label className="block text-[10px] font-medium uppercase tracking-wide text-neutral-500">
            Color
          </label>
          <input
            type="color"
            value={drawColor}
            onChange={(e) => onDrawColorChange(e.target.value)}
            className="h-8 w-full cursor-pointer rounded border border-neutral-200"
            title="Stroke color"
          />
          <label className="block text-[10px] font-medium uppercase tracking-wide text-neutral-500">
            Width
          </label>
          <input
            type="range"
            min={1}
            max={24}
            value={drawWidth}
            onChange={(e) => onDrawWidthChange(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <span className="block text-center text-[10px] text-neutral-600">
            {drawWidth}px
          </span>
        </div>
      ) : null}

      {activeTool === "textBox" ? (
        <div className="w-14 space-y-2 rounded-2xl border border-neutral-200 bg-white/95 p-2 shadow-lg">
          <label className="block text-[10px] font-medium uppercase tracking-wide text-neutral-500">
            Size
          </label>
          <input
            type="number"
            min={8}
            max={96}
            value={textFontSize}
            onChange={(e) => onTextFontSizeChange(Number(e.target.value))}
            className="w-full rounded border border-neutral-200 px-1 py-1 text-xs text-neutral-800"
          />
          <label className="block text-[10px] font-medium uppercase tracking-wide text-neutral-500">
            Color
          </label>
          <input
            type="color"
            value={textColor}
            onChange={(e) => onTextColorChange(e.target.value)}
            className="h-8 w-full cursor-pointer rounded border border-neutral-200"
          />
        </div>
      ) : null}

      {activeTool === "shape" ? (
        <div className="w-14 space-y-2 rounded-2xl border border-neutral-200 bg-white/95 p-2 shadow-lg">
          <span className="block text-[10px] font-medium uppercase tracking-wide text-neutral-500">
            Type
          </span>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => onShapeKindChange("rectangle")}
              className={clsx(
                "flex h-9 w-full items-center justify-center rounded-lg border text-neutral-600 transition-colors",
                shapeKind === "rectangle"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-neutral-200 bg-neutral-100 hover:bg-neutral-200"
              )}
              title="Rectangle"
            >
              <Square className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onShapeKindChange("arrow")}
              className={clsx(
                "flex h-9 w-full items-center justify-center rounded-lg border text-neutral-600 transition-colors",
                shapeKind === "arrow"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-neutral-200 bg-neutral-100 hover:bg-neutral-200"
              )}
              title="Arrow"
            >
              <span className="text-lg leading-none" aria-hidden>
                →
              </span>
            </button>
          </div>
          <label className="block text-[10px] font-medium uppercase tracking-wide text-neutral-500">
            Color
          </label>
          <input
            type="color"
            value={shapeStrokeColor}
            onChange={(e) => onShapeStrokeColorChange(e.target.value)}
            className="h-8 w-full cursor-pointer rounded border border-neutral-200"
          />
          <label className="block text-[10px] font-medium uppercase tracking-wide text-neutral-500">
            Width
          </label>
          <input
            type="range"
            min={1}
            max={16}
            value={shapeStrokeWidth}
            onChange={(e) => onShapeStrokeWidthChange(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
      ) : null}
    </div>
  );
}

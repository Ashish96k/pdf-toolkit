"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileText, GripVertical, X } from "lucide-react";

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(i > 0 ? 1 : 0))} ${sizes[i]}`;
}

type FileListBase = {
  files: File[];
  onRemove: (index: number) => void;
};

export type FileListProps =
  | (FileListBase & { reorderable?: false; onReorder?: undefined })
  | (FileListBase & {
      reorderable: true;
      onReorder: (fromIndex: number, toIndex: number) => void;
    });

export function FileList(props: FileListProps) {
  const { files, onRemove, reorderable = false } = props;
  const onReorder = reorderable ? props.onReorder : undefined;

  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const dragFromRef = useRef<number | null>(null);
  const dragOverRef = useRef<number | null>(null);

  useEffect(() => {
    if (dragFrom === null) return;

    const onMove = (e: PointerEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const row = el?.closest<HTMLElement>("[data-file-index]");
      if (!row) return;
      const idx = Number(row.dataset.fileIndex);
      if (!Number.isNaN(idx)) {
        dragOverRef.current = idx;
        setDragOver(idx);
      }
    };

    const endDrag = () => {
      const from = dragFromRef.current;
      const to = dragOverRef.current;
      if (onReorder && from !== null && to !== null && from !== to) {
        onReorder(from, to);
      }
      dragFromRef.current = null;
      dragOverRef.current = null;
      setDragFrom(null);
      setDragOver(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
  }, [dragFrom, onReorder]);

  return (
    <ul className="flex flex-col gap-3" aria-label="Selected files">
      {files.map((file, index) => {
        const isDragging = dragFrom === index;
        const isOver = reorderable && dragFrom !== null && dragOver === index;

        return (
          <motion.li
            key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
            data-file-index={index}
            layout={reorderable}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
              delay: index * 0.05,
            }}
            className={[
              "flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5 transition-all hover:bg-white/[0.05]",
              isOver && dragFrom !== index ? "ring-2 ring-primary/40" : "",
              isDragging ? "opacity-70" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {reorderable ? (
              <button
                type="button"
                aria-label={`Reorder ${file.name}`}
                className="touch-none cursor-grab rounded-lg p-1 text-text-muted transition-colors hover:bg-white/[0.06] active:cursor-grabbing"
                onPointerDown={(e) => {
                  e.preventDefault();
                  dragFromRef.current = index;
                  dragOverRef.current = index;
                  setDragFrom(index);
                  setDragOver(index);
                }}
              >
                <GripVertical className="h-5 w-5" aria-hidden />
              </button>
            ) : null}
            <div
              className="icon-badge-red !h-9 !w-9 shrink-0"
              aria-hidden
            >
              <FileText className="h-5 w-5 text-primary" strokeWidth={1.75} />
            </div>
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-white/85">
              {file.name}
            </p>
            <p className="ml-auto shrink-0 text-xs text-text-muted">
              {formatFileSize(file.size)}
            </p>
            <button
              type="button"
              onClick={() => onRemove(index)}
              aria-label={`Remove ${file.name}`}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-secondary transition-all hover:bg-primary/15 hover:text-primary"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </motion.li>
        );
      })}
    </ul>
  );
}

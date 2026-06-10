"use client";

import { useMemo, useRef } from "react";
import {
  Reorder,
  motion,
  useDragControls,
} from "framer-motion";
import { FileText, GripVertical, X } from "lucide-react";

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(i > 0 ? 1 : 0))} ${sizes[i]}`;
}

type FileEntry = {
  id: string;
  file: File;
};

function useFileEntries(files: File[]): FileEntry[] {
  const idMapRef = useRef(new WeakMap<File, string>());
  const counterRef = useRef(0);

  return useMemo(
    () =>
      files.map((file) => {
        let id = idMapRef.current.get(file);
        if (!id) {
          id = `file-${++counterRef.current}`;
          idMapRef.current.set(file, id);
        }
        return { id, file };
      }),
    [files]
  );
}

const rowClassName =
  "flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5";

const springTransition = {
  type: "spring" as const,
  stiffness: 520,
  damping: 38,
  mass: 0.85,
};

type FileListBase = {
  files: File[];
  onRemove: (index: number) => void;
};

export type FileListProps =
  | (FileListBase & { reorderable?: false; onReorder?: undefined })
  | (FileListBase & {
      reorderable: true;
      onReorder: (files: File[]) => void;
    });

type FileRowContentProps = {
  file: File;
  index: number;
  reorderable: boolean;
  onRemove: (index: number) => void;
  dragControls?: ReturnType<typeof useDragControls>;
};

function FileRowContent({
  file,
  index,
  reorderable,
  onRemove,
  dragControls,
}: FileRowContentProps) {
  return (
    <>
      {reorderable && dragControls ? (
        <button
          type="button"
          aria-label={`Reorder ${file.name}`}
          className="touch-none cursor-grab rounded-lg p-1 text-text-muted transition-colors hover:bg-white/[0.06] active:cursor-grabbing"
          onPointerDown={(e) => {
            e.preventDefault();
            dragControls.start(e);
          }}
        >
          <GripVertical className="h-5 w-5" aria-hidden />
        </button>
      ) : null}
      <div className="icon-badge-red !h-9 !w-9 shrink-0" aria-hidden>
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
    </>
  );
}

function ReorderableFileRow({
  entry,
  index,
  onRemove,
}: {
  entry: FileEntry;
  index: number;
  onRemove: (index: number) => void;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      as="li"
      value={entry}
      dragListener={false}
      dragControls={dragControls}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
      whileDrag={{
        scale: 1.02,
        zIndex: 20,
        boxShadow: "0 18px 48px rgba(0, 0, 0, 0.45)",
        borderColor: "rgba(230, 57, 70, 0.45)",
        backgroundColor: "rgba(255, 255, 255, 0.07)",
      }}
      className={`${rowClassName} cursor-default select-none`}
      style={{ position: "relative" }}
    >
      <FileRowContent
        file={entry.file}
        index={index}
        reorderable
        onRemove={onRemove}
        dragControls={dragControls}
      />
    </Reorder.Item>
  );
}

export function FileList(props: FileListProps) {
  const { files, onRemove } = props;
  const entries = useFileEntries(files);

  if (props.reorderable) {
    const { onReorder } = props;

    return (
      <Reorder.Group
        as="ul"
        axis="y"
        values={entries}
        onReorder={(next) => onReorder(next.map((entry) => entry.file))}
        className="flex flex-col gap-3"
        aria-label="Selected files"
        layoutScroll
      >
        {entries.map((entry, index) => (
          <ReorderableFileRow
            key={entry.id}
            entry={entry}
            index={index}
            onRemove={onRemove}
          />
        ))}
      </Reorder.Group>
    );
  }

  return (
    <ul className="flex flex-col gap-3" aria-label="Selected files">
      {files.map((file, index) => (
        <motion.li
          key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.25,
            ease: "easeOut",
            delay: index * 0.05,
          }}
          className={`${rowClassName} hover:bg-white/[0.05]`}
        >
          <FileRowContent
            file={file}
            index={index}
            reorderable={false}
            onRemove={onRemove}
          />
        </motion.li>
      ))}
    </ul>
  );
}

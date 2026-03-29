"use client";

import { useCallback, useId, useMemo, useState } from "react";
import { useDropzone, type Accept, type FileRejection } from "react-dropzone";
import { motion } from "framer-motion";
import { CloudUpload } from "lucide-react";

const DEFAULT_MAX_SIZE = 50 * 1024 * 1024;

function mimeTypesToAccept(accept: string): Accept {
  const types = accept
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const result: Accept = {};
  for (const mime of types) {
    if (mime.includes("/")) {
      result[mime] = [];
    }
  }
  return Object.keys(result).length > 0
    ? result
    : { "application/pdf": [".pdf"] };
}

function formatMaxSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${Math.round(bytes / (1024 * 1024))}MB`;
  }
  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)}KB`;
  }
  return `${bytes} bytes`;
}

export interface UploadZoneProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onFiles: (files: File[]) => void;
}

export function UploadZone({
  accept = "application/pdf",
  multiple = false,
  maxSize = DEFAULT_MAX_SIZE,
  onFiles,
}: UploadZoneProps) {
  const inputId = useId();
  const [rejectMessage, setRejectMessage] = useState<string | null>(null);
  const acceptRecord = useMemo(() => mimeTypesToAccept(accept), [accept]);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setRejectMessage(null);
      if (fileRejections.length > 0) {
        const first = fileRejections[0]?.errors[0]?.message;
        setRejectMessage(first ?? "Some files were rejected.");
      }
      if (acceptedFiles.length > 0) {
        onFiles(multiple ? acceptedFiles : [acceptedFiles[0]]);
      }
    },
    [multiple, onFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptRecord,
    maxSize,
    multiple,
    noKeyboard: false,
  });

  const { ref, ...rootProps } = getRootProps();

  const inputProps = getInputProps({ id: inputId });

  const acceptLabel = accept.split(",").map((t) => t.trim()).join(", ");

  return (
    <div className="w-full">
      <div className="glass-card p-10">
        <motion.div
          className="origin-center"
          whileHover={{ scale: 1.005 }}
          animate={{ scale: isDragActive ? 1.01 : 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
        >
          <div
            {...rootProps}
            ref={ref}
            aria-label="Upload files. Press Enter or Space to choose files, or drag and drop."
            className="relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-16 text-center outline-none transition-[border-color,background-color] duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#080010]"
            style={{
              borderColor: isDragActive
                ? "rgba(230,57,70,0.6)"
                : "rgba(230,57,70,0.2)",
              backgroundColor: isDragActive
                ? "rgba(230,57,70,0.08)"
                : "rgba(230,57,70,0.03)",
            }}
          >
            <input {...inputProps} aria-describedby={`${inputId}-hint`} />
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(230,57,70,0.06), transparent 70%)",
              }}
              aria-hidden
            />
            <div className="relative z-10 flex flex-col items-center gap-5">
              <div
                className="icon-badge-red !h-[72px] !w-[72px] animate-float"
                aria-hidden
              >
                <CloudUpload
                  className="h-9 w-9 text-primary"
                  strokeWidth={1.75}
                />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-bold text-white">
                  {isDragActive
                    ? "Drop files here"
                    : "Drag & drop or click to upload"}
                </p>
                <p
                  id={`${inputId}-hint`}
                  className="text-sm text-text-secondary"
                >
                  Accepted: {acceptLabel} · Max {formatMaxSize(maxSize)} per file
                  {multiple ? " · Multiple files allowed" : ""}
                </p>
              </div>
              <span className="btn-red inline-flex items-center gap-2 rounded-pill px-6 py-2.5 text-sm">
                <CloudUpload className="h-4 w-4 shrink-0" strokeWidth={2} />
                Browse files
              </span>
            </div>
          </div>
        </motion.div>
      </div>
      {rejectMessage ? (
        <p className="mt-3 text-sm text-primary-light" role="alert">
          {rejectMessage}
        </p>
      ) : null}
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { trackFileDownloaded } from "@/lib/analytics";

export interface DownloadButtonProps {
  url: string;
  filename: string;
  /** GA4: `file_downloaded` event with `tool_name`. */
  toolName?: string;
}

async function triggerDownload(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Download failed");
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
}

export function DownloadButton({ url, filename, toolName }: DownloadButtonProps) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      onClick={() => {
        if (toolName) trackFileDownloaded(toolName);
        void triggerDownload(url, filename);
      }}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-white shadow-card transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <Download className="h-5 w-5" aria-hidden />
      Download
    </motion.button>
  );
}

"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { Download, FileType2, Pencil, Upload } from "lucide-react";
import { EditorSkeleton } from "@/components/tools/EditorSkeleton";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DownloadButton } from "@/components/ui/DownloadButton";
import { FileList } from "@/components/ui/FileList";
import { UploadZone } from "@/components/ui/UploadZone";
import { TOOL_PAGE_CONTENT } from "@/data/toolPageContent";

const content = TOOL_PAGE_CONTENT["edit-pdf"];
const howIcons = [Upload, Pencil, Download] as const;

const PDFEditor = dynamic(
  () => import("@/components/tools/PDFEditor"),
  { ssr: false, loading: () => <EditorSkeleton /> }
);

function editedFilename(originalName: string): string {
  const base = originalName.replace(/\.pdf$/i, "");
  return `${base || "document"}-edited.pdf`;
}

export function EditPDFClient() {
  const [file, setFile] = useState<File | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleExported = useCallback((url: string) => {
    setDownloadUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  }, []);

  const handleReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setFile(null);
  };

  return (
    <ToolPageLayout
      toolId="edit-pdf"
      title="Edit PDF online"
      subtitle="Annotate PDFs in the browser: draw, add text, and place images. Export merges your markup onto the original file—no server upload."
      howItWorksSteps={content.howToSteps.map((step, i) => ({
        ...step,
        icon: howIcons[i] ?? FileType2,
      }))}
      faqs={content.faqs}
    >
      <div className="flex flex-col gap-6">
        {!file ? (
          <UploadZone
            accept="application/pdf"
            multiple={false}
            onFiles={(picked) => setFile(picked[0] ?? null)}
          />
        ) : (
          <>
            <FileList
              files={[file]}
              onRemove={() => {
                handleReset();
              }}
            />
            <PDFEditor
              file={file}
              onExported={handleExported}
              analyticsToolName="Edit PDF"
            />
            {downloadUrl ? (
              <DownloadButton
                url={downloadUrl}
                filename={editedFilename(file.name)}
                toolName="Edit PDF"
              />
            ) : null}
            <button
              type="button"
              onClick={handleReset}
              className="w-full rounded-2xl border border-white/[0.12] bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white/90 transition-colors hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#080010]"
            >
              Start over
            </button>
          </>
        )}
      </div>
    </ToolPageLayout>
  );
}

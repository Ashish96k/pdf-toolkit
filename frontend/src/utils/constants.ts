export type ToolAccent =
  | "merge"
  | "split"
  | "compress"
  | "convert"
  | "edit";

export type ToolDefinition = {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: string;
  accent: ToolAccent;
};

export const TOOLS: ToolDefinition[] = [
  {
    id: "merge-pdf",
    title: "Merge PDF",
    description: "Combine multiple PDFs into a single file.",
    route: "/merge-pdf",
    icon: "GitMerge",
    accent: "merge",
  },
  {
    id: "split-pdf",
    title: "Split PDF",
    description: "Split a PDF into separate pages or ranges.",
    route: "/split-pdf",
    icon: "Scissors",
    accent: "split",
  },
  {
    id: "compress-pdf",
    title: "Compress PDF",
    description: "Reduce PDF file size while keeping quality usable.",
    route: "/compress-pdf",
    icon: "Minimize2",
    accent: "compress",
  },
  {
    id: "pdf-to-word",
    title: "PDF to Word",
    description: "Convert PDF documents to editable Word files.",
    route: "/pdf-to-word",
    icon: "FileType2",
    accent: "convert",
  },
  {
    id: "edit-pdf",
    title: "Edit PDF",
    description: "Draw, add text, and place images—export a flattened PDF in the browser.",
    route: "/edit-pdf",
    icon: "FilePenLine",
    accent: "edit",
  },
];

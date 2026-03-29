export type ToolPageId =
  | "merge-pdf"
  | "split-pdf"
  | "compress-pdf"
  | "pdf-to-word"
  | "edit-pdf";

export type ToolHowToStep = { title: string; description: string };

export type ToolFAQ = { question: string; answer: string };

export type ToolPageContent = {
  meta: { title: string; description: string };
  /** Steps for UI (How it works) and HowTo JSON-LD */
  howToSteps: ToolHowToStep[];
  faqs: ToolFAQ[];
};

export const TOOL_PAGE_CONTENT: Record<ToolPageId, ToolPageContent> = {
  "merge-pdf": {
    meta: {
      title: "Merge PDF Free Online — No Sign Up | PDF Toolkit",
      description:
        "Combine multiple PDF files into one document in seconds. Free, fast, and secure browser-based merging with drag-to-reorder control.",
    },
    howToSteps: [
      {
        title: "Upload PDFs",
        description:
          "Drop in or select the PDF files you want to combine. Add as many as you need.",
      },
      {
        title: "Put them in order",
        description:
          "Drag files to reorder. The list top to bottom is how pages will flow in the output.",
      },
      {
        title: "Merge & download",
        description:
          "Tap Merge PDF, then download your single combined file when it is ready.",
      },
    ],
    faqs: [
      {
        question: "Is it free to merge PDF files online?",
        answer:
          "Yes. PDF Toolkit lets you merge PDFs in your browser without a subscription or account. You upload files for processing and download the merged PDF when it is ready.",
      },
      {
        question: "Is my data safe when merging PDFs?",
        answer:
          "Files are sent over HTTPS for processing and are not kept for sharing or marketing. Treat any online tool as sensitive for highly confidential documents, and download results promptly.",
      },
      {
        question: "How many PDFs can I merge at once?",
        answer:
          "You can queue multiple PDFs in one session. Practical limits depend on file sizes and your network; very large batches may take longer to upload and process.",
      },
      {
        question: "What is the maximum file size for merging PDFs?",
        answer:
          "Limits follow your browser and API settings. If an upload fails, try fewer files at once or compress large PDFs first using our Compress PDF tool.",
      },
    ],
  },
  "split-pdf": {
    meta: {
      title: "Split PDF Free Online — Extract Pages | PDF Toolkit",
      description:
        "Split a PDF into separate pages or custom ranges. Download a ZIP or single-page PDF. Free, fast, and easy page extraction.",
    },
    howToSteps: [
      {
        title: "Upload your PDF",
        description:
          "Drop in one PDF. You will see small previews of each page once it loads.",
      },
      {
        title: "Choose how to split",
        description:
          "Use “All pages” for every page, or “Custom range” with text like 1-3, 5, 7-9—or tick pages in the grid.",
      },
      {
        title: "Split & download",
        description:
          "Run Split PDF. You will get a ZIP when there are multiple outputs, or a single PDF when there is only one.",
      },
    ],
    faqs: [
      {
        question: "Is splitting a PDF into separate pages free?",
        answer:
          "Yes. You can split PDFs online without signing up. Upload one file, choose pages or ranges, and download the result when processing finishes.",
      },
      {
        question: "Is my PDF private when I split it online?",
        answer:
          "Your file is transferred securely for processing. Avoid uploading highly sensitive documents if your policy requires on-device-only tools.",
      },
      {
        question: "How do I split a PDF by page range (e.g. pages 2–5)?",
        answer:
          "Choose custom range mode and enter ranges like 2-5, or select individual pages in the thumbnail grid. Page numbers are 1-based and match your document order.",
      },
      {
        question: "Why did I get a ZIP instead of one PDF after splitting?",
        answer:
          "When the tool outputs more than one PDF, your browser downloads a single ZIP containing each file. One output stays a single PDF download.",
      },
    ],
  },
  "compress-pdf": {
    meta: {
      title: "Compress PDF Free Online — Reduce File Size | PDF Toolkit",
      description:
        "Shrink PDF files with adjustable compression presets. Free, fast, and no sign-up—compare size before and after.",
    },
    howToSteps: [
      {
        title: "Upload your PDF",
        description:
          "Drop in one PDF. We show its size so you know your starting point.",
      },
      {
        title: "Choose compression",
        description:
          "Low keeps quality high; high targets the smallest file. Medium is a balance for everyday sharing.",
      },
      {
        title: "Compress & download",
        description:
          "Run compress, compare before and after sizes, then download your optimized PDF.",
      },
    ],
    faqs: [
      {
        question: "Is PDF compression free to use online?",
        answer:
          "Yes. Pick a compression level, upload your PDF, and download the smaller file without creating an account.",
      },
      {
        question: "Is it safe to compress confidential PDFs online?",
        answer:
          "Files are processed over HTTPS. For regulated or secret data, follow your organization’s policy—some teams require offline tools only.",
      },
      {
        question: "How much smaller will my compressed PDF get?",
        answer:
          "It depends on the PDF. Scanned pages and large images shrink a lot; text-heavy or already optimized PDFs may change only slightly.",
      },
      {
        question: "What is the maximum PDF file size I can compress?",
        answer:
          "Very large uploads may time out on slow connections. If that happens, try a smaller file or split the PDF first, then compress each part.",
      },
    ],
  },
  "pdf-to-word": {
    meta: {
      title: "PDF to Word Free Online — Convert PDF to DOCX | PDF Toolkit",
      description:
        "Convert PDF files to editable Word (.docx) documents. Server-side conversion with clear expectations for scanned PDFs and complex layouts.",
    },
    howToSteps: [
      {
        title: "Upload your PDF",
        description:
          "One file at a time. You will see its name, size, and page count when we can read it.",
      },
      {
        title: "Convert on the server",
        description:
          "The backend uses LibreOffice or Python pdf2docx to build a Word document from your PDF.",
      },
      {
        title: "Download .docx",
        description:
          "Grab your Word file when it is ready. The file is removed from the server after a delay.",
      },
    ],
    faqs: [
      {
        question: "Is PDF to Word conversion free online?",
        answer:
          "Yes. Upload a PDF and download a .docx when conversion completes—no payment step in the app for standard use.",
      },
      {
        question: "Is my document secure when converting PDF to Word?",
        answer:
          "Uploads use HTTPS and are not published publicly. For confidential contracts or PII, confirm the workflow meets your compliance needs.",
      },
      {
        question: "Will my Word file look exactly like the PDF?",
        answer:
          "Often close for simple layouts; fonts, columns, and graphics may shift. Scanned PDFs behave like pictures, so editable text quality varies.",
      },
      {
        question: "How many pages or how large a PDF can I convert to Word?",
        answer:
          "Long or very large files take more time to upload and convert. If conversion fails, try a shorter excerpt or compress images in the PDF first.",
      },
    ],
  },
  "edit-pdf": {
    meta: {
      title: "Edit PDF Free Online — Annotate & Draw | PDF Toolkit",
      description:
        "Edit PDFs in your browser: draw, text, and images. Export a flattened PDF—processing stays on your device with no server upload.",
    },
    howToSteps: [
      {
        title: "Upload your PDF",
        description:
          "Drop in a PDF. It loads in the editor with one page at a time for crisp rendering.",
      },
      {
        title: "Annotate with tools",
        description:
          "Use select, freehand draw, text, and images. Navigate pages with prev and next.",
      },
      {
        title: "Export & download",
        description:
          "Export flattens annotations onto the PDF and downloads the edited file.",
      },
    ],
    faqs: [
      {
        question: "Is this PDF editor free to use in the browser?",
        answer:
          "Yes. Open a PDF, annotate, and export without an account. Heavy edits may feel slower on very large files or older devices.",
      },
      {
        question: "Are my files uploaded to your servers when I edit a PDF?",
        answer:
          "No. The editor runs locally in your browser; your PDF stays on your machine unless you download the result.",
      },
      {
        question: "Can I add text and drawings to every page of my PDF?",
        answer:
          "You can move between pages and add markup where needed. Export merges your annotations onto the corresponding pages.",
      },
      {
        question: "What is the largest PDF I can edit online here?",
        answer:
          "Practical limits depend on your device memory and browser. If the editor stutters, try a smaller PDF or split it first, then edit each part.",
      },
    ],
  },
};

export function howToSchemaFromContent(
  content: ToolPageContent
): {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
} {
  return {
    name: content.meta.title.replace(/\s*\|\s*PDF Toolkit\s*$/, "").trim(),
    description: content.meta.description,
    steps: content.howToSteps.map((s) => ({
      name: s.title,
      text: s.description,
    })),
  };
}

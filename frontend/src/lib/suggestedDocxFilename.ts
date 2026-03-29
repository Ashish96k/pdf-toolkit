/** Suggested .docx download name from the original PDF (or generic) file name. */
export function suggestedDocxFilename(pdfName: string): string {
  const base = pdfName.replace(/\.pdf$/i, "");
  if (base && base !== pdfName) return `${base}.docx`;
  const withoutExt = pdfName.replace(/\.[^.]+$/, "");
  return withoutExt ? `${withoutExt}.docx` : "document.docx";
}

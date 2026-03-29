import type { Metadata } from "next";
import { SchemaMarkup } from "@/components/tools/SchemaMarkup";
import {
  TOOL_PAGE_CONTENT,
  howToSchemaFromContent,
} from "@/data/toolPageContent";
import { getSiteUrl } from "@/lib/site";
import { PdfToWordClient } from "./PdfToWordClient";

const toolId = "pdf-to-word" as const;

export async function generateMetadata(): Promise<Metadata> {
  const c = TOOL_PAGE_CONTENT[toolId];
  const base = getSiteUrl();
  return {
    title: c.meta.title,
    description: c.meta.description,
    alternates: {
      canonical: `${base}/pdf-to-word`,
    },
  };
}

export default function PdfToWordPage() {
  const c = TOOL_PAGE_CONTENT[toolId];
  return (
    <>
      <SchemaMarkup type="HowTo" data={howToSchemaFromContent(c)} />
      <SchemaMarkup type="FAQ" data={{ items: c.faqs }} />
      <PdfToWordClient />
    </>
  );
}

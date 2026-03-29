import type { Metadata } from "next";
import { SchemaMarkup } from "@/components/tools/SchemaMarkup";
import {
  TOOL_PAGE_CONTENT,
  howToSchemaFromContent,
} from "@/data/toolPageContent";
import { getSiteUrl } from "@/lib/site";
import { EditPDFClient } from "./EditPDFClient";

const toolId = "edit-pdf" as const;

export async function generateMetadata(): Promise<Metadata> {
  const c = TOOL_PAGE_CONTENT[toolId];
  const base = getSiteUrl();
  return {
    title: c.meta.title,
    description: c.meta.description,
    alternates: {
      canonical: `${base}/edit-pdf`,
    },
  };
}

export default function EditPdfPage() {
  const c = TOOL_PAGE_CONTENT[toolId];
  return (
    <>
      <SchemaMarkup type="HowTo" data={howToSchemaFromContent(c)} />
      <SchemaMarkup type="FAQ" data={{ items: c.faqs }} />
      <EditPDFClient />
    </>
  );
}

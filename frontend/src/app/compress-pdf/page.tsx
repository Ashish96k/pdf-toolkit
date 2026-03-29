import type { Metadata } from "next";
import { SchemaMarkup } from "@/components/tools/SchemaMarkup";
import {
  TOOL_PAGE_CONTENT,
  howToSchemaFromContent,
} from "@/data/toolPageContent";
import { getSiteUrl } from "@/lib/site";
import { CompressPDFClient } from "./CompressPDFClient";

const toolId = "compress-pdf" as const;

export async function generateMetadata(): Promise<Metadata> {
  const c = TOOL_PAGE_CONTENT[toolId];
  const base = getSiteUrl();
  return {
    title: c.meta.title,
    description: c.meta.description,
    alternates: {
      canonical: `${base}/compress-pdf`,
    },
  };
}

export default function CompressPDFPage() {
  const c = TOOL_PAGE_CONTENT[toolId];
  return (
    <>
      <SchemaMarkup type="HowTo" data={howToSchemaFromContent(c)} />
      <SchemaMarkup type="FAQ" data={{ items: c.faqs }} />
      <CompressPDFClient />
    </>
  );
}

import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { ToolGrid } from "@/components/home/ToolGrid";
import { getSiteUrl } from "@/lib/site";
import { TOOLS } from "@/utils/constants";

const HeroSection = dynamic(
  () =>
    import("@/components/home/HeroSection").then((m) => ({
      default: m.HeroSection,
    })),
  { ssr: true }
);

export async function generateMetadata(): Promise<Metadata> {
  const base = getSiteUrl();
  return {
    title: "PDF Toolkit — Merge, split, compress & convert PDFs online",
    description:
      "Free PDF tools in one place: merge PDFs, split pages, compress files, convert PDF to Word, and annotate PDFs. Works in your browser with no signup.",
    alternates: {
      canonical: base,
    },
  };
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <ToolGrid tools={TOOLS} />
    </>
  );
}

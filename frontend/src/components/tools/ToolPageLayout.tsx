import type { HowItWorksStep } from "./HowItWorks";
import { HowItWorks } from "./HowItWorks";
import type { FAQItem } from "./FAQSection";
import { FAQSection } from "./FAQSection";
import type { RelatedToolItem } from "./RelatedTools";
import { RelatedTools } from "./RelatedTools";
import { AdSlot } from "@/components/ui/AdSlot";
import { getRelatedToolItems } from "@/utils/relatedTools";

const toolAreaAdSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOOL ?? "";

export type { HowItWorksStep, FAQItem, RelatedToolItem };

export type ToolPageLayoutProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  howItWorksSteps: HowItWorksStep[];
  faqs: FAQItem[];
  /** Current tool id from `TOOLS` — shows three other tools as related. */
  toolId: string;
};

export function ToolPageLayout({
  title,
  subtitle,
  children,
  howItWorksSteps,
  faqs,
  toolId,
}: ToolPageLayoutProps) {
  const relatedTools = getRelatedToolItems(toolId);
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-text-secondary md:mx-0">
          {subtitle}
        </p>
      </header>

      <div className="mb-16">{children}</div>

      {toolAreaAdSlot ? (
        <div className="mb-16 flex min-h-[120px] justify-center overflow-hidden">
          <AdSlot slot={toolAreaAdSlot} format="auto" />
        </div>
      ) : null}

      <section className="mb-16" aria-labelledby="how-it-works-heading">
        <h2
          id="how-it-works-heading"
          className="section-label text-center md:text-left"
        >
          How it works
        </h2>
        <HowItWorks steps={howItWorksSteps} />
      </section>

      <section className="mb-16" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="section-label text-center md:text-left">
          FAQ
        </h2>
        <FAQSection items={faqs} />
      </section>

      <section aria-labelledby="related-heading">
        <h2
          id="related-heading"
          className="section-label text-center md:text-left"
        >
          Related tools
        </h2>
        <RelatedTools tools={relatedTools} />
      </section>
    </div>
  );
}

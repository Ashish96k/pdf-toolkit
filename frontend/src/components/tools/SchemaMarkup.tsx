export type HowToSchemaData = {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
};

export type FAQSchemaData = {
  items: { question: string; answer: string }[];
};

type SchemaMarkupProps =
  | { type: "HowTo"; data: HowToSchemaData }
  | { type: "FAQ"; data: FAQSchemaData };

function buildJsonLd(props: SchemaMarkupProps): Record<string, unknown> {
  if (props.type === "HowTo") {
    const { name, description, steps } = props.data;
    return {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name,
      description,
      step: steps.map((s) => ({
        "@type": "HowToStep",
        name: s.name,
        text: s.text,
      })),
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: props.data.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function SchemaMarkup(props: SchemaMarkupProps) {
  const jsonLd = buildJsonLd(props);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

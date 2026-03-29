import type { LucideIcon } from "lucide-react";

export type HowItWorksStep = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function HowItWorks({ steps }: { steps: HowItWorksStep[] }) {
  return (
    <ol className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <li
            key={step.title}
            className="flex flex-col items-center text-center"
          >
            <span className="section-label mb-0 md:mb-1">Step {index + 1}</span>
            <div
              className="icon-badge-red mt-2 !h-14 !w-14 shrink-0"
              aria-hidden
            >
              <Icon className="h-7 w-7 text-primary" strokeWidth={1.75} />
            </div>
            <h3 className="mt-4 text-lg font-bold text-white">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {step.description}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

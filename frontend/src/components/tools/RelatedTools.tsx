"use client";

import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import type { ToolAccent } from "@/utils/constants";
import GlassCard from "@/components/ui/GlassCard";
import { cn } from "@/utils/cn";

export type RelatedToolItem = {
  title: string;
  description: string;
  route: string;
  icon: LucideIcon;
  accent: ToolAccent;
};

const accentBadgeClass: Record<ToolAccent, string> = {
  merge: "bg-badge-merge shadow-badge-merge text-primary",
  split: "bg-badge-split shadow-badge-split text-purple-400",
  compress: "bg-badge-compress shadow-badge-compress text-blue-400",
  convert: "bg-badge-convert shadow-badge-convert text-green-400",
  edit: "bg-badge-edit shadow-badge-edit text-orange-400",
};

export function RelatedTools({ tools }: { tools: RelatedToolItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {tools.map((tool, index) => {
        const Icon = tool.icon;
        return (
          <GlassCard key={tool.route} hover delay={index * 0.05} className="p-4">
            <Link
              href={tool.route}
              className="group relative block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <ArrowUpRight
                className="absolute right-0 top-0 h-4 w-4 text-text-muted transition-colors duration-200 group-hover:text-primary"
                aria-hidden
              />
              <div
                className={cn(
                  "icon-badge mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl",
                  accentBadgeClass[tool.accent]
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
              </div>
              <h3 className="mb-1 mt-3 text-sm font-bold text-white">
                {tool.title}
              </h3>
              <p className="text-xs leading-relaxed text-text-secondary">
                {tool.description}
              </p>
            </Link>
          </GlassCard>
        );
      })}
    </div>
  );
}

"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ToolAccent } from "@/utils/constants";
import GlassCard from "@/components/ui/GlassCard";
import { cn } from "@/utils/cn";

export type ToolCardProps = {
  title: string;
  description: string;
  route: string;
  icon: LucideIcon;
  accent: ToolAccent;
  featured?: boolean;
};

const accentBadgeClass: Record<ToolAccent, string> = {
  merge: "bg-badge-merge shadow-badge-merge text-primary",
  split: "bg-badge-split shadow-badge-split text-purple-400",
  compress: "bg-badge-compress shadow-badge-compress text-blue-400",
  convert: "bg-badge-convert shadow-badge-convert text-green-400",
  edit: "bg-badge-edit shadow-badge-edit text-orange-400",
};

export function ToolCard({
  title,
  description,
  route,
  icon: Icon,
  accent,
  featured = false,
}: ToolCardProps) {
  return (
    <GlassCard
      hover
      variant={featured ? "red" : "default"}
      className={cn(
        "group h-full",
        featured ? "p-8 min-h-[15rem]" : "p-6"
      )}
    >
      <Link
        href={route}
        className="relative block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <ArrowUpRight
          className="absolute right-0 top-0 h-5 w-5 text-text-muted transition-colors duration-200 group-hover:text-primary"
          aria-hidden
        />
        <div
          className={cn(
            "icon-badge mt-1 inline-flex items-center justify-center rounded-2xl",
            accentBadgeClass[accent]
          )}
        >
          <Icon className="h-6 w-6 shrink-0" aria-hidden />
        </div>
        <h3 className="mb-1.5 mt-4 text-base font-bold text-white">{title}</h3>
        <p className="text-sm leading-relaxed text-text-secondary">
          {description}
        </p>
      </Link>
    </GlassCard>
  );
}

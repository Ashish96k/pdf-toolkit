"use client";

import type { ToolDefinition } from "@/utils/constants";
import {
  FilePenLine,
  FileQuestion,
  FileType2,
  GitMerge,
  Minimize2,
  Scissors,
  type LucideIcon,
} from "lucide-react";
import { ToolCard } from "./ToolCard";

export type ToolGridProps = {
  tools: ToolDefinition[];
};

const toolIconByName: Record<string, LucideIcon> = {
  GitMerge,
  Scissors,
  Minimize2,
  FileType2,
  FilePenLine,
};

export function ToolGrid({ tools }: ToolGridProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-2 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => {
          const Icon = toolIconByName[tool.icon] ?? FileQuestion;
          return (
            <ToolCard
              key={tool.id}
              title={tool.title}
              description={tool.description}
              route={tool.route}
              icon={Icon}
              accent={tool.accent}
              featured={tool.id === "merge-pdf"}
            />
          );
        })}
      </div>
    </section>
  );
}

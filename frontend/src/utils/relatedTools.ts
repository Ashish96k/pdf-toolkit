import {
  FilePenLine,
  FileQuestion,
  FileType2,
  GitMerge,
  Minimize2,
  Scissors,
  type LucideIcon,
} from "lucide-react";
import { TOOLS, type ToolDefinition } from "@/utils/constants";
import type { RelatedToolItem } from "@/components/tools/RelatedTools";

const iconByName: Record<string, LucideIcon> = {
  GitMerge,
  Scissors,
  Minimize2,
  FileType2,
  FilePenLine,
};

/** Three tools from `TOOLS` excluding the current tool (stable order). */
export function getRelatedToolItems(currentId: string): RelatedToolItem[] {
  const rest: ToolDefinition[] = TOOLS.filter((t) => t.id !== currentId);
  return rest.slice(0, 3).map((t) => ({
    title: t.title,
    description: t.description,
    route: t.route,
    icon: iconByName[t.icon] ?? FileQuestion,
    accent: t.accent,
  }));
}

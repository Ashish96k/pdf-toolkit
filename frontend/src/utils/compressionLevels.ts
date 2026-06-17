import type { CompressionLevel, CompressionRequest } from "@/hooks/usePDFProcess";

export const COMPRESSION_LEVELS: CompressionLevel[] = ["low", "medium", "high"];

export const DEFAULT_CUSTOM_STRENGTH = 75;

export const COMPRESSION_LEVEL_LABELS: Record<CompressionLevel, string> = {
  low: "Best quality",
  medium: "Balanced",
  high: "Smallest file",
};

export function getCompressionChoiceLabel(request: CompressionRequest): string {
  if (request.mode === "custom") {
    return "Extreme shrink";
  }
  return COMPRESSION_LEVEL_LABELS[request.level];
}

export function describeCustomStrength(strength: number): {
  dpi: number;
  summary: string;
  isExtreme: boolean;
} {
  const t = Math.min(100, Math.max(0, strength)) / 100;
  const dpi = Math.round(72 - (72 - 36) * t);
  const grayscale = t >= 0.55;
  const isExtreme = strength >= 85;

  const parts = [`${dpi} DPI images`];
  if (grayscale) parts.push("grayscale");
  if (isExtreme) parts.push("maximum JPEG compression");

  return {
    dpi,
    summary: parts.join(", "),
    isExtreme,
  };
}

export type CompressionOptionCopy = {
  id: CompressionLevel;
  title: string;
  subtitle: string;
  quality: string;
  sizeHint: string;
};

export const COMPRESSION_OPTIONS: CompressionOptionCopy[] = [
  {
    id: "low",
    title: "Best quality",
    subtitle: "Print & archival — may increase file size",
    quality: "300 DPI images, highest fidelity",
    sizeHint: "Prioritizes quality over size",
  },
  {
    id: "medium",
    title: "Balanced",
    subtitle: "Good for email and sharing",
    quality: "150 DPI images, balanced optimization",
    sizeHint: "Recommended starting point for most PDFs",
  },
  {
    id: "high",
    title: "Smallest file",
    subtitle: "Maximum size reduction",
    quality: "72 DPI images, lower visual quality",
    sizeHint: "Best when you need the smallest file",
  },
];

/**
 * Prefer the preset with the most size reduction. If none shrink the file,
 * pick whichever adds the least extra size.
 */
export function pickRecommendedCompressionLevel(
  originalSize: number,
  previewSizes: Partial<Record<CompressionLevel, number>>
): CompressionLevel | null {
  const entries = COMPRESSION_LEVELS.map((level) => ({
    level,
    size: previewSizes[level],
  })).filter(
    (entry): entry is { level: CompressionLevel; size: number } =>
      typeof entry.size === "number"
  );

  if (entries.length === 0) return null;

  const smaller = entries.filter((entry) => entry.size < originalSize);
  if (smaller.length > 0) {
    return smaller.reduce((best, entry) =>
      entry.size < best.size ? entry : best
    ).level;
  }

  return entries.reduce((best, entry) =>
    entry.size < best.size ? entry : best
  ).level;
}

export function getSizeChangePercent(
  originalSize: number,
  outputSize: number
): number {
  if (originalSize <= 0) return 0;
  return Math.round((1 - outputSize / originalSize) * 100);
}

export function isOutputLargerThanOriginal(
  originalSize: number,
  outputSize: number
): boolean {
  return outputSize > originalSize;
}

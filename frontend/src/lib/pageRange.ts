export type PageRangeSegmentInput = { from: string; to: string };

export type PageRangeSegment = { from: number; to: number };

export function createEmptyRangeSegment(): PageRangeSegmentInput {
  return { from: "", to: "" };
}

/** Parse a comma-separated range string into editable segment rows. */
export function rangeStringToSegmentInputs(rangeStr: string): PageRangeSegmentInput[] {
  const s = rangeStr.trim();
  if (!s) return [createEmptyRangeSegment()];

  const segments: PageRangeSegmentInput[] = [];

  for (const rawPart of s.split(",")) {
    const part = rawPart.trim();
    if (!part) continue;

    if (part.includes("-")) {
      const dashParts = part.split("-");
      if (dashParts.length === 2) {
        segments.push({
          from: dashParts[0].trim(),
          to: dashParts[1].trim(),
        });
        continue;
      }
    }

    segments.push({ from: part, to: part });
  }

  return segments.length > 0 ? segments : [createEmptyRangeSegment()];
}

/** Compact sorted pages into segment rows for the multi-range UI. */
export function pagesToSegmentInputs(pages: number[]): PageRangeSegmentInput[] {
  const unique = Array.from(new Set(pages)).sort((a, b) => a - b);
  if (unique.length === 0) return [createEmptyRangeSegment()];

  const segments: PageRangeSegmentInput[] = [];
  let start = unique[0];
  let end = unique[0];

  const flush = () => {
    segments.push({ from: String(start), to: String(end) });
  };

  for (let i = 1; i < unique.length; i++) {
    const n = unique[i];
    if (n === end + 1) {
      end = n;
    } else {
      flush();
      start = n;
      end = n;
    }
  }
  flush();

  return segments;
}

export function segmentsToRangeString(segments: PageRangeSegment[]): string {
  return segments
    .map((segment) =>
      segment.from === segment.to
        ? String(segment.from)
        : `${segment.from}-${segment.to}`
    )
    .join(",");
}

export type RangePreviewRow = {
  index: number;
  label: string;
  pages: number[] | null;
};

/** Build preview rows aligned with each custom range input row. */
export function buildRangePreviewRows(
  inputs: PageRangeSegmentInput[],
  maxPage?: number
): RangePreviewRow[] {
  return inputs.map((input, index) => {
    const fromTrim = input.from.trim();
    const toTrim = input.to.trim();
    const rangeLabel = `Range ${index + 1}`;

    if (!fromTrim && !toTrim) {
      return { index, label: rangeLabel, pages: null };
    }

    if (!fromTrim || !toTrim) {
      return { index, label: rangeLabel, pages: null };
    }

    const start = Number(fromTrim);
    const end = Number(toTrim);

    if (
      !Number.isInteger(start) ||
      !Number.isInteger(end) ||
      start < 1 ||
      end < 1 ||
      start > end
    ) {
      return { index, label: rangeLabel, pages: null };
    }

    if (maxPage != null && maxPage > 0 && (start > maxPage || end > maxPage)) {
      return { index, label: rangeLabel, pages: null };
    }

    const pages: number[] = [];
    for (let page = start; page <= end; page++) {
      pages.push(page);
    }

    const label =
      start === end
        ? `${rangeLabel}: Page ${start}`
        : `${rangeLabel}: Pages ${start}–${end}`;

    return { index, label, pages };
  });
}

export function validateRangeSegments(
  inputs: PageRangeSegmentInput[],
  maxPage?: number
):
  | { ok: true; segments: PageRangeSegment[]; pages: number[]; rangeString: string }
  | { ok: false; error: string } {
  const nonEmpty = inputs.filter(
    (segment) => segment.from.trim() !== "" || segment.to.trim() !== ""
  );

  if (nonEmpty.length === 0) {
    return { ok: false, error: "Add at least one page range." };
  }

  const segments: PageRangeSegment[] = [];
  const ordered: number[] = [];
  const seen = new Set<number>();

  for (let i = 0; i < nonEmpty.length; i++) {
    const fromTrim = nonEmpty[i].from.trim();
    const toTrim = nonEmpty[i].to.trim();

    if (!fromTrim || !toTrim) {
      return {
        ok: false,
        error: `Complete both “from” and “to” for range ${i + 1}.`,
      };
    }

    const start = Number(fromTrim);
    const end = Number(toTrim);

    if (
      !Number.isInteger(start) ||
      !Number.isInteger(end) ||
      start < 1 ||
      end < 1
    ) {
      return { ok: false, error: `Range ${i + 1} uses invalid page numbers.` };
    }

    if (start > end) {
      return {
        ok: false,
        error: `Range ${i + 1}: start page must be less than or equal to end page.`,
      };
    }

    segments.push({ from: start, to: end });

    for (let page = start; page <= end; page++) {
      if (!seen.has(page)) {
        seen.add(page);
        ordered.push(page);
      }
    }
  }

  if (ordered.length === 0) {
    return { ok: false, error: "No valid pages in range." };
  }

  if (maxPage != null && maxPage > 0) {
    const over = ordered.find((page) => page > maxPage);
    if (over != null) {
      return {
        ok: false,
        error: `Page ${over} is beyond this document (${maxPage} page${maxPage === 1 ? "" : "s"}).`,
      };
    }
  }

  return {
    ok: true,
    segments,
    pages: ordered,
    rangeString: segmentsToRangeString(segments),
  };
}

/**
 * Parse a page range string like "1-3, 5, 7-9" into unique 1-based page numbers
 * in first-segment order.
 */
export function parsePageRange(
  rangeStr: string,
  maxPage?: number
):
  | { ok: true; pages: number[] }
  | { ok: false; error: string } {
  const s = rangeStr.trim();
  if (!s) {
    return { ok: false, error: "Enter a page range (e.g. 1-3, 5, 7-9)." };
  }

  const parts = s.split(",");
  const ordered: number[] = [];
  const seen = new Set<number>();

  for (const rawPart of parts) {
    const part = rawPart.trim();
    if (!part) {
      return { ok: false, error: "Remove empty segments between commas." };
    }

    if (part.includes("-")) {
      const dashParts = part.split("-");
      if (dashParts.length !== 2) {
        return { ok: false, error: `Invalid range segment: "${part}".` };
      }
      const start = Number(dashParts[0].trim());
      const end = Number(dashParts[1].trim());
      if (
        !Number.isInteger(start) ||
        !Number.isInteger(end) ||
        start < 1 ||
        end < 1 ||
        start > end
      ) {
        return { ok: false, error: `Invalid range segment: "${part}".` };
      }
      for (let p = start; p <= end; p++) {
        if (!seen.has(p)) {
          seen.add(p);
          ordered.push(p);
        }
      }
    } else {
      const n = Number(part);
      if (!Number.isInteger(n) || n < 1) {
        return { ok: false, error: `Invalid page number: "${part}".` };
      }
      if (!seen.has(n)) {
        seen.add(n);
        ordered.push(n);
      }
    }
  }

  if (ordered.length === 0) {
    return { ok: false, error: "No valid pages in range." };
  }

  if (maxPage != null && maxPage > 0) {
    const over = ordered.find((p) => p > maxPage);
    if (over != null) {
      return {
        ok: false,
        error: `Page ${over} is beyond this document (${maxPage} page${maxPage === 1 ? "" : "s"}).`,
      };
    }
  }

  return { ok: true, pages: ordered };
}

/** Compact sorted unique pages into "1-3,5,7-9". */
export function pagesToRangeString(sortedPages: number[]): string {
  const unique = Array.from(new Set(sortedPages)).sort((a, b) => a - b);
  if (unique.length === 0) return "";

  const segments: string[] = [];
  let start = unique[0];
  let end = unique[0];

  const flush = () => {
    if (start === end) {
      segments.push(String(start));
    } else if (end === start + 1) {
      segments.push(String(start), String(end));
    } else {
      segments.push(`${start}-${end}`);
    }
  };

  for (let i = 1; i < unique.length; i++) {
    const n = unique[i];
    if (n === end + 1) {
      end = n;
    } else {
      flush();
      start = n;
      end = n;
    }
  }
  flush();

  return segments.join(",");
}

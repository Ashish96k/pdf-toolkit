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

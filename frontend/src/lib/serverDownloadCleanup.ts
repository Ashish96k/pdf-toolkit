/** Extract server-side output filename from a download URL, or null for blob/local URLs. */
export function getServerDownloadFilename(
  url: string | null | undefined
): string | null {
  if (!url || url.startsWith("blob:")) return null;

  try {
    const pathname = url.startsWith("/")
      ? url
      : new URL(url).pathname;
    const match = pathname.match(/\/api\/download\/([^/?#]+)$/);
    if (!match) return null;
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

function resolveApiUrl(path: string): string {
  const base =
    typeof process.env.NEXT_PUBLIC_API_URL === "string"
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")
      : "";
  return base ? `${base}${path}` : path;
}

/** Delete a processed output file from the server uploads folder (best-effort). */
export async function discardServerDownload(
  url: string | null | undefined
): Promise<void> {
  const filename = getServerDownloadFilename(url);
  if (!filename) return;

  try {
    await fetch(
      resolveApiUrl(`/api/download/${encodeURIComponent(filename)}`),
      { method: "DELETE" }
    );
  } catch {
    // Best-effort cleanup when the download is no longer shown.
  }
}

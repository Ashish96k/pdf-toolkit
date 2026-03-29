declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function gtagEvent(
  eventName: "tool_used" | "file_downloaded",
  params: { tool_name: string }
): void {
  if (typeof window === "undefined") return;
  const id = process.env.NEXT_PUBLIC_GA_ID;
  if (!id || typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
}

/** Fires when the user runs the main tool action (e.g. Merge PDF). */
export function trackToolUsed(toolName: string): void {
  gtagEvent("tool_used", { tool_name: toolName });
}

/** Fires when the user downloads a processed file. */
export function trackFileDownloaded(toolName: string): void {
  gtagEvent("file_downloaded", { tool_name: toolName });
}

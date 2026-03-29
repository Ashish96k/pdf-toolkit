"use client";

import { useEffect, useState, type CSSProperties } from "react";

export type AdSlotFormat = "auto" | "rectangle" | "leaderboard";

export type AdSlotProps = {
  slot: string;
  format: AdSlotFormat;
};

function clientId(): string | null {
  const raw = process.env.NEXT_PUBLIC_ADSENSE_ID;
  if (!raw) return null;
  return raw.startsWith("ca-pub-") ? raw : `ca-pub-${raw}`;
}

export function AdSlot({ slot, format }: AdSlotProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pub = clientId();

  useEffect(() => {
    if (!mounted || !slot || !pub) return;
    try {
      const w = window as Window & { adsbygoogle?: unknown[] };
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
    } catch {
      /* ignore */
    }
  }, [mounted, slot, pub]);

  if (!mounted || !slot || !pub) return null;

  const base: CSSProperties =
    format === "leaderboard"
      ? { display: "inline-block", width: "100%", maxWidth: "728px", height: "90px" }
      : format === "rectangle"
        ? { display: "inline-block", width: "300px", height: "250px" }
        : { display: "block" };

  const formatAttr =
    format === "auto" ? "auto" : format === "leaderboard" ? "horizontal" : "rectangle";

  return (
    <ins
      className="adsbygoogle"
      style={base}
      data-ad-client={pub}
      data-ad-slot={slot}
      data-ad-format={formatAttr}
      {...(format === "auto"
        ? { "data-full-width-responsive": "true" as const }
        : {})}
    />
  );
}

import Link from "next/link";
import { AdSlot } from "@/components/ui/AdSlot";
import { TOOLS } from "@/utils/constants";

const footerAdSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER ?? "";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-white/[0.08] bg-white/[0.03] backdrop-blur-glass">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <nav
          className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 md:grid-cols-5"
          aria-label="Tools"
        >
          {TOOLS.map((tool) => (
            <Link
              key={tool.id}
              href={tool.route}
              className="text-sm font-medium text-text-secondary transition-colors hover:text-white"
            >
              {tool.title}
            </Link>
          ))}
        </nav>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-white/[0.08] pt-6 text-sm">
          <Link
            href="/privacy-policy"
            className="text-text-secondary transition-colors hover:text-white"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-text-secondary transition-colors hover:text-white"
          >
            Terms of Use
          </Link>
        </div>
        {footerAdSlot ? (
          <div className="mt-8 hidden min-h-[90px] justify-center overflow-hidden md:flex">
            <AdSlot slot={footerAdSlot} format="leaderboard" />
          </div>
        ) : null}
        <p className="mt-8 border-t border-white/[0.08] pt-6 text-center text-xs text-text-muted">
          © {year} PDF Toolkit. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { AdSlot } from "@/components/ui/AdSlot";
import { TOOLS } from "@/utils/constants";

const footerAdSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER ?? "";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-neutral-200 bg-primary-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <nav
          className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 md:grid-cols-5"
          aria-label="Tools"
        >
          {TOOLS.map((tool) => (
            <Link
              key={tool.id}
              href={tool.route}
              className="text-sm text-neutral-600 transition-colors hover:text-primary"
            >
              {tool.title}
            </Link>
          ))}
        </nav>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-neutral-200 pt-6 text-sm text-neutral-600">
          <Link
            href="/privacy-policy"
            className="transition-colors hover:text-primary"
          >
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-primary">
            Terms of Use
          </Link>
        </div>
        {footerAdSlot ? (
          <div className="mt-8 hidden min-h-[90px] justify-center overflow-hidden md:flex">
            <AdSlot slot={footerAdSlot} format="leaderboard" />
          </div>
        ) : null}
        <p className="mt-8 border-t border-neutral-200 pt-6 text-center text-xs text-neutral-600">
          © {year} PDF Toolkit. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

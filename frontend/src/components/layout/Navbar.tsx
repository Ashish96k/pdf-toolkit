"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useScrolled } from "@/hooks/useScrolled";
import { TOOLS } from "@/utils/constants";

export function Navbar() {
  const scrolled = useScrolled(8);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const headerBarClass = [
    "w-full border-b border-[rgba(255,255,255,0.06)] bg-[rgba(8,0,16,0.6)] transition-[backdrop-filter,box-shadow] duration-300",
    scrolled ? "backdrop-blur-[40px]" : "backdrop-blur-nav",
    scrolled &&
      "shadow-[0_1px_0_0_rgba(230,57,70,0.22),0_8px_32px_-8px_rgba(230,57,70,0.12)]",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            role="presentation"
            aria-hidden
            className="fixed inset-0 z-40 cursor-default bg-black/55 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.header
        className="sticky top-0 z-50 w-full"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={headerBarClass}>
          <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
              onClick={() => setMobileOpen(false)}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white shadow-btn sm:h-10 sm:w-10"
                style={{
                  background:
                    "linear-gradient(135deg, #E63946, #C1121F)",
                }}
                aria-hidden
              >
                P
              </div>
              <span className="text-base font-bold tracking-tight sm:text-lg">
                <span className="text-white">PDF</span>
                <span className="text-primary">Toolkit</span>
              </span>
            </Link>

            <nav
              className="hidden items-center gap-1 md:flex"
              aria-label="Main"
            >
              {TOOLS.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.route}
                  className="rounded-lg px-3 py-2 text-sm text-text-secondary transition-all hover:bg-surface-hover hover:text-white"
                >
                  {tool.title}
                </Link>
              ))}
            </nav>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-text-secondary transition-all hover:bg-surface-hover hover:text-white md:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-drawer"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? (
                <X className="h-6 w-6" aria-hidden />
              ) : (
                <Menu className="h-6 w-6" aria-hidden />
              )}
            </button>

            <AnimatePresence initial={false}>
              {mobileOpen && (
                <motion.div
                  id="mobile-nav-drawer"
                  className="absolute left-0 right-0 top-full z-50 border-t border-[rgba(255,255,255,0.08)] bg-[rgba(8,0,16,0.92)] backdrop-blur-xl md:hidden"
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <nav
                    className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6"
                    aria-label="Mobile"
                  >
                    {TOOLS.map((tool) => (
                      <Link
                        key={tool.id}
                        href={tool.route}
                        className="rounded-lg px-3 py-2 text-sm text-text-secondary transition-all hover:bg-surface-hover hover:text-white"
                        onClick={() => setMobileOpen(false)}
                      >
                        {tool.title}
                      </Link>
                    ))}
                  </nav>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>
    </>
  );
}

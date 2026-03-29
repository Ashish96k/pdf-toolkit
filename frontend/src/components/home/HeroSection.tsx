"use client";

import { motion } from "framer-motion";
import { BadgePercent, ShieldCheck, UserX } from "lucide-react";

/** Opacity stays 1 on first paint so Lighthouse can measure LCP; subtle y motion only. */
const fadeUp = {
  initial: { opacity: 1, y: 10 },
  animate: { opacity: 1, y: 0 },
};

const fadeUpTransition = (delay: number) => ({
  duration: 0.28,
  ease: "easeOut" as const,
  delay,
});

const pills = [
  { label: "100% Free", icon: BadgePercent },
  { label: "No Registration", icon: UserX },
  { label: "Secure", icon: ShieldCheck },
] as const;

export function HeroSection() {
  return (
    <section className="relative px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:px-8">
      <div className="relative mx-auto max-w-6xl text-center">
        <motion.div
          className="mb-6 inline-flex items-center gap-2 rounded-pill border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary-light"
          {...fadeUp}
          transition={fadeUpTransition(0)}
        >
          <span
            className="size-1.5 shrink-0 rounded-full bg-primary shadow-glow-red animate-badge-dot"
            aria-hidden
          />
          Free PDF tools in your browser
        </motion.div>

        <motion.h1
          className="text-6xl font-extrabold tracking-tight"
          {...fadeUp}
          transition={fadeUpTransition(0.1)}
        >
          <span className="text-white">All PDF Tools</span>
          <br />
          <span className="bg-gradient-to-r from-primary via-primary-light to-gradient-pink bg-clip-text text-transparent">
            One Place.
          </span>
        </motion.h1>

        <motion.p
          className="mx-auto mt-5 max-w-md text-lg text-text-secondary"
          {...fadeUp}
          transition={fadeUpTransition(0.2)}
        >
          Merge, split, compress, convert and edit PDFs in seconds.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-wrap justify-center gap-3"
          {...fadeUp}
          transition={fadeUpTransition(0.3)}
        >
          {pills.map(({ label, icon: Icon }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-pill border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-text-secondary"
            >
              <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              {label}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

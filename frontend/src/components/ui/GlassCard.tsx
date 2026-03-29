"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "red" | "dark";
  hover?: boolean;
  onClick?: () => void;
  delay?: number;
}

export default function GlassCard({
  children,
  className,
  variant = "default",
  hover = false,
  onClick,
  delay = 0,
}: GlassCardProps) {
  const base = variant === "red" ? "glass-card-red" : "glass-card";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut", delay }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      onClick={onClick}
      className={cn(
        base,
        hover &&
          "cursor-pointer hover:shadow-card-hover hover:border-primary/20 transition-all duration-200",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

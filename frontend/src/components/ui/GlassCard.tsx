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
    <div
      onClick={onClick}
      className={cn(
        base,
        "animate-fade-up",
        hover && [
          "group cursor-pointer",
          "transition-[transform,border-color] duration-200 ease-out",
          "hover:-translate-y-1 hover:border-primary/20",
        ],
        onClick && "cursor-pointer",
        className
      )}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {hover ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(900px circle at 30% 20%, rgba(230,57,70,0.18) 0%, transparent 55%)",
          }}
        />
      ) : null}
      {children}
    </div>
  );
}

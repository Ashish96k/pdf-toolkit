"use client";

export function EditorSkeleton() {
  return (
    <div
      className="glass-card overflow-hidden rounded-2xl border border-white/[0.08] p-4"
      aria-hidden
    >
      <div className="animate-pulse space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="h-10 w-40 rounded-xl bg-white/[0.08]" />
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-white/[0.08]" />
            <div className="h-6 w-24 rounded bg-white/[0.08]" />
            <div className="h-10 w-10 rounded-lg bg-white/[0.08]" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="h-9 w-24 rounded-lg bg-white/[0.08]" />
          <div className="h-9 w-24 rounded-lg bg-white/[0.08]" />
          <div className="h-9 w-28 rounded-lg bg-white/[0.08]" />
          <div className="h-9 w-28 rounded-lg bg-white/[0.08]" />
        </div>
        <div className="mx-auto aspect-[8.5/11] w-full max-w-md rounded-xl bg-white/[0.06] ring-1 ring-white/[0.06]" />
        <div className="flex justify-center gap-3">
          <div className="h-12 w-40 rounded-2xl bg-white/[0.08]" />
          <div className="h-12 w-32 rounded-2xl bg-white/[0.06]" />
        </div>
      </div>
    </div>
  );
}

// src/components/Loader.tsx
//
// Reusable loader components for the app.
// Usage:
//   <PageLoader />                  — full-page centred loader
//   <SectionLoader />               — card/section height loader
//   <InlineLoader label="Saving" /> — small inline spinner with label

import { cn } from "@/lib/utils";

// ─── Pulse Ring Spinner ───────────────────────────────────────────────────────

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeMap = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <span
      className={cn("relative inline-flex", sizeMap[size], className)}
      aria-label="Loading"
      role="status"
    >
      {/* Outer pulse ring */}
      <span
        className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping"
        style={{ animationDuration: "1.2s" }}
      />
      {/* Inner spinning arc */}
      <span
        className={cn(
          "relative rounded-full border-2 border-transparent border-t-primary border-r-primary/50",
          sizeMap[size],
          "animate-spin",
        )}
        style={{ animationDuration: "0.75s" }}
      />
    </span>
  );
}

// ─── Three-dot pulsing dots ───────────────────────────────────────────────────

export function PulseDots({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      role="status"
      aria-label="Loading"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-primary animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
        />
      ))}
    </span>
  );
}

// ─── Bar shimmer skeleton ─────────────────────────────────────────────────────

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-muted/60",
        className,
      )}
    >
      <div
        className="
        absolute inset-0
        -translate-x-full
        bg-gradient-to-r
        from-transparent
        via-white/20
        to-transparent
        animate-shimmer
        "
      />
    </div>
  );
}
// ─── Stat card skeleton ───────────────────────────────────────────────────────

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

// ─── Page loader (full page) ──────────────────────────────────────────────────

export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-background/80 backdrop-blur-sm">
      <div className="relative">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl scale-150" />
        <Spinner size="lg" />
      </div>
      <p className="text-sm font-medium text-muted-foreground tracking-wide animate-pulse">
        {label}
      </p>
    </div>
  );
}

// ─── Section loader (inside a card or section) ────────────────────────────────

export function SectionLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-16",
        className,
      )}
    >
      <Spinner size="md" />
      <PulseDots />
    </div>
  );
}

// ─── Inline loader (button / label context) ───────────────────────────────────

export function InlineLoader({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Spinner size="sm" />
      {label && (
        <span className="text-sm text-muted-foreground animate-pulse">
          {label}
        </span>
      )}
    </span>
  );
}

// ─── Dashboard skeleton (full dashboard loading state) ────────────────────────

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stat cards — row 1 (4 cols) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Stat cards — row 2 (4 cols) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 flex-wrap">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-36 rounded-md" />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-xl border border-border p-6 space-y-4"
          >
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-[280px] w-full rounded-lg" />
          </div>
        ))}
      </div>

      {/* Transactions */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <Skeleton className="h-5 w-40" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded" />
        ))}
      </div>
    </div>
  );
}

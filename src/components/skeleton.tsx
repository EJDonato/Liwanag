import { cn } from "@/lib/utils";

// A placeholder block. It only pulses when the visitor hasn't asked for reduced motion,
// and screen readers skip it: the LoadingRegion around it announces "Loading" once instead.
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("rounded-lg bg-border motion-safe:animate-pulse", className)} />;
}

export function LoadingRegion({
  label = "Loading",
  className,
  children,
}: {
  label?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{label}…</span>
      {children}
    </div>
  );
}

export function SkeletonLines({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn("h-5", i === lines - 1 ? "w-3/5" : "w-full")} />
      ))}
    </div>
  );
}

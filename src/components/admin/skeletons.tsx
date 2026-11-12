import { LoadingRegion, Skeleton, SkeletonLines } from "@/components/skeleton";

// Skeletons for the admin pages. Each mirrors the real page's layout so nothing jumps when the
// content arrives. They are what shows the instant a link is clicked, while the data loads.

function Title({ subtitle = true }: { subtitle?: boolean }) {
  return (
    <div className="max-w-3xl space-y-3">
      <Skeleton className="h-10 w-56 sm:h-11" />
      {subtitle && <Skeleton className="h-6 w-full max-w-md" />}
    </div>
  );
}

function Pills({ count, className = "mt-8" }: { count: number; className?: string }) {
  return (
    <div className={`${className} flex flex-wrap gap-2`}>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-11 w-36 rounded-full" />
      ))}
    </div>
  );
}

function ItemRows({ count }: { count: number }) {
  return (
    <div className="mt-6 divide-y divide-border border-y border-border">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="grid gap-5 py-6 md:grid-cols-[1fr_auto] md:gap-10">
          <div className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-11 w-24 rounded-full" />
            <Skeleton className="h-11 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Testimonies and messages: title, filter pills, a list of items.
export function ListPageSkeleton({ pills = 3, rows = 4 }: { pills?: number; rows?: number }) {
  return (
    <LoadingRegion>
      <Title />
      <Pills count={pills} />
      <ItemRows count={rows} />
    </LoadingRegion>
  );
}

export function DashboardSkeleton() {
  return (
    <LoadingRegion>
      <Title />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-44 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="mt-12 h-8 w-44" />
      <Pills count={5} className="mt-5" />
      <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-16">
        {[0, 1].map((i) => (
          <div key={i}>
            <Skeleton className="h-8 w-52" />
            <div className="mt-4 space-y-6">
              {[0, 1, 2].map((j) => (
                <SkeletonLines key={j} lines={2} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}

export function SubmissionsSkeleton() {
  return (
    <LoadingRegion>
      <Title />
      <div className="mt-8 flex flex-wrap items-end gap-6">
        <Skeleton className="h-12 min-w-64 flex-1" />
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-11 w-28 rounded-full" />
      </div>
      <Skeleton className="mt-8 h-6 w-32" />
      <div className="mt-4 divide-y divide-border rounded-xl border border-border">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="flex items-center justify-between gap-6 px-4 py-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="hidden h-5 w-32 sm:block" />
            <Skeleton className="hidden h-5 w-24 md:block" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}

// A single client, or a single testimony being edited: back link, title, then stacked sections.
export function DetailSkeleton({ sections = 4 }: { sections?: number }) {
  return (
    <LoadingRegion>
      <Skeleton className="h-5 w-40" />
      <div className="mt-6">
        <Title />
      </div>
      <div className="mt-10">
        {Array.from({ length: sections }, (_, i) => (
          <div key={i} className="border-t border-border py-8">
            <Skeleton className="h-8 w-48" />
            <SkeletonLines lines={3} className="mt-6 max-w-3xl" />
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}

// The header and menu while the session is checked (first load, or a slow connection).
export function ConsoleChromeSkeleton() {
  return (
    <LoadingRegion label="Loading the admin menu">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-11 w-28 rounded-full" />
      </div>
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-6xl gap-1 px-4 sm:px-6">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="m-2 h-8 w-24" />
          ))}
        </div>
      </div>
    </LoadingRegion>
  );
}

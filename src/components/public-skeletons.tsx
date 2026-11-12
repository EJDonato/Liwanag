import { LoadingRegion, Skeleton, SkeletonLines } from "@/components/skeleton";

// Skeletons for the public pages' streamed parts. The headings and chrome around them are static
// and already on screen; these stand in for the bits that wait on the visitor's cookie or the database.

export function HubSkeleton() {
  return (
    <LoadingRegion label="Loading your forms" className="grid gap-14 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
      <div className="space-y-6">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex gap-5 py-2">
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-5 w-full max-w-sm" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <SkeletonLines lines={2} />
        <Skeleton className="h-12 w-56 rounded-full" />
      </div>
    </LoadingRegion>
  );
}

export function FormSkeleton() {
  return (
    <LoadingRegion label="Loading your form" className="space-y-10">
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
      <Skeleton className="h-12 w-44 rounded-full" />
    </LoadingRegion>
  );
}

export function TestimoniesSkeleton() {
  return (
    <LoadingRegion label="Loading testimonies" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="max-w-4xl space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-5/6" />
        <Skeleton className="h-10 w-2/3" />
      </div>
      <div className="mt-16 grid gap-12 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="border-t border-border pt-6">
            <SkeletonLines lines={i % 2 ? 3 : 2} />
            <Skeleton className="mt-4 h-5 w-24" />
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}

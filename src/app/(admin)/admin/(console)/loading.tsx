import { DashboardSkeleton } from "@/components/admin/skeletons";

// Shown the instant any admin page is clicked, while its data loads. Pages with their own
// loading.tsx below this folder show a skeleton shaped like themselves instead.
export default function Loading() {
  return <DashboardSkeleton />;
}

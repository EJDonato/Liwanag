import { db } from "@/lib/db";

// How many approved testimonies the page shows. The page is designed for a handful;
// add paging before raising this much.
export const TESTIMONY_LIMIT = 12;

// Only APPROVED rows ever reach the public (SYSTEM_DESIGN 6.3). Newest first; id breaks ties
// between rows created in the same instant, such as the seed.
export function getApprovedTestimonies() {
  return db.testimony.findMany({
    where: { status: "APPROVED" },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: TESTIMONY_LIMIT,
    select: { id: true, displayName: true, content: true },
  });
}

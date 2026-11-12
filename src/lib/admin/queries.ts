import { cache } from "react";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

// All of the admin area's reads live here. Callers must already have passed verifyAdmin().

// Counts for the navigation badges (every admin page) and the dashboard.
// cache(): the layout and the dashboard both ask for these in the same request; fetch them once.
export const getNavCounts = cache(async () => {
  const [pendingTestimonies, unreadMessages] = await Promise.all([
    db.testimony.count({ where: { status: "PENDING" } }),
    db.contactMessage.count({ where: { isRead: false } }),
  ]);
  return { pendingTestimonies, unreadMessages };
});

// A check-in is flagged when the safety question (the last item) was answered above "Not at all".
const safetyFlagged = {
  assessment: { is: { responses: { path: ["safetyFlag"], equals: true } } },
} satisfies Prisma.ClientWhereInput;

export async function getDashboardCounts() {
  const [nav, clients, flagged] = await Promise.all([
    getNavCounts(),
    db.client.count(),
    db.client.count({ where: safetyFlagged }),
  ]);
  return { ...nav, clients, flagged };
}

export type ClientFilter = { q?: string; flag?: boolean };

function clientWhere({ q, flag }: ClientFilter): Prisma.ClientWhereInput {
  const and: Prisma.ClientWhereInput[] = [];
  if (flag) and.push(safetyFlagged);
  const term = q?.trim();
  if (term) {
    and.push({
      OR: [
        { fullName: { contains: term, mode: "insensitive" } },
        { referenceCode: { contains: term.toUpperCase().replace(/\s+/g, "") } },
        { referenceCode: { contains: term.toUpperCase() } },
      ],
    });
  }
  return and.length ? { AND: and } : {};
}

// Reads the saved assessment JSON defensively: it was written by our own action, but staff pages
// should never crash on an odd row.
export function readAssessment(responses: unknown) {
  const r = (responses && typeof responses === "object" ? responses : {}) as Record<string, unknown>;
  return {
    answers: Array.isArray(r.answers) ? r.answers.map((n) => Number(n)) : [],
    notes: typeof r.notes === "string" ? r.notes : undefined,
    band: typeof r.band === "string" ? r.band : undefined,
    safetyFlag: r.safetyFlag === true,
  };
}

export async function listClients(filter: ClientFilter, take = 100) {
  const clients = await db.client.findMany({
    where: clientWhere(filter),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take,
    select: {
      referenceCode: true,
      fullName: true,
      createdAt: true,
      consent: { select: { signedAt: true } },
      privacy: { select: { signedAt: true } },
      interview: { select: { submittedAt: true } },
      assessment: { select: { totalScore: true, responses: true, submittedAt: true } },
      exit: { select: { submittedAt: true, ratings: true } },
    },
  });
  return clients.map((c) => ({
    ...c,
    safetyFlag: c.assessment ? readAssessment(c.assessment.responses).safetyFlag : false,
    formsDone: [c.consent, c.privacy, c.interview, c.assessment, c.exit].filter(Boolean).length,
  }));
}

export async function getClientDetail(referenceCode: string) {
  return db.client.findUnique({
    where: { referenceCode },
    include: { consent: true, privacy: true, interview: true, assessment: true, exit: true },
  });
}

export type TestimonyStatus = "PENDING" | "APPROVED" | "REJECTED";

export function listTestimonies(status: TestimonyStatus, take = 100) {
  return db.testimony.findMany({
    where: { status },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take,
    select: { id: true, displayName: true, content: true, createdAt: true },
  });
}

export function listMessages(unreadOnly: boolean, take = 100) {
  return db.contactMessage.findMany({
    where: unreadOnly ? { isRead: false } : {},
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take,
  });
}

export async function getTestimonyCounts() {
  const groups = await db.testimony.groupBy({ by: ["status"], _count: { _all: true } });
  const count = (s: TestimonyStatus) => groups.find((g) => g.status === s)?._count._all ?? 0;
  return { PENDING: count("PENDING"), APPROVED: count("APPROVED"), REJECTED: count("REJECTED") };
}

// Everything the CSV export needs, one row per client. Same filters as the list on screen.
export async function exportClients(filter: ClientFilter, take = 5000) {
  const clients = await db.client.findMany({
    where: clientWhere(filter),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take,
    include: { consent: true, privacy: true, interview: true, assessment: true, exit: true },
  });
  return clients.map((c) => {
    const a = c.assessment ? readAssessment(c.assessment.responses) : null;
    const ratings = (c.exit?.ratings && typeof c.exit.ratings === "object" ? c.exit.ratings : {}) as Record<string, unknown>;
    return { client: c, assessment: a, exitOverall: typeof ratings.overall === "number" ? ratings.overall : null };
  });
}

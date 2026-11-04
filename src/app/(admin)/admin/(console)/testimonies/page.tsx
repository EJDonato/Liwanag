import type { Metadata } from "next";
import Link from "next/link";
import { ActionButton, FilterTabs, PageTitle, linkButtonClass } from "@/components/admin/ui";
import { verifyAdmin } from "@/lib/admin/dal";
import { formatDateTime } from "@/lib/admin/format";
import { getTestimonyCounts, listTestimonies, type TestimonyStatus } from "@/lib/admin/queries";
import { approveTestimony, rejectTestimony, restoreTestimony } from "./actions";

export const metadata: Metadata = { title: "Testimonies" };

const tabs = [
  { key: "pending", status: "PENDING", label: "Waiting for review" },
  { key: "approved", status: "APPROVED", label: "On the site" },
  { key: "rejected", status: "REJECTED", label: "Declined" },
] as const satisfies readonly { key: string; status: TestimonyStatus; label: string }[];

const emptyText = {
  pending: "Nothing is waiting. New testimonies from the public form and the exit form appear here.",
  approved: "No testimonies are on the site yet. Approve one from the waiting list.",
  rejected: "No testimonies have been declined.",
} as const;

export default async function TestimoniesAdminPage({ searchParams }: PageProps<"/admin/testimonies">) {
  await verifyAdmin();
  const { status: raw } = await searchParams;
  const tab = tabs.find((t) => t.key === raw) ?? tabs[0];

  const [items, counts] = await Promise.all([listTestimonies(tab.status), getTestimonyCounts()]);

  return (
    <>
      <PageTitle title="Testimonies">Nothing appears on the public site until you approve it.</PageTitle>

      <FilterTabs
        label="Testimony status"
        items={tabs.map((t) => ({
          label: t.label,
          href: `/admin/testimonies?status=${t.key}`,
          active: t.key === tab.key,
          count: counts[t.status],
        }))}
      />

      {items.length === 0 ? (
        <p className="mt-10 max-w-xl text-lg text-muted-foreground">{emptyText[tab.key]}</p>
      ) : (
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {items.map((t) => (
            <li key={t.id} className="py-6">
              <div className="grid gap-5 md:grid-cols-[1fr_auto] md:gap-10">
                <div className="min-w-0">
                  <p className="whitespace-pre-line text-lg leading-relaxed [overflow-wrap:anywhere]">“{t.content}”</p>
                  <p className="mt-3 text-muted-foreground [overflow-wrap:anywhere]">
                    <strong className="text-foreground">{t.displayName}</strong> · {formatDateTime(t.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap content-start gap-2 md:justify-end">
                  {tab.key === "pending" && (
                    <>
                      <ActionButton action={approveTestimony.bind(null, t.id)} tone="primary">
                        Approve
                      </ActionButton>
                      <ActionButton action={rejectTestimony.bind(null, t.id)}>Decline</ActionButton>
                    </>
                  )}
                  {tab.key === "approved" && (
                    <ActionButton action={restoreTestimony.bind(null, t.id)}>Take off the site</ActionButton>
                  )}
                  {tab.key === "rejected" && (
                    <ActionButton action={restoreTestimony.bind(null, t.id)}>Move back to waiting</ActionButton>
                  )}
                  <Link href={`/admin/testimonies/${t.id}`} className={linkButtonClass()}>
                    Edit
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

import type { Metadata } from "next";
import {
  Check,
  ChevronRight,
  MessageSquareText,
  Quote,
  TriangleAlert,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { verifyAdmin } from "@/lib/admin/dal";
import { formatDate } from "@/lib/admin/format";
import { getDashboardCounts, listClients, listMessages, listTestimonies } from "@/lib/admin/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

// A count you can click. Colour is never the only signal: the status line says it in words too.
function StatCard({
  href,
  icon: Icon,
  label,
  count,
  needsText,
  needs,
  hot,
  plain,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  count: number;
  needsText: string;
  needs: boolean;
  hot?: boolean;
  plain?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex min-h-44 flex-col justify-between gap-6 rounded-2xl border p-5 transition-colors",
        hot ? "border-transparent bg-accent hover:bg-accent/70" : "border-border bg-card hover:bg-mist",
      )}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-semibold">
          <Icon aria-hidden="true" className="size-5 shrink-0" />
          {label}
        </span>
        <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </span>
      <span>
        <span className="block font-heading text-5xl font-semibold leading-none">{count}</span>
        <span className="mt-3 flex items-center gap-1.5 text-muted-foreground">
          {plain ? (
            plain
          ) : needs ? (
            needsText
          ) : (
            <>
              <Check aria-hidden="true" className="size-4 text-success" />
              All clear
            </>
          )}
        </span>
      </span>
    </Link>
  );
}

function Panel({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <Link href={href} className="font-semibold underline underline-offset-4 hover:text-night-2">
          See all
        </Link>
      </div>
      {children}
    </section>
  );
}

const empty = "py-6 text-muted-foreground";

export default async function DashboardPage() {
  const admin = await verifyAdmin();
  const [c, pending, unread, newest] = await Promise.all([
    getDashboardCounts(),
    listTestimonies("PENDING", 3),
    listMessages(true, 3),
    listClients({}, 5),
  ]);

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Dashboard</h1>
      <p className="mt-3 text-lg text-muted-foreground [overflow-wrap:anywhere]">Welcome back, {admin.username}.</p>

      <h2 className="sr-only">Overview</h2>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          href="/admin/submissions?flag=safety"
          icon={TriangleAlert}
          label="Safety answers"
          count={c.flagged}
          needs={c.flagged > 0}
          needsText="Check-ins to follow up"
          hot={c.flagged > 0}
        />
        <StatCard href="/admin/testimonies" icon={Quote} label="Testimonies" count={c.pendingTestimonies} needs={c.pendingTestimonies > 0} needsText="Waiting for review" />
        <StatCard href="/admin/messages?show=unread" icon={MessageSquareText} label="Messages" count={c.unreadMessages} needs={c.unreadMessages > 0} needsText="Unread" />
        <StatCard href="/admin/submissions" icon={Users} label="Clients" count={c.clients} needs={false} needsText="" plain="Started the forms" />
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <Panel title="Waiting for review" href="/admin/testimonies">
          {pending.length === 0 ? (
            <p className={empty}>No testimonies waiting.</p>
          ) : (
            <ul className="divide-y divide-border">
              {pending.map((t) => (
                <li key={t.id}>
                  <Link href="/admin/testimonies" className="-mx-3 block rounded-xl px-3 py-4 hover:bg-mist">
                    <span className="line-clamp-2 block text-lg [overflow-wrap:anywhere]">“{t.content}”</span>
                    <span className="mt-1 block text-muted-foreground [overflow-wrap:anywhere]">
                      {t.displayName} · {formatDate(t.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Unread messages" href="/admin/messages?show=unread">
          {unread.length === 0 ? (
            <p className={empty}>No unread messages.</p>
          ) : (
            <ul className="divide-y divide-border">
              {unread.map((m) => (
                <li key={m.id}>
                  <Link href="/admin/messages?show=unread" className="-mx-3 block rounded-xl px-3 py-4 hover:bg-mist">
                    <span className="block font-semibold [overflow-wrap:anywhere]">{m.name}</span>
                    <span className="line-clamp-2 block text-lg [overflow-wrap:anywhere]">{m.message}</span>
                    <span className="mt-1 block text-muted-foreground">{formatDate(m.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-14">
        <Panel title="Newest clients" href="/admin/submissions">
          {newest.length === 0 ? (
            <p className={empty}>No one has started the forms yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {newest.map((cl) => (
                <li key={cl.referenceCode}>
                  <Link
                    href={`/admin/submissions/${cl.referenceCode}`}
                    className={cn("-mx-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 rounded-xl px-3 py-4 hover:bg-mist", cl.safetyFlag && "bg-accent hover:bg-accent/70")}
                  >
                    <span className="font-semibold [overflow-wrap:anywhere]">{cl.fullName}</span>
                    <span className="flex flex-wrap items-center gap-x-5 gap-y-1 text-muted-foreground">
                      {cl.safetyFlag && (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                          <TriangleAlert aria-hidden="true" className="size-4" />
                          Safety answer
                        </span>
                      )}
                      <span className="font-heading text-foreground">{cl.referenceCode}</span>
                      <span>{cl.formsDone} of 5 forms</span>
                      <span>{formatDate(cl.createdAt)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}

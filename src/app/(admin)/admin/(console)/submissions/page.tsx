import type { Metadata } from "next";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { PageTitle, linkButtonClass } from "@/components/admin/ui";
import { verifyAdmin } from "@/lib/admin/dal";
import { formatDate } from "@/lib/admin/format";
import { listClients } from "@/lib/admin/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Submissions" };

const LIMIT = 100;

export default async function SubmissionsPage({ searchParams }: PageProps<"/admin/submissions">) {
  await verifyAdmin();
  const sp = await searchParams;
  const q = (typeof sp.q === "string" ? sp.q : "").slice(0, 100).trim();
  const flag = sp.flag === "safety";

  const clients = await listClients({ q, flag }, LIMIT);

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (flag) params.set("flag", "safety");
  const exportHref = `/admin/submissions/export${params.size ? `?${params}` : ""}`;
  const filtered = !!q || flag;

  return (
    <>
      <PageTitle title="Submissions">Everyone who has started the forms, newest first. This is sensitive health information: view it only for clinic work.</PageTitle>

      <form method="get" action="/admin/submissions" role="search" className="mt-8 flex flex-wrap items-end gap-x-6 gap-y-4">
        <div className="min-w-64 flex-1 space-y-2">
          <label htmlFor="q" className="block font-semibold">
            Search by name or reference code
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            autoComplete="off"
            className="min-h-12 w-full rounded-xl border border-input bg-white px-4 text-base"
          />
        </div>
        <label className="flex min-h-12 cursor-pointer items-center gap-3">
          <input type="checkbox" name="flag" value="safety" defaultChecked={flag} className="size-6 accent-night" />
          <span>Only check-ins with a safety answer</span>
        </label>
        <div className="flex gap-2">
          <button type="submit" className={linkButtonClass("primary")}>
            Search
          </button>
          {filtered && (
            <Link href="/admin/submissions" className={linkButtonClass()}>
              Clear
            </Link>
          )}
        </div>
      </form>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-muted-foreground" aria-live="polite">
          {clients.length === 0
            ? "No clients match."
            : `${clients.length === LIMIT ? `Newest ${LIMIT}` : clients.length} ${clients.length === 1 ? "client" : "clients"}${filtered ? " match" : ""}.`}
        </p>
        <Link href={exportHref} prefetch={false} className={linkButtonClass()}>
          Download CSV{filtered ? " of these results" : ""}
        </Link>
      </div>

      {clients.length > 0 && (
        <div
          role="region"
          aria-label="Submissions table. It scrolls sideways on small screens."
          tabIndex={0}
          className="mt-4 overflow-x-auto rounded-xl border border-border"
        >
          <table className="w-full min-w-[44rem] border-collapse text-left">
            <thead className="bg-mist text-sm">
              <tr>
                {["Client", "Reference code", "Started", "Forms done", "Check-in score", "Flag"].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clients.map((c) => (
                <tr key={c.referenceCode} className={cn(c.safetyFlag && "bg-accent")}>
                  <th scope="row" className="px-4 py-4 font-semibold [overflow-wrap:anywhere]">
                    <Link href={`/admin/submissions/${c.referenceCode}`} className="underline underline-offset-4 hover:text-night-2">
                      {c.fullName}
                    </Link>
                  </th>
                  <td className="whitespace-nowrap px-4 py-4 font-heading">{c.referenceCode}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">{formatDate(c.createdAt)}</td>
                  <td className="whitespace-nowrap px-4 py-4">{c.formsDone} of 5</td>
                  <td className="whitespace-nowrap px-4 py-4">{c.assessment ? `${c.assessment.totalScore} of 30` : <span className="text-muted-foreground">Not yet</span>}</td>
                  <td className="whitespace-nowrap px-4 py-4">
                    {c.safetyFlag ? (
                      <span className="inline-flex items-center gap-1.5 font-semibold">
                        <TriangleAlert aria-hidden="true" className="size-5" />
                        Safety answer
                      </span>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

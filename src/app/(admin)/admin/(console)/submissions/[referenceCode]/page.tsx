import type { Metadata } from "next";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { linkButtonClass } from "@/components/admin/ui";
import { TextField } from "@/components/forms/fields";
import { FormFrame } from "@/components/forms/form-frame";
import { verifyAdmin } from "@/lib/admin/dal";
import { formatBirthdate, formatDateTime, renderClock } from "@/lib/admin/format";
import { getClientDetail, readAssessment } from "@/lib/admin/queries";
import { assessmentItems, assessmentScale, safetyItemIndex } from "@/lib/services/assessment";
import { normalizeReferenceCode } from "@/lib/services/reference-code";
import { cn } from "@/lib/utils";
import { ageOn, contactOptions, exitRatings, historyOptions } from "@/lib/validation/forms";
import { deleteClient } from "../actions";

export const metadata: Metadata = { title: "Submission" };

const bandLabel: Record<string, string> = { steady: "Steady", strained: "Some strain", heavy: "A lot of strain" };

function Section({ title, submittedAt, children }: { title: string; submittedAt?: Date; children?: React.ReactNode }) {
  return (
    <section className="border-t border-border py-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-muted-foreground">{submittedAt ? `Submitted ${formatDateTime(submittedAt)}` : "Not submitted yet"}</p>
      </div>
      {submittedAt && <div className="mt-6">{children}</div>}
    </section>
  );
}

function Facts({ children }: { children: React.ReactNode }) {
  return <dl className="grid max-w-3xl gap-x-10 gap-y-5 sm:grid-cols-[minmax(0,14rem)_1fr]">{children}</dl>;
}

function Fact({ label, children }: { label: string; children?: React.ReactNode }) {
  const empty = children === undefined || children === null || children === "";
  return (
    <>
      <dt className="font-semibold text-muted-foreground">{label}</dt>
      <dd className="whitespace-pre-line [overflow-wrap:anywhere] sm:pt-0">{empty ? <span className="text-muted-foreground">Not given</span> : children}</dd>
    </>
  );
}

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v : undefined);
const label = (options: readonly { value: string; label: string }[], v: unknown) =>
  options.find((o) => o.value === v)?.label ?? str(v);

export default async function SubmissionDetailPage({ params }: PageProps<"/admin/submissions/[referenceCode]">) {
  await verifyAdmin();
  const { referenceCode: raw } = await params;
  const code = normalizeReferenceCode(decodeURIComponent(raw));
  const client = code ? await getClientDetail(code) : null;
  if (!client) notFound();

  const iv = (client.interview?.responses ?? {}) as Record<string, unknown>;
  const concerns = Array.isArray(iv.concerns) ? iv.concerns.filter((c): c is string => typeof c === "string") : [];
  const a = client.assessment ? readAssessment(client.assessment.responses) : null;
  const ratings = (client.exit?.ratings ?? {}) as Record<string, unknown>;
  const safetyAnswer = a ? assessmentScale.find((s) => s.value === a.answers[safetyItemIndex])?.label : undefined;

  return (
    <div>
      <p>
        <Link href="/admin/submissions" className="text-muted-foreground underline underline-offset-4 hover:text-foreground">
          Back to submissions
        </Link>
      </p>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight [overflow-wrap:anywhere] sm:text-4xl">{client.fullName}</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        <span className="font-heading text-foreground">{client.referenceCode}</span> · started {formatDateTime(client.createdAt)}
      </p>

      {a?.safetyFlag && (
        <div role="note" className="mt-8 flex max-w-3xl gap-4 rounded-2xl bg-accent p-5">
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-6 shrink-0" />
          <p className="text-lg leading-snug">
            <strong>This check-in includes a safety answer.</strong> They answered “{safetyAnswer}” to “
            {assessmentItems[safetyItemIndex]}”. Follow your clinic&apos;s own procedure for following up.
          </p>
        </div>
      )}

      <div className="mt-10">
        <Section title="About this client" submittedAt={client.createdAt}>
          <Facts>
            <Fact label="Email">{client.email ? <a href={`mailto:${client.email}`} className="underline underline-offset-4">{client.email}</a> : undefined}</Fact>
            <Fact label="Phone">{client.phone ?? undefined}</Fact>
            <Fact label="Birthdate">
              {client.birthdate ? `${formatBirthdate(client.birthdate)} (age ${ageOn(client.birthdate, renderClock())})` : undefined}
            </Fact>
            <Fact label="Parent or guardian">{client.consent?.guardianName ?? undefined}</Fact>
          </Facts>
        </Section>

        <Section title="Consent" submittedAt={client.consent?.signedAt}>
          <Facts>
            <Fact label="Agreed">
              Taking part is their choice and they can stop at any time. They understand confidentiality and its limits. They understand
              Liwanag is not an emergency service.
            </Fact>
            <Fact label="Signed as">{client.consent?.signature}</Fact>
          </Facts>
        </Section>

        <Section title="Data privacy" submittedAt={client.privacy?.signedAt}>
          <Facts>
            <Fact label="Acknowledged">
              Read the privacy notice, agreed to how their information is handled, and understands their rights.
            </Fact>
            <Fact label="Signed as">{client.privacy?.signature}</Fact>
          </Facts>
        </Section>

        <Section title="Interview" submittedAt={client.interview?.submittedAt}>
          <Facts>
            <Fact label="Reason for coming">{str(iv.reason)}</Fact>
            <Fact label="Feels true right now">{concerns.length ? concerns.join(", ") : undefined}</Fact>
            <Fact label="Anything else">{str(iv.concernsOther)}</Fact>
            <Fact label="Talked to a professional before">{label(historyOptions, iv.history)}</Fact>
            <Fact label="About that">{str(iv.historyDetails)}</Fact>
            <Fact label="Who supports them">{str(iv.supportSystem)}</Fact>
            <Fact label="Prefers contact by">{label(contactOptions, iv.preferredContact)}</Fact>
            <Fact label="Best times">{str(iv.bestTime)}</Fact>
            <Fact label="Pronouns">{str(iv.pronouns)}</Fact>
            <Fact label="Grade or year">{str(iv.yearLevel)}</Fact>
          </Facts>
        </Section>

        <Section title="Check-in assessment" submittedAt={client.assessment?.submittedAt}>
          {a && client.assessment && (
            <>
              <p className="text-lg">
                Score <strong className="font-heading text-2xl">{client.assessment.totalScore}</strong> of 30
                {a.band && <> · {bandLabel[a.band] ?? a.band}</>}
              </p>
              <p className="mt-1 text-muted-foreground">A screening conversation starter, not a diagnosis.</p>
              <ol className="mt-6 max-w-3xl divide-y divide-border border-y border-border">
                {assessmentItems.map((item, i) => {
                  const answer = assessmentScale.find((s) => s.value === a.answers[i]);
                  const flagged = i === safetyItemIndex && a.safetyFlag;
                  return (
                    <li key={item} className={`flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3 ${flagged ? "-mx-3 rounded-lg bg-accent px-3 font-semibold" : ""}`}>
                      <span>
                        {i + 1}. {item}
                      </span>
                      <span className={flagged ? "" : "text-muted-foreground"}>{answer ? answer.label : "No answer"}</span>
                    </li>
                  );
                })}
              </ol>
              <div className="mt-6">
                <Facts>
                  <Fact label="Notes to counselor">{a.notes}</Fact>
                </Facts>
              </div>
            </>
          )}
        </Section>

        <Section title="Exit feedback" submittedAt={client.exit?.submittedAt}>
          <Facts>
            {exitRatings.map((r) => (
              <Fact key={r.name} label={r.label}>
                {typeof ratings[r.name] === "number" ? `${ratings[r.name]} of 5` : undefined}
              </Fact>
            ))}
            <Fact label="What has changed">{str(ratings.progressNotes)}</Fact>
            <Fact label="Comments">{client.exit?.comments ?? undefined}</Fact>
            <Fact label="Agreed to share as a testimony">{client.exit?.allowTestimony ? "Yes (it is in the testimony queue)" : "No"}</Fact>
          </Facts>
        </Section>

        <section className="border-t border-border py-8">
          <details>
            <summary className={cn(linkButtonClass("danger"), "cursor-pointer list-none")}>Delete this client&apos;s records…</summary>
            <div className="mt-6 max-w-xl rounded-2xl border border-error bg-white p-6">
              <p className="text-lg leading-snug">
                This permanently deletes {client.fullName}&apos;s consent, privacy, interview, assessment and exit forms. It cannot
                be undone. Use it when someone asks for their information to be erased.
              </p>
              <p className="mt-3 text-muted-foreground">
                A testimony they agreed to share is not linked to them, so it stays in the testimonies list. Remove it there too if
                they asked for that.
              </p>
              <div className="mt-6">
                <FormFrame action={deleteClient} submitLabel="Delete everything for this client" backLink={false}>
                  <input type="hidden" name="referenceCode" value={client.referenceCode} />
                  <TextField name="confirm" label={`Type ${client.referenceCode} to confirm`} required autoComplete="off" />
                </FormFrame>
              </div>
            </div>
          </details>
        </section>
      </div>
    </div>
  );
}

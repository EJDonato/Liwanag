import type { Metadata } from "next";
import { Check, Lock } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { resumeWithCode, startOver } from "@/app/(site)/forms/actions";
import { ButtonLink } from "@/components/button-link";
import { TextField } from "@/components/forms/fields";
import { FormFrame } from "@/components/forms/form-frame";
import { PageHeader } from "@/components/page-header";
import { HubSkeleton } from "@/components/public-skeletons";
import { firstName, getProgress, missingStep, stepKeys, type StepKey } from "@/lib/services/clients";
import { getReferenceCode } from "@/lib/session";
import { formSteps } from "@/lib/site";

export const metadata: Metadata = {
  title: "Forms",
  description: "Complete Liwanag's consent, data privacy, interview, assessment and exit forms online.",
};

async function FormsHub() {
  const progress = await getProgress(await getReferenceCode());

  return (
    <div className="grid gap-14 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
      <div>
        {progress ? (
          <div className="mb-8 rounded-2xl bg-mist p-6 [overflow-wrap:anywhere]">
            <p className="text-lg">
              Welcome back, <strong>{firstName(progress.fullName)}</strong>.
            </p>
            <p className="mt-1 text-muted-foreground">
              Your reference code is{" "}
              <strong className="font-heading text-foreground">{progress.referenceCode}</strong>
            </p>
          </div>
        ) : null}

        <ol className="space-y-1">
          {formSteps.map((step, i) => {
            const key = stepKeys[i] as StepKey;
            const done = progress?.done[key] ?? false;
            const locked = key !== "consent" && (!progress || !!missingStep(progress, key));
            const isNext =
              !done && !locked && stepKeys.slice(0, i).every((k) => progress?.done[k] || k === key);
            const status = done ? "Done" : locked ? "Locked until the earlier forms are done" : isNext ? "Up next" : "Ready";
            const body = (
              <>
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full font-heading text-base font-semibold ${
                    done
                      ? "bg-success text-white"
                      : locked
                        ? "bg-mist text-muted-foreground"
                        : isNext
                          ? "bg-sun text-night ring-2 ring-night"
                          : "bg-night text-sun"
                  }`}
                >
                  {done ? <Check className="size-5" strokeWidth={2.5} /> : locked ? <Lock className="size-4" /> : i + 1}
                </span>
                <span>
                  <span className="block font-heading text-xl font-semibold">{step.name}</span>
                  <span className="mt-1 block text-muted-foreground">{step.text}</span>
                  <span className={`mt-1 block text-sm font-semibold ${done ? "text-success" : ""}`}>
                    {status}
                  </span>
                </span>
              </>
            );
            return (
              <li key={step.href} className="rise-in" style={{ "--rise-delay": `${i * 0.06}s`, animationDuration: "0.45s" } as React.CSSProperties}>
                {locked ? (
                  <div className="flex gap-5 rounded-2xl py-4 pr-4">{body}</div>
                ) : (
                  <Link
                    href={step.href}
                    className="flex gap-5 rounded-2xl py-4 pr-4 transition-colors hover:bg-mist"
                  >
                    {body}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <aside className="space-y-10">
        {progress ? (
          <form action={startOver}>
            <p className="mb-3 text-muted-foreground">
              On a shared computer, or starting for someone else?
            </p>
            <button
              type="submit"
              className="inline-flex min-h-12 items-center rounded-full border border-input px-6 font-semibold hover:bg-mist"
            >
              Use a different reference code
            </button>
          </form>
        ) : (
          <>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">New here?</h2>
              <p className="mt-3 text-lg text-muted-foreground">
                Begin with consent. You will get a reference code at the end of it.
              </p>
              <div className="mt-5">
                <ButtonLink href="/forms/consent">Begin with consent</ButtonLink>
              </div>
            </div>
            <div className="border-t border-border pt-10">
              <h2 className="text-2xl font-semibold tracking-tight">Already started?</h2>
              <p className="mt-3 mb-5 text-lg text-muted-foreground">
                Enter your reference code to pick up where you left off.
              </p>
              <FormFrame action={resumeWithCode} submitLabel="Continue" backLink={false}>
                <TextField name="code" label="Reference code" required hint="It looks like LWN-7K2Q-9XMA." autoComplete="off" />
              </FormFrame>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

export default function FormsPage() {
  return (
    <>
      <PageHeader title="Forms">
        <p>
          Five short forms, one at a time, in this order. You can stop after any step and come back
          with your reference code.
        </p>
      </PageHeader>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-20">
        <Suspense fallback={<HubSkeleton />}>
          <FormsHub />
        </Suspense>
      </section>
    </>
  );
}

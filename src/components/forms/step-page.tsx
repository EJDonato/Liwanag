import { Suspense } from "react";
import { startOver } from "@/app/(site)/forms/actions";
import { ButtonLink } from "@/components/button-link";
import { PageHeader } from "@/components/page-header";
import { FormSkeleton } from "@/components/public-skeletons";
import { firstName, getProgress, missingStep, type StepKey } from "@/lib/services/clients";
import { getReferenceCode } from "@/lib/session";
import { formSteps } from "@/lib/site";
import { cn } from "@/lib/utils";

// Position in the journey, not stored progress, so it lives in the static shell. Sage is behind you,
// sun with a dark rim is where you are (sun alone is 1.4:1 on cream), an outline is ahead.
// Fill, rim and outline differ in shape too, so the state never depends on color alone.
function StepProgress({ index }: { index: number }) {
  return (
    <ol aria-label="Form progress" className="mt-5 flex max-w-sm gap-2">
      {formSteps.map((s, i) => {
        const state = i < index ? "earlier" : i === index ? "current" : "later";
        return (
          <li key={s.href} aria-current={state === "current" ? "step" : undefined} className="flex-1">
            <span
              aria-hidden="true"
              className={cn(
                "block h-3 rounded-full border-2",
                state === "earlier" && "border-sage bg-sage",
                state === "current" && "border-night bg-sun",
                state === "later" && "border-input",
              )}
            />
            <span className="sr-only">
              {s.name}, {state} step
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5 rounded-2xl bg-mist p-6 sm:p-8">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="space-y-4 text-lg leading-relaxed [overflow-wrap:anywhere]">{children}</div>
    </div>
  );
}

function StartOverButton() {
  return (
    <form action={startOver}>
      <button
        type="submit"
        className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        Not you? Use a different reference code
      </button>
    </form>
  );
}

// Runs on every request: it reads the reference-code cookie, so it must sit inside <Suspense>.
async function Gate({ step, children }: { step: StepKey; children: React.ReactNode }) {
  const progress = await getProgress(await getReferenceCode());
  const index = formSteps.findIndex((s) => s.href === `/forms/${step}`);
  const name = formSteps[index].name;
  const next = formSteps[index + 1];

  if (step !== "consent" && !progress) {
    return (
      <Notice title="Let's start with consent">
        <p>
          We need your consent and a reference code before the {name.toLowerCase()} form. If you
          have already begun, enter your code on the Forms page.
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/forms/consent">Begin with consent</ButtonLink>
          <ButtonLink href="/forms" variant="line">
            I have a reference code
          </ButtonLink>
        </div>
      </Notice>
    );
  }

  if (progress) {
    const missing = missingStep(progress, step);
    if (missing) {
      const target = formSteps.find((s) => s.href === `/forms/${missing}`)!;
      return (
        <Notice title={`Please complete the ${target.name} form first`}>
          <p>It comes before the {name.toLowerCase()} form so you know how your information is handled.</p>
          <ButtonLink href={target.href}>Go to {target.name}</ButtonLink>
        </Notice>
      );
    }

    if (progress.done[step]) {
      return (
        <Notice title={`The ${name.toLowerCase()} form is done`}>
          <p>
            Thank you, {firstName(progress.fullName)}. Your reference code is{" "}
            <strong className="font-heading">{progress.referenceCode}</strong>.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <ButtonLink href={next?.href ?? "/forms"}>{next ? `Continue to ${next.name}` : "Back to all forms"}</ButtonLink>
            <StartOverButton />
          </div>
        </Notice>
      );
    }
  }

  return (
    <>
      {progress && (
        <p className="mb-8 text-muted-foreground [overflow-wrap:anywhere]">
          Continuing as <strong className="text-foreground">{firstName(progress.fullName)}</strong> ·{" "}
          {progress.referenceCode}
        </p>
      )}
      {children}
    </>
  );
}

export function StepPage({
  step,
  title,
  intro,
  children,
}: {
  step: StepKey;
  title: string;
  intro: React.ReactNode;
  children: React.ReactNode;
}) {
  const index = formSteps.findIndex((s) => s.href === `/forms/${step}`);
  return (
    <>
      <PageHeader title={title}>
        <p className="text-base font-semibold text-foreground">
          Step {index + 1} of {formSteps.length}
        </p>
        <StepProgress index={index} />
        <p className="mt-5">{intro}</p>
      </PageHeader>
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
        <Suspense fallback={<FormSkeleton />}>
          <Gate step={step}>{children}</Gate>
        </Suspense>
      </section>
    </>
  );
}

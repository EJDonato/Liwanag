import { Suspense } from "react";
import { startOver } from "@/app/forms/actions";
import { ButtonLink } from "@/components/button-link";
import { PageHeader } from "@/components/page-header";
import { firstName, getProgress, missingStep, type StepKey } from "@/lib/services/clients";
import { getReferenceCode } from "@/lib/session";
import { formSteps } from "@/lib/site";

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5 rounded-2xl bg-mist p-6 sm:p-8">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="space-y-4 text-lg leading-relaxed">{children}</div>
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
        <p className="mb-8 text-muted-foreground">
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
        <p className="mt-2">{intro}</p>
      </PageHeader>
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
        <Suspense fallback={<p className="text-muted-foreground">Loading your form…</p>}>
          <Gate step={step}>{children}</Gate>
        </Suspense>
      </section>
    </>
  );
}

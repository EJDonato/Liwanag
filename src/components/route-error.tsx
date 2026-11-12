"use client";

import { ButtonLink } from "@/components/button-link";
import { PageHeader } from "@/components/page-header";
import { hotlines } from "@/lib/site";

// Shared recovery view for a route whose page failed to load (for example the database is
// unreachable). Failures while submitting a form are handled inside the form, where answers are kept.
export function RouteError({ reset, message }: { reset: () => void; message: string }) {
  return (
    <>
      <PageHeader title="We could not load this page">
        <p>{message}</p>
      </PageHeader>
      <section className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6 lg:py-16">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-night px-8 text-base font-semibold text-white transition-colors hover:bg-night-2"
          >
            Try again
          </button>
          <ButtonLink href="/" variant="line">
            Back to home
          </ButtonLink>
        </div>
        <p className="text-lg text-muted-foreground">
          If you need to talk to someone right now, you do not have to wait for this page:{" "}
          {hotlines[0].name} on{" "}
          <a
            href={`tel:${hotlines[0].numbers[0].replace(/[^\d+]/g, "")}`}
            className="font-semibold text-foreground underline underline-offset-4"
          >
            {hotlines[0].numbers[0]}
          </a>
          .
        </p>
      </section>
    </>
  );
}

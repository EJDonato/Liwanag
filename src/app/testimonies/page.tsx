import type { Metadata } from "next";
import { Suspense } from "react";
import { submitTestimony } from "@/app/testimonies/actions";
import { ButtonLink } from "@/components/button-link";
import { CheckboxField, TextAreaField, TextField } from "@/components/forms/fields";
import { FormFrame } from "@/components/forms/form-frame";
import { PageHeader } from "@/components/page-header";
import { getApprovedTestimonies } from "@/lib/services/testimonies";
import { cn } from "@/lib/utils";
import { DISPLAY_NAME_MAX, TESTIMONY_MAX, TESTIMONY_MIN } from "@/lib/validation/testimony";

export const metadata: Metadata = {
  title: "Testimonies",
  description: "Words from people who took the step and reached out to Liwanag.",
};

// Quotes are user-written text: keep their line breaks, and let long unbroken strings wrap.
const quoteText = "whitespace-pre-line [overflow-wrap:anywhere]";

// A short line reads as a pull quote in the heading face; a longer one stays in body text.
const PULL_QUOTE_MAX = 90;

async function Testimonies() {
  const [lead, ...rest] = await getApprovedTestimonies();

  if (!lead) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          No testimonies yet
        </h2>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          When people share their experience and our team has reviewed it, it will appear here. You
          could be the first.
        </p>
        <div className="mt-8">
          <ButtonLink href="#share">Share your experience</ButtonLink>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* The newest voice leads, on the same forest band the rest of the site uses for emphasis. */}
      <section className="on-night bg-night text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <h2 className="sr-only">Most recent testimony</h2>
          <figure className="max-w-4xl">
            <blockquote>
              <p className={cn("font-heading text-3xl leading-snug sm:text-4xl lg:text-5xl", quoteText)}>
                “{lead.content}”
              </p>
            </blockquote>
            <figcaption className="mt-8 text-lg text-night-text">{lead.displayName}</figcaption>
          </figure>
        </div>
      </section>

      {rest.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <h2 className="sr-only">More testimonies</h2>
          {/*
            Columns, not a grid: quotes are different lengths, so they flow like a magazine page
            and each keeps its natural height. Reading order runs down each column, which is also
            the source order, so keyboard and screen-reader order match what you see.
          */}
          <ul className="columns-1 gap-x-12 md:columns-2 lg:columns-3 lg:gap-x-16">
            {rest.map((t) => {
              const pull = t.content.length <= PULL_QUOTE_MAX;
              return (
                <li key={t.id} className="break-inside-avoid border-t border-border pb-12 pt-6">
                  <figure>
                    <blockquote>
                      <p
                        className={cn(
                          quoteText,
                          pull ? "font-heading text-2xl leading-snug" : "text-lg leading-relaxed",
                        )}
                      >
                        “{t.content}”
                      </p>
                    </blockquote>
                    <figcaption className="mt-4 font-semibold text-muted-foreground">
                      {t.displayName}
                    </figcaption>
                  </figure>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
}

export default function TestimoniesPage() {
  return (
    <>
      <PageHeader title="Testimonies">
        <p>
          Words from people who took the step. Shared with their permission and reviewed by our team
          before they appear.
        </p>
      </PageHeader>

      <Suspense
        fallback={
          <div className="mx-auto min-h-64 max-w-6xl px-4 py-16 sm:px-6">
            <p className="text-muted-foreground">Loading testimonies…</p>
          </div>
        }
      >
        <Testimonies />
      </Suspense>

      <section id="share" className="scroll-mt-8 bg-mist">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:gap-20 lg:py-24">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Share your experience</h2>
            <p className="mt-4 max-w-md text-lg text-muted-foreground">
              Your words may help someone else take their first step. We read every testimony before
              it appears.
            </p>
            <p className="mt-4 max-w-md text-muted-foreground">
              Please leave out full names, phone numbers, and details that could identify you or
              others. We may edit or decline testimonies.
            </p>
          </div>
          <FormFrame
            action={submitTestimony}
            submitLabel="Send for review"
            successTitle="Thank you for sharing."
            nextHref="/"
            nextLabel="Back to home"
            backLink={false}
          >
            <TextField
              name="displayName"
              label="Name to show"
              hint={`A first name or initial is plenty. Leave blank to appear as Anonymous. Up to ${DISPLAY_NAME_MAX} characters.`}
              autoComplete="off"
            />
            <TextAreaField
              name="content"
              label="Your testimony"
              required
              rows={6}
              maxLength={TESTIMONY_MAX}
              hint={`${TESTIMONY_MIN} to ${TESTIMONY_MAX} characters.`}
            />
            <CheckboxField name="agreePublic">
              I agree this may be shown on this page after review.
            </CheckboxField>
          </FormFrame>
        </div>
      </section>
    </>
  );
}

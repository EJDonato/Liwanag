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

// Bento sizing follows the content: a short line sits in a square, a longer one gets a wide tile.
// Anything past this many characters starts out wide (the balancing step below may widen more).
const WIDE_FROM = 110;

type Testimony = Awaited<ReturnType<typeof getApprovedTestimonies>>[number];

function Tile({ testimony, tile }: { testimony: Testimony; tile: "lead" | "wide" | "small" | "wide-mist" | "small-mist" }) {
  const lead = tile === "lead";
  const wide = lead || tile.startsWith("wide");
  const mist = tile.endsWith("mist");
  return (
    // Spans live on the <li> so the grid can place it; the figure fills it.
    <li className={cn("flex", wide && "md:col-span-2", lead && "lg:row-span-2")}>
      <figure
        className={cn(
          "flex w-full flex-col justify-between gap-8 rounded-3xl",
          lead
            ? "on-night bg-night p-7 text-white sm:p-10"
            : cn("p-6 sm:p-8", mist ? "bg-mist" : "border border-border bg-card"),
        )}
      >
        <blockquote>
          <p
            className={cn(
              quoteText,
              lead
                ? "font-heading text-2xl leading-snug sm:text-3xl lg:text-4xl"
                : wide
                  ? "text-xl leading-relaxed"
                  : "text-lg leading-relaxed",
            )}
          >
            “{testimony.content}”
          </p>
        </blockquote>
        <figcaption className={cn("font-semibold", lead ? "text-night-text" : "text-muted-foreground")}>
          {testimony.displayName}
        </figcaption>
      </figure>
    </li>
  );
}

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

  // Size by length, then tidy the block: the lead is 4 cells, a wide tile 2, a square 1. If the total
  // isn't a multiple of the 4 columns the last row is left with a lone tile, so promote the longest
  // squares to wide until it divides evenly. This also keeps the 2-column layout whole.
  const sizes = rest.map((t) => (t.content.length > WIDE_FROM ? "wide" : "small"));
  const cells = 4 + sizes.reduce((n, s) => n + (s === "wide" ? 2 : 1), 0);
  rest
    .map((t, i) => ({ i, length: t.content.length }))
    .filter(({ i }) => sizes[i] === "small")
    .sort((a, b) => b.length - a.length)
    .slice(0, (4 - (cells % 4)) % 4)
    .forEach(({ i }) => {
      sizes[i] = "wide";
    });

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
      <h2 className="sr-only">What people say</h2>
      {/*
        Reading order is the DOM order (newest first) at every size. On large screens `dense`
        back-fills gaps so wide tiles don't leave holes; nothing here is focusable, so the
        visual reshuffle never disagrees with keyboard order.
      */}
      <ul className="grid grid-flow-dense gap-4 sm:gap-5 md:grid-cols-2 lg:auto-rows-[minmax(16rem,auto)] lg:grid-cols-4">
        <Tile testimony={lead} tile="lead" />
        {rest.map((t, i) => {
          const mist = i % 2 === 1;
          return (
            <Tile
              key={t.id}
              testimony={t}
              tile={sizes[i] === "wide" ? (mist ? "wide-mist" : "wide") : mist ? "small-mist" : "small"}
            />
          );
        })}
      </ul>
    </section>
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

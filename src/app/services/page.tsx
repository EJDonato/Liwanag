import type { Metadata } from "next";
import { ButtonLink } from "@/components/button-link";
import { PageHeader } from "@/components/page-header";
import { services } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services",
  description: "Counseling, group support, workshops, and crisis guidance offered by Liwanag.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader title="Services">
        <p>
          A range of support, from a single conversation to ongoing groups. Not sure where you
          fit? Start with the consent form and we will guide you from there.
        </p>
      </PageHeader>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-20">
        <ul className="divide-y divide-border border-b border-border">
          {services.map((s) => (
            <li
              key={s.name}
              className="grid gap-3 py-8 md:grid-cols-[1.1fr_1.4fr_0.8fr] md:gap-10"
            >
              <h2 className="font-heading text-2xl font-semibold sm:text-3xl">{s.name}</h2>
              <p className="text-lg leading-relaxed">{s.description}</p>
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">For:</span> {s.audience}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="on-night bg-night text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              How to avail a service
            </h2>
            <p className="mt-3 text-lg text-night-text">
              Complete the consent and data privacy forms, then tell us what you need in the
              interview form. We will take it from there.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/forms/consent" variant="sun">
              Start with consent
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline">
              Ask a question
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}

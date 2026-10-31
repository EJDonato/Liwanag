import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { contact, hotlines } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Who to contact at Liwanag, plus crisis hotlines if you need help right now.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader title="Who to contact">
        <p>Reach out in whatever way feels easiest.</p>
      </PageHeader>

      {/* Crisis resources lead the page: someone in distress should not have to scroll */}
      <section className="on-night bg-night text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            If you need help right now
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-night-text">
            If you or someone near you is in danger or in crisis, call a hotline or your local
            emergency number. You do not have to wait for an appointment.
          </p>
          <ul className="mt-10 grid gap-10 md:grid-cols-2">
            {hotlines.map((h) => (
              <li key={h.name}>
                <h3 className="font-heading text-xl font-semibold">{h.name}</h3>
                <ul className="mt-3 space-y-1">
                  {h.numbers.map((n) => (
                    <li key={n}>
                      <a
                        href={`tel:${n.replace(/[^\d+]/g, "")}`}
                        className="font-heading text-3xl text-sun underline-offset-4 hover:underline"
                      >
                        {n}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">The Liwanag team</h2>
          <dl className="grid gap-8 sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-muted-foreground">Email</dt>
              <dd className="mt-1 text-xl">
                <a href={`mailto:${contact.email}`} className="underline underline-offset-4">
                  {contact.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-muted-foreground">Phone</dt>
              <dd className="mt-1 text-xl">{contact.phone}</dd>
            </div>
            <div>
              <dt className="font-semibold text-muted-foreground">Visit us</dt>
              <dd className="mt-1 text-xl">{contact.address}</dd>
            </div>
            <div>
              <dt className="font-semibold text-muted-foreground">Office hours</dt>
              <dd className="mt-1 text-xl">{contact.hours}</dd>
            </div>
          </dl>
        </div>
        <p className="mt-14 max-w-2xl rounded-2xl bg-mist p-6 text-muted-foreground">
          Liwanag is not a substitute for professional care. In an emergency, contact local
          emergency services or one of the hotlines above.
        </p>
      </section>
    </>
  );
}

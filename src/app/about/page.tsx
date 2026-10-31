import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink } from "@/components/button-link";
import { PageHeader } from "@/components/page-header";
import { principles, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "Who Liwanag is, what we believe, and where we are headed.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader title="About Liwanag">
        <p>{site.tagline}</p>
      </PageHeader>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Who we are</h2>
            <Image
              src="/logo-full.png"
              alt="Liwanag Mental Health Clinic logo: a sun rising over green hills with a river path"
              width={816}
              height={625}
              className="mt-8 w-60"
            />
          </div>
          <div className="max-w-prose space-y-5 text-lg leading-relaxed">
            {site.intro.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="on-night bg-night text-white">
        <div className="mx-auto grid max-w-6xl gap-14 px-4 py-20 sm:px-6 md:grid-cols-2 md:gap-20 lg:py-28">
          <div>
            <h2 className="text-base font-semibold text-sun">Mission</h2>
            <p className="mt-4 font-heading text-2xl leading-snug sm:text-3xl">{site.mission}</p>
          </div>
          <div className="md:mt-16">
            <h2 className="text-base font-semibold text-sun">Vision</h2>
            <p className="mt-4 font-heading text-2xl leading-snug sm:text-3xl">{site.vision}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">What we hold to</h2>
        <dl className="mt-10 grid gap-x-16 gap-y-10 sm:grid-cols-2">
          {principles.map((p) => (
            <div key={p.name}>
              <dt className="font-heading text-xl font-semibold">{p.name}</dt>
              <dd className="mt-2 text-muted-foreground">{p.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="bg-mist">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl text-lg">
            <span className="font-semibold">If you need help right away.</span> {site.disclaimer}
          </p>
          <ButtonLink href="/services">See what we offer</ButtonLink>
        </div>
      </section>
    </>
  );
}

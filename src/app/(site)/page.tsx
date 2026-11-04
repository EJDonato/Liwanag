import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/button-link";
import { formSteps, hotlines, featuredTestimony, services, site } from "@/lib/site";

export default function Home() {
  return (
    <>
      {/* Hero: pastel waves, a soft point of light, dark navy text for full contrast */}
      <section className="relative isolate flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden bg-background text-foreground supports-[height:100dvh]:min-h-[calc(100dvh-4rem)]">
        <Image
          src="/hero-waves.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-bottom"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-[-6rem] -z-10 size-[26rem] rounded-full bg-[radial-gradient(circle,var(--sun-deep)_0%,var(--sun-soft)_42%,transparent_70%)] sm:right-[6%] sm:top-12 sm:size-[32rem]"
        />

        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-16 sm:px-6 lg:py-20">
          <h1
            className="rise-in max-w-3xl text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-[5.5rem]"
            style={{ "--rise-delay": "0.05s" } as React.CSSProperties}
          >
            {site.tagline}
          </h1>
          <p
            className="rise-in mt-6 max-w-xl text-lg leading-relaxed text-foreground sm:text-xl"
            style={{ "--rise-delay": "0.2s" } as React.CSSProperties}
          >
            Liwanag is a calm, private place to be heard. Learn what we offer, take your first step
            online, and know exactly who to reach.
          </p>
          <div
            className="rise-in mt-9 flex flex-col gap-3 sm:flex-row"
            style={{ "--rise-delay": "0.35s" } as React.CSSProperties}
          >
            <ButtonLink href="/forms/consent" variant="navy">
              Begin with the consent form
            </ButtonLink>
            <ButtonLink href="/services" variant="line">
              See our services
            </ButtonLink>
          </div>
        </div>

        <div className="on-night bg-night">
          <p className="mx-auto max-w-6xl px-4 py-4 text-sm text-night-text sm:px-6">
            <span className="font-semibold text-white">Need someone right now?</span>{" "}
            {hotlines[0].name}: <span className="text-sun">{hotlines[0].numbers[0]}</span>.{" "}
            <Link href="/contact" className="underline underline-offset-4 hover:text-sun">
              More hotlines
            </Link>
          </p>
        </div>
      </section>

      {/* Mission and vision */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <h2 className="sr-only">Our mission and vision</h2>
        <div className="grid gap-14 md:grid-cols-2 md:gap-20">
          <div>
            <h3 className="text-base font-semibold text-muted-foreground">Our mission</h3>
            <p className="mt-4 font-heading text-2xl leading-snug sm:text-3xl">{site.mission}</p>
          </div>
          <div className="md:mt-16">
            <h3 className="text-base font-semibold text-muted-foreground">Our vision</h3>
            <p className="mt-4 font-heading text-2xl leading-snug sm:text-3xl">{site.vision}</p>
          </div>
        </div>
      </section>

      {/* The path through the five forms: order matters here */}
      <section className="bg-mist">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:gap-20 lg:py-28">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              A gentle path, one step at a time
            </h2>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              Everything happens online and at your pace. You can stop after any step and come back
              with your reference code.
            </p>
          </div>
          <ol className="relative space-y-1">
            <span
              aria-hidden="true"
              className="absolute bottom-6 left-[1.05rem] top-6 w-px bg-sage-soft"
            />
            {formSteps.map((step, i) => (
              <li key={step.href} className="relative">
                <Link
                  href={step.href}
                  className="group flex gap-5 rounded-2xl py-4 pr-4 transition-colors hover:bg-background"
                >
                  <span
                    aria-hidden="true"
                    className="relative z-10 mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-night font-heading text-base font-semibold text-sun"
                  >
                    {i + 1}
                  </span>
                  <span>
                    <span className="block font-heading text-xl font-semibold">{step.name}</span>
                    <span className="mt-1 block text-muted-foreground">{step.text}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Services preview */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <h2 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Support that fits where you are
        </h2>
        <ul className="mt-12 divide-y divide-border border-y border-border">
          {services.slice(0, 5).map((s) => (
            <li
              key={s.name}
              className="grid gap-2 py-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:gap-10"
            >
              <h3 className="font-heading text-2xl font-semibold">{s.name}</h3>
              <p className="text-muted-foreground">{s.description}</p>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <ButtonLink href="/services" variant="line">
            All {services.length} services
          </ButtonLink>
        </div>
      </section>

      {/* Testimony */}
      <section className="on-night bg-night-2 text-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:py-28">
          <h2 className="sr-only">What people say</h2>
          <blockquote>
            <p className="font-heading text-3xl leading-snug sm:text-4xl">
              “{featuredTestimony.quote}”
            </p>
            <footer className="mt-6 text-night-text">
              {featuredTestimony.by}
            </footer>
          </blockquote>
          <div className="mt-10">
            <ButtonLink href="/testimonies" variant="outline">
              Read more testimonies
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="grid items-end gap-8 md:grid-cols-[1.4fr_1fr]">
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Ready when you are.
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
            <ButtonLink href="/forms/consent">Start now</ButtonLink>
            <ButtonLink href="/contact" variant="line">
              Who to contact
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}

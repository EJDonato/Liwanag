import Link from "next/link";
import { HotlineLink } from "@/components/hotline-link";
import { LogoMark } from "@/components/logo-mark";
import { contact, hotlines, nav, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="on-night bg-night text-night-text">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1.2fr]">
        <div>
          <Link href="/" className="flex w-fit items-center gap-2.5 font-heading text-xl font-semibold text-white hover:text-sun">
            <LogoMark />
            {site.name}
          </Link>
          <p className="mt-4 max-w-xs text-night-text">{site.tagline}</p>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-night-muted">{site.disclaimer}</p>
        </div>

        <nav aria-label="Footer">
          <h2 className="font-heading text-base font-semibold text-white">Explore</h2>
          <ul className="mt-4 space-y-2">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-sun">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-heading text-base font-semibold text-white">If you need help now</h2>
          <ul className="mt-4 space-y-3">
            {hotlines.map((h) => (
              <li key={h.name}>
                <span className="text-white">{h.name}</span>
                <br />
                <span className="text-sun">
                  {h.numbers.map((n, i) => (
                    <span key={n}>
                      {i > 0 && " · "}
                      <HotlineLink number={n} className="py-1" />
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-night-muted">
            {contact.email}
            <br />
            {contact.hours}
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-sm text-night-muted">
        {site.name} · Mental Health Clinic
      </div>
    </footer>
  );
}

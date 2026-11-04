import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/button-link";
import { HotlineLink } from "@/components/hotline-link";
import { LogoMark } from "@/components/logo-mark";
import { bricolage, figtree } from "@/lib/fonts";
import { hotlines, site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = { title: `Page not found | ${site.name}` };

// Used when a URL matches no page at all. It bypasses both root layouts (public and admin), so it
// brings its own html, fonts and styles, and stays small.
export default function GlobalNotFound() {
  return (
    <html lang="en" style={{ colorScheme: "light" }} className={`${figtree.variable} ${bricolage.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="border-b border-border">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2 font-heading text-xl font-semibold tracking-tight">
              <LogoMark />
              {site.name}
            </Link>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-20 sm:px-6">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">We could not find that page</h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            The address may be mistyped, or the page may have moved. Nothing is wrong on your side.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/">Back to home</ButtonLink>
            <ButtonLink href="/forms" variant="line">
              Go to the forms
            </ButtonLink>
            <ButtonLink href="/contact" variant="line">
              Who to contact
            </ButtonLink>
          </div>
          <p className="mt-12 max-w-xl text-muted-foreground">
            If you need to talk to someone right now, call {hotlines[0].name} on{" "}
            <HotlineLink number={hotlines[0].numbers[0]} className="font-semibold text-foreground" />.
          </p>
        </main>
      </body>
    </html>
  );
}

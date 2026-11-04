import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/app/(admin)/admin/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { ConsoleChromeSkeleton } from "@/components/admin/skeletons";
import { StatusRegion } from "@/components/admin/status";
import { LogoMark } from "@/components/logo-mark";
import { verifyAdmin } from "@/lib/admin/dal";
import { getNavCounts } from "@/lib/admin/queries";

// The header and menu. They read the session and the menu counts, so they stream in on their own
// while the page below loads at the same time: the two waits overlap instead of queueing.
// This is only the frame. Access control lives in every page and action (verifyAdmin) and in the
// proxy, never in a layout, because a layout doesn't re-run on every navigation.
async function ConsoleChrome() {
  const [admin, counts] = await Promise.all([verifyAdmin(), getNavCounts()]);
  return (
    <>
      <header>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 font-heading text-xl font-semibold tracking-tight">
            <LogoMark />
            Liwanag <span className="font-normal text-muted-foreground">staff</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-muted-foreground sm:inline [overflow-wrap:anywhere]">
              Signed in as <strong className="text-foreground">{admin.username}</strong>
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-full border border-input px-5 font-semibold transition-colors hover:bg-mist"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <AdminNav counts={counts} />
    </>
  );
}

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-sun focus:px-4 focus:py-2 focus:text-night"
      >
        Skip to content
      </a>
      <StatusRegion />
      <Suspense fallback={<ConsoleChromeSkeleton />}>
        <ConsoleChrome />
      </Suspense>
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:py-14">
        {children}
      </main>
    </>
  );
}

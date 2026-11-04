"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Counts = { pendingTestimonies: number; unreadMessages: number };

// Counts are worded for screen readers ("3 waiting") rather than leaving a bare number.
export function AdminNav({ counts }: { counts: Counts }) {
  const pathname = usePathname();
  const items = [
    { label: "Dashboard", href: "/admin", exact: true, count: 0, noun: "" },
    { label: "Testimonies", href: "/admin/testimonies", count: counts.pendingTestimonies, noun: "waiting for review" },
    { label: "Submissions", href: "/admin/submissions", count: 0, noun: "" },
    { label: "Messages", href: "/admin/messages", count: counts.unreadMessages, noun: "unread" },
  ];

  return (
    <nav aria-label="Staff" className="border-b border-border">
      <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6">
        {items.map((item) => {
          const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px flex min-h-12 items-center gap-2 whitespace-nowrap border-b-2 px-3 font-semibold transition-colors",
                  active ? "border-night text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
                {item.count > 0 && (
                  <>
                    <span aria-hidden="true" className="rounded-full bg-sun px-2 py-0.5 text-sm text-night">
                      {item.count}
                    </span>
                    <span className="sr-only">
                      , {item.count} {item.noun}
                    </span>
                  </>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

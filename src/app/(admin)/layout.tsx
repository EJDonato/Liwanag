import type { Metadata } from "next";
import { bricolage, figtree } from "@/lib/fonts";
import { site } from "@/lib/site";
import "../globals.css";

// Staff-only: keep it out of search results and give it its own tab title.
export const metadata: Metadata = {
  title: { default: `${site.name} staff`, template: `%s | ${site.name} staff` },
  robots: { index: false, follow: false },
};

// A separate root layout: no visitor menu, no hotline footer, just the staff tools.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: "light" }} className={`${figtree.variable} ${bricolage.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}

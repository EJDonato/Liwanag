import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  // on dark (night) grounds
  sun: "bg-sun text-night hover:bg-sun-soft",
  outline: "border border-night-muted text-night-text hover:bg-night-2",
  // on light grounds
  navy: "bg-night text-white hover:bg-night-2",
  line: "border border-input text-night hover:bg-mist",
} as const;

export function ButtonLink({
  href,
  variant = "navy",
  className,
  children,
}: {
  href: string;
  variant?: keyof typeof variants;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-12 items-center justify-center rounded-full px-6 text-base font-semibold transition-colors",
        variants[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}

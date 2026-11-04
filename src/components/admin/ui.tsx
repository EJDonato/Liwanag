import Link from "next/link";
import { cn } from "@/lib/utils";

const tones = {
  primary: "bg-night text-white hover:bg-night-2",
  outline: "border border-input bg-white text-foreground hover:bg-mist",
  danger: "border border-error bg-white text-error hover:bg-mist",
} as const;

const buttonBase =
  "inline-flex min-h-11 items-center justify-center rounded-full px-5 font-semibold transition-colors";

// A one-button form around a (usually bound) Server Action. Works without JavaScript.
export function ActionButton({
  action,
  tone = "outline",
  children,
}: {
  action: () => Promise<void>;
  tone?: keyof typeof tones;
  children: React.ReactNode;
}) {
  return (
    <form action={action}>
      <button type="submit" className={cn(buttonBase, tones[tone])}>
        {children}
      </button>
    </form>
  );
}

export function linkButtonClass(tone: keyof typeof tones = "outline") {
  return cn(buttonBase, tones[tone]);
}

export function PageTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      {children && <div className="mt-3 text-lg text-muted-foreground">{children}</div>}
    </div>
  );
}

// "Pending 3 · Approved 12": links that behave like tabs but are real navigation, so the URL
// is shareable and the back button works.
export function FilterTabs({
  label,
  items,
}: {
  label: string;
  items: { label: string; href: string; active: boolean; count?: number }[];
}) {
  return (
    <nav aria-label={label} className="mt-8">
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-semibold transition-colors",
                item.active ? "bg-night text-white" : "border border-input hover:bg-mist",
              )}
            >
              {item.label}
              {item.count !== undefined && <span className={item.active ? "text-night-text" : "text-muted-foreground"}>{item.count}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

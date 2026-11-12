import { telHref } from "@/lib/tel";
import { cn } from "@/lib/utils";

// A crisis number you can tap to call. The vertical padding gives a comfortable touch target.
export function HotlineLink({ number, className }: { number: string; className?: string }) {
  return (
    <a href={telHref(number)} className={cn("inline-block py-2 underline underline-offset-4", className)}>
      {number}
    </a>
  );
}

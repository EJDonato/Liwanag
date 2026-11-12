"use client";

import { useFormStatus } from "react-dom";
import { buttonClass, type Tone } from "@/components/admin/button-styles";
import { announce, focusResults } from "@/components/admin/status";
import { cn } from "@/lib/utils";

function SubmitButton({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn(buttonClass(tone), "disabled:cursor-wait disabled:opacity-60")}>
      {children}
    </button>
  );
}

// A one-button form around a (usually bound) Server Action. When the action finishes it says what
// happened and puts focus somewhere sensible, so keyboard and screen-reader users aren't left behind.
export function ActionButton({
  action,
  doneMessage,
  tone = "outline",
  children,
}: {
  action: () => Promise<void>;
  doneMessage: string;
  tone?: Tone;
  children: React.ReactNode;
}) {
  return (
    <form
      action={async () => {
        await action();
        announce(doneMessage);
        focusResults();
      }}
    >
      <SubmitButton tone={tone}>{children}</SubmitButton>
    </form>
  );
}

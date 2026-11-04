"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { createContext, useActionState, useContext, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { ButtonLink } from "@/components/button-link";
import { HONEYPOT_FIELD, OPENED_AT_FIELD } from "@/lib/forms/guard";
import { echoValues } from "@/lib/forms/read";
import { idleState, type FormState } from "@/lib/forms/state";
import { hotlines } from "@/lib/site";

const FormStateContext = createContext<FormState>(idleState);

export function useFieldState(name: string) {
  const state = useContext(FormStateContext);
  const errors = state.fieldErrors?.[name];
  const raw = state.values?.[name];
  return { errors, value: raw, hasError: !!errors?.length };
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-12 items-center justify-center rounded-full bg-night px-8 text-base font-semibold text-white transition-colors hover:bg-night-2 disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

function ErrorSummary({ state }: { state: FormState }) {
  const ref = useRef<HTMLDivElement>(null);
  // Move focus so screen reader and keyboard users land on what needs fixing.
  useEffect(() => {
    if (state.status === "error") ref.current?.focus();
  }, [state]);

  if (state.status !== "error") return null;
  const entries = Object.entries(state.fieldErrors ?? {}).filter(([, msgs]) => msgs.length);
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      className="mb-8 rounded-2xl border-2 border-error bg-white p-5"
    >
      <p className="font-semibold text-error">{state.message ?? "Something needs your attention."}</p>
      {entries.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5">
          {entries.map(([name, msgs]) => (
            <li key={name}>
              <a href={`#${name}`} className="underline underline-offset-4">
                {msgs[0]}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const smallButton =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-input bg-white px-5 text-base font-semibold text-night transition-colors hover:bg-mist";

function ReferenceCodeCard({
  code,
  saved,
  onSavedChange,
  askToConfirm,
}: {
  code: string;
  saved: boolean;
  onSavedChange: (saved: boolean) => void;
  askToConfirm: boolean;
}) {
  const [copy, setCopy] = useState<"idle" | "copied" | "failed">("idle");

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopy("copied");
    } catch {
      // Clipboard is blocked on some browsers and insecure origins: say so, and point to the manual route.
      setCopy("failed");
    }
    setTimeout(() => setCopy("idle"), 4000);
  }

  function download() {
    const text = `Liwanag reference code: ${code}\n\nUse it on the Forms page (${window.location.origin}/forms) to continue where you left off.\n`;
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `liwanag-${code}.txt`;
    document.body.appendChild(link); // Firefox ignores clicks on detached links
    link.click();
    link.remove();
    // Revoking straight away cancels the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  return (
    <div className="rounded-2xl border-2 border-night bg-accent p-6 sm:p-8">
      <p className="font-semibold">Write this code down or save it now</p>
      <p className="mt-2 font-heading text-3xl font-semibold tracking-wider sm:text-4xl">{code}</p>
      <p className="mt-3 max-w-xl text-muted-foreground">
        It is the only way to come back and continue your forms if you close this page or use a
        different device. We cannot look it up for you.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={copyCode} className={smallButton}>
          {copy === "copied" ? "Copied" : "Copy code"}
        </button>
        <button type="button" onClick={download} className={smallButton}>
          Save as a file
        </button>
      </div>
      <p aria-live="polite" className={copy === "failed" ? "mt-3 font-medium" : "sr-only"}>
        {copy === "copied" && "Reference code copied to clipboard."}
        {copy === "failed" && "Copying was blocked. Select the code above and copy it, or write it down."}
      </p>
      {askToConfirm && (
        <label className="mt-6 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={saved}
            onChange={(e) => onSavedChange(e.target.checked)}
            className="mt-0.5 size-6 shrink-0 accent-night"
          />
          <span className="text-lg leading-snug">I have written down or saved my reference code.</span>
        </label>
      )}
    </div>
  );
}

function CrisisPanel() {
  return (
    <div className="on-night rounded-2xl bg-night p-6 text-white">
      <h3 className="font-heading text-xl font-semibold">If you need to talk to someone right now</h3>
      <p className="mt-2 text-night-text">
        You mentioned thoughts of not being here or of hurting yourself. You do not have to carry that
        alone. These lines are free and open to you:
      </p>
      <ul className="mt-4 space-y-1">
        {hotlines.map((h) => (
          <li key={h.name}>
            <span className="font-semibold">{h.name}:</span>{" "}
            <span className="text-sun">{h.numbers.join(" · ")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Soft points of light drifting up, once. Each delay + duration stays under 5s; no flashing.
// For reduced motion they sit still at --y instead.
const motes = [
  { x: "6%", s: "0.4rem", d: "3.6s", delay: "0s", y: "18%" },
  { x: "14%", s: "0.6rem", d: "4s", delay: "0.8s", y: "62%" },
  { x: "23%", s: "0.35rem", d: "3.4s", delay: "1.4s", y: "34%" },
  { x: "32%", s: "0.5rem", d: "3.8s", delay: "0.3s", y: "72%" },
  { x: "41%", s: "0.4rem", d: "4s", delay: "0.9s", y: "22%" },
  { x: "50%", s: "0.7rem", d: "3.6s", delay: "1.3s", y: "55%" },
  { x: "59%", s: "0.35rem", d: "3.5s", delay: "0.1s", y: "40%" },
  { x: "68%", s: "0.55rem", d: "4s", delay: "0.6s", y: "68%" },
  { x: "76%", s: "0.4rem", d: "3.4s", delay: "1.5s", y: "28%" },
  { x: "84%", s: "0.6rem", d: "3.8s", delay: "0.4s", y: "50%" },
  { x: "92%", s: "0.45rem", d: "3.5s", delay: "1.1s", y: "76%" },
] as const;

function Celebration({
  state,
  saved,
  onSavedChange,
  headingRef,
}: {
  state: FormState;
  saved: boolean;
  onSavedChange: (saved: boolean) => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  return (
    <div className="space-y-8">
      <div className="on-night relative isolate overflow-hidden rounded-3xl bg-night px-6 py-14 text-center text-white sm:px-12 sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -z-10 size-[28rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[radial-gradient(circle,var(--sun-deep)_0%,var(--sun-soft)_20%,transparent_68%)] opacity-40"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          {motes.map((m, i) => (
            <span
              key={i}
              className="mote"
              style={
                {
                  "--x": m.x,
                  "--s": m.s,
                  "--d": m.d,
                  "--delay": m.delay,
                  "--y": m.y,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="mx-auto max-w-2xl scroll-mt-24 text-4xl font-semibold tracking-tight outline-none sm:text-5xl"
        >
          You did it. Thank you for letting us in.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-night-text">
          All five steps are done, and taking them is not small. Our team will look over your forms. If
          you told us how to reach you, we will use it, and you can always contact us sooner.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/" variant="sun">
            Back to home
          </ButtonLink>
          <ButtonLink href="/contact" variant="outline">
            Who to contact
          </ButtonLink>
        </div>
      </div>

      {state.crisis && <CrisisPanel />}
      {state.referenceCode && (
        <ReferenceCodeCard
          code={state.referenceCode}
          saved={saved}
          onSavedChange={onSavedChange}
          askToConfirm={false}
        />
      )}
    </div>
  );
}

function Confirmation({
  state,
  title,
  nextHref,
  nextLabel,
  requireSavedCode,
  celebrate,
}: {
  state: FormState;
  title: string;
  nextHref: string;
  nextLabel: string;
  requireSavedCode: boolean;
  celebrate: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // The submit button this replaces held keyboard focus. Land on the result so it is announced
  // and keyboard and screen-reader users aren't dropped back at the top of the page.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  if (celebrate) {
    return <Celebration state={state} saved={saved} onSavedChange={setSaved} headingRef={headingRef} />;
  }

  const blocked = requireSavedCode && !saved;
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-full bg-success text-white"
        >
          <Check className="size-6" strokeWidth={2.5} />
        </span>
        <div>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="scroll-mt-24 text-3xl font-semibold tracking-tight outline-none sm:text-4xl"
          >
            {title}
          </h2>
          {state.notice && <p className="mt-4 max-w-xl text-lg leading-relaxed">{state.notice}</p>}
        </div>
      </div>

      {state.crisis && <CrisisPanel />}

      {state.referenceCode && (
        <ReferenceCodeCard
          code={state.referenceCode}
          saved={saved}
          onSavedChange={setSaved}
          askToConfirm={requireSavedCode}
        />
      )}

      {blocked ? (
        <div>
          <button
            type="button"
            disabled
            className="inline-flex min-h-12 cursor-not-allowed items-center justify-center rounded-full bg-night px-6 text-base font-semibold text-white opacity-50"
          >
            {nextLabel}
          </button>
          <p className="mt-3 text-muted-foreground">Tick the box above once your code is safe.</p>
        </div>
      ) : (
        <ButtonLink href={nextHref}>{nextLabel}</ButtonLink>
      )}
    </div>
  );
}

export function FormFrame({
  action,
  submitLabel,
  successTitle,
  nextHref,
  nextLabel,
  backLink = true,
  requireSavedCode = false,
  celebrate = false,
  children,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  successTitle?: string;
  nextHref?: string;
  nextLabel?: string;
  backLink?: boolean;
  // First time a code is issued: make people confirm they've kept it before moving on.
  requireSavedCode?: boolean;
  // Final form: show the celebration instead of the usual confirmation.
  celebrate?: boolean;
  children: React.ReactNode;
}) {
  // A dropped connection or a server fault would otherwise throw to the error page and lose
  // everything typed. Forms that redirect on success (the resume form) skip this: their
  // redirect travels as a signal that must not be caught.
  const safeAction = async (prev: FormState, fd: FormData): Promise<FormState> => {
    if (!successTitle) return action(prev, fd);
    try {
      return await action(prev, fd);
    } catch {
      return {
        status: "error",
        message:
          "We could not reach the server, so nothing was saved. Your answers are still here: check your connection and press submit again.",
        values: echoValues(fd),
      };
    }
  };
  const [state, formAction] = useActionState(safeAction, idleState);
  const openedAt = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (openedAt.current) openedAt.current.value = String(Date.now());
  }, []);

  if (state.status === "success" && successTitle && nextHref && nextLabel) {
    return (
      <Confirmation
        state={state}
        title={successTitle}
        nextHref={nextHref}
        nextLabel={nextLabel}
        requireSavedCode={requireSavedCode}
        celebrate={celebrate}
      />
    );
  }

  return (
    <FormStateContext value={state}>
      <ErrorSummary state={state} />
      <form action={formAction} noValidate className="space-y-10">
        {successTitle && (
          <p className="text-muted-foreground">Every question is required unless it says optional.</p>
        )}
        {children}
        {/* Spam checks (see lib/forms/guard.ts): a trap field people never see, and a mount time. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Leave this field empty
            <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <input ref={openedAt} type="hidden" name={OPENED_AT_FIELD} defaultValue="" />
        <div className="flex flex-wrap items-center gap-4">
          <SubmitButton label={submitLabel} />
          {backLink && (
            <Link href="/forms" className="text-muted-foreground underline underline-offset-4 hover:text-foreground">
              Back to all forms
            </Link>
          )}
        </div>
      </form>
    </FormStateContext>
  );
}

"use client";

import { useState } from "react";
import { useFieldState } from "@/components/forms/form-frame";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-xl border bg-white px-4 text-base text-foreground placeholder:text-muted-foreground";
const borderFor = (hasError: boolean) => (hasError ? "border-2 border-error" : "border-input");

function Hint({ id, children }: { id: string; children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} className="text-muted-foreground">
      {children}
    </p>
  );
}

function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p id={id} className="font-medium text-error">
      {errors[0]}
    </p>
  );
}

const asString = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const asArray = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []);

function describedBy(name: string, hint: React.ReactNode, hasError: boolean) {
  return [hint ? `${name}-hint` : null, hasError ? `${name}-error` : null].filter(Boolean).join(" ") || undefined;
}

export function TextField({
  name,
  label,
  hint,
  type = "text",
  required,
  autoComplete,
  max,
}: {
  name: string;
  label: string;
  hint?: React.ReactNode;
  type?: "text" | "email" | "tel" | "date" | "password";
  required?: boolean;
  autoComplete?: string;
  max?: string;
}) {
  const { errors, value, hasError } = useFieldState(name);
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-lg font-semibold">
        {label}
        {!required && <span className="ml-2 font-normal text-muted-foreground">(optional)</span>}
      </label>
      <Hint id={`${name}-hint`}>{hint}</Hint>
      <input
        id={name}
        name={name}
        type={type}
        max={max}
        autoComplete={autoComplete}
        // Typed identifiers: don't capitalise or "correct" them.
        autoCapitalize={type === "email" ? "none" : undefined}
        spellCheck={type === "email" ? false : undefined}
        defaultValue={asString(value)}
        aria-required={required}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy(name, hint, hasError)}
        className={cn(control, "min-h-12", borderFor(hasError))}
      />
      <FieldError id={`${name}-error`} errors={errors} />
    </div>
  );
}

export function TextAreaField({
  name,
  label,
  hint,
  required,
  rows = 4,
  maxLength,
}: {
  name: string;
  label: string;
  hint?: React.ReactNode;
  required?: boolean;
  rows?: number;
  maxLength?: number;
}) {
  const { errors, value, hasError } = useFieldState(name);
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-lg font-semibold">
        {label}
        {!required && <span className="ml-2 font-normal text-muted-foreground">(optional)</span>}
      </label>
      <Hint id={`${name}-hint`}>{hint}</Hint>
      <textarea
        id={name}
        name={name}
        rows={rows}
        maxLength={maxLength}
        defaultValue={asString(value)}
        aria-required={required}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy(name, hint, hasError)}
        className={cn(control, "py-3 leading-relaxed", borderFor(hasError))}
      />
      <FieldError id={`${name}-error`} errors={errors} />
    </div>
  );
}

// A dropdown whose last choice is "Other", which reveals a text box named `<name>Other`.
export function SelectWithOtherField({
  name,
  label,
  hint,
  options,
  otherLabel = "Please specify",
}: {
  name: string;
  label: string;
  hint?: React.ReactNode;
  options: readonly string[];
  otherLabel?: string;
}) {
  const { errors, value, hasError } = useFieldState(name);
  const [choice, setChoice] = useState(asString(value) ?? "");
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor={name} className="block text-lg font-semibold">
          {label}
          <span className="ml-2 font-normal text-muted-foreground">(optional)</span>
        </label>
        <Hint id={`${name}-hint`}>{hint}</Hint>
        <select
          id={name}
          name={name}
          value={choice}
          onChange={(e) => setChoice(e.target.value)}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy(name, hint, hasError)}
          className={cn(control, "min-h-12", borderFor(hasError))}
        >
          <option value="">Choose one</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
          <option value="other">Other</option>
        </select>
        <FieldError id={`${name}-error`} errors={errors} />
      </div>
      {choice === "other" && <TextField name={`${name}Other`} label={otherLabel} required />}
    </div>
  );
}

type Option = { value: string; label: string };

function Fieldset({
  name,
  legend,
  hint,
  required,
  radio,
  children,
}: {
  name: string;
  legend: string;
  hint?: React.ReactNode;
  required?: boolean;
  // aria-invalid is only valid on a radiogroup, not on a plain group of checkboxes.
  radio?: boolean;
  children: React.ReactNode;
}) {
  const { errors, hasError } = useFieldState(name);
  return (
    <fieldset
      id={name}
      tabIndex={-1}
      role={radio ? "radiogroup" : undefined}
      aria-describedby={describedBy(name, hint, hasError)}
      aria-invalid={radio && hasError ? true : undefined}
      className="space-y-3"
    >
      <legend className="text-lg font-semibold">
        {legend}
        {required === false && <span className="ml-2 font-normal text-muted-foreground">(optional)</span>}
      </legend>
      <Hint id={`${name}-hint`}>{hint}</Hint>
      {children}
      <FieldError id={`${name}-error`} errors={errors} />
    </fieldset>
  );
}

const choiceRow = "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-1 py-2";
const choiceInput = "size-6 shrink-0 accent-night";

export function RadioGroup({
  name,
  legend,
  hint,
  options,
  required = true,
  inline,
}: {
  name: string;
  legend: string;
  hint?: React.ReactNode;
  options: readonly Option[];
  required?: boolean;
  inline?: boolean;
}) {
  const { value } = useFieldState(name);
  const selected = asString(value);
  return (
    <Fieldset name={name} legend={legend} hint={hint} required={required} radio>
      <div className={cn(inline ? "flex flex-wrap gap-x-6" : "space-y-1")}>
        {options.map((o) => (
          <label key={o.value} className={choiceRow}>
            <input
              type="radio"
              name={name}
              value={o.value}
              defaultChecked={selected === o.value}
              className={choiceInput}
            />
            <span className="text-lg">{o.label}</span>
          </label>
        ))}
      </div>
    </Fieldset>
  );
}

export function CheckboxGroup({
  name,
  legend,
  hint,
  options,
}: {
  name: string;
  legend: string;
  hint?: React.ReactNode;
  options: readonly string[];
}) {
  const { value } = useFieldState(name);
  const selected = asArray(value);
  return (
    <Fieldset name={name} legend={legend} hint={hint} required={false}>
      <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
        {options.map((o) => (
          <label key={o} className={choiceRow}>
            <input
              type="checkbox"
              name={name}
              value={o}
              defaultChecked={selected.includes(o)}
              className={choiceInput}
            />
            <span className="text-lg">{o}</span>
          </label>
        ))}
      </div>
    </Fieldset>
  );
}

export function CheckboxField({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  const { errors, value, hasError } = useFieldState(name);
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="flex cursor-pointer items-start gap-3 py-2">
        <input
          id={name}
          type="checkbox"
          name={name}
          defaultChecked={asString(value) === "on"}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? `${name}-error` : undefined}
          className={cn(choiceInput, "mt-0.5")}
        />
        <span className="text-lg leading-snug">{children}</span>
      </label>
      <FieldError id={`${name}-error`} errors={errors} />
    </div>
  );
}

// A row of numbered choices (a Likert item) with scale labels announced to screen readers.
export function ScaleField({
  name,
  legend,
  options,
}: {
  name: string;
  legend: string;
  options: readonly Option[];
}) {
  const { errors, value, hasError } = useFieldState(name);
  const selected = asString(value);
  return (
    <fieldset
      id={name}
      tabIndex={-1}
      role="radiogroup"
      aria-invalid={hasError || undefined}
      aria-describedby={hasError ? `${name}-error` : undefined}
      className="space-y-3"
    >
      <legend className="text-lg font-semibold">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-[repeat(auto-fit,minmax(8rem,1fr))]">
        {options.map((o) => (
          <label
            key={o.value}
            className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-input bg-white px-4 py-2 has-[:checked]:border-night has-[:checked]:bg-accent has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring"
          >
            {/* The whole card shows focus, so the small radio doesn't need its own ring. */}
            <input
              type="radio"
              name={name}
              value={o.value}
              defaultChecked={selected === o.value}
              className="size-5 shrink-0 accent-night focus-visible:outline-none"
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      <FieldError id={`${name}-error`} errors={errors} />
    </fieldset>
  );
}

export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-6">
      <h2 className="border-b border-border pb-3 text-2xl font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

import { guardFields } from "@/lib/forms/guard";
import type { FormValues } from "@/lib/forms/state";

// Turns FormData into a plain object for Zod. Blank optional fields become undefined,
// and fields named in `multi` (checkbox groups) always come back as arrays.
export function readForm(fd: FormData, multi: string[] = []) {
  const raw: Record<string, unknown> = {};
  for (const key of new Set(fd.keys())) {
    if (key.startsWith("$ACTION")) continue;
    if (multi.includes(key)) {
      raw[key] = fd.getAll(key).filter((v) => typeof v === "string");
      continue;
    }
    const value = fd.get(key);
    if (typeof value === "string") raw[key] = value.trim() === "" ? undefined : value.trim();
  }
  for (const key of multi) raw[key] ??= [];
  return raw;
}

// What to hand back to the form on error so people don't retype everything.
export function echoValues(fd: FormData): FormValues {
  const values: FormValues = {};
  for (const key of new Set(fd.keys())) {
    // Never echo a password back, even to the browser that typed it.
    if (key.startsWith("$ACTION") || key === "password" || guardFields.includes(key)) continue;
    const all = fd.getAll(key).filter((v): v is string => typeof v === "string");
    values[key] = all.length > 1 ? all : (all[0] ?? "");
  }
  return values;
}

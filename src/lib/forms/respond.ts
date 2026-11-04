import { z } from "zod";
import { isBot, submittedTooFast } from "@/lib/forms/guard";
import { echoValues } from "@/lib/forms/read";
import { tooManyRequests, type Bucket } from "@/lib/rate-limit";
import type { FormState } from "@/lib/forms/state";

// Shared by every form Server Action so errors and spam checks behave the same everywhere.

export function fail(fd: FormData, message?: string, fieldErrors?: Record<string, string[]>): FormState {
  return { status: "error", message, fieldErrors, values: echoValues(fd) };
}

export function invalid(fd: FormData, error: z.ZodError): FormState {
  const fieldErrors = z.flattenError(error).fieldErrors as Record<string, string[]>;
  return fail(fd, "Please check the highlighted fields.", fieldErrors);
}

// Bots fill the hidden trap field: pretend it worked and store nothing. A real person who is merely
// fast gets told so instead, because silently dropping their answers would be far worse.
const botSuccess: FormState = { status: "success", referenceCode: "LWN-0000-0000" };

export function screen(fd: FormData): FormState | null {
  if (isBot(fd)) return botSuccess;
  if (submittedTooFast(fd)) {
    return fail(fd, "That went through very quickly. Please check your answers and submit again.");
  }
  return null;
}

const TOO_MANY = "You have sent a lot in a short time. Please wait a few minutes and try again.";

// Turns a visitor away when they are sending far more than a person would.
export async function throttle(fd: FormData, bucket: Bucket): Promise<FormState | null> {
  return (await tooManyRequests(bucket)) ? fail(fd, TOO_MANY) : null;
}

// Everything a public submission must pass before any real work: not a flood, not a bot,
// not suspiciously fast. The rate limit goes first because it is the cheapest way to stop a flood.
export async function guard(fd: FormData, bucket: Bucket): Promise<FormState | null> {
  return (await throttle(fd, bucket)) ?? screen(fd);
}

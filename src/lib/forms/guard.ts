// Cheap, invisible spam checks shared by the form frame (which renders the fields)
// and the Server Actions (which enforce them). Neither needs anything from a visitor.

// Hidden trap field. The name is deliberately meaningless: browsers autofill fields called
// "website", "url" or "email", and an autofilled trap would silently discard a real submission.
export const HONEYPOT_FIELD = "hp_note";

// Stamped by the browser when the form mounts; a real person takes longer than this to fill anything.
export const OPENED_AT_FIELD = "opened_at";
const MIN_FILL_MS = 2000;

export const guardFields: readonly string[] = [HONEYPOT_FIELD, OPENED_AT_FIELD];

export function isBot(fd: FormData) {
  const trap = fd.get(HONEYPOT_FIELD);
  return typeof trap === "string" && trap.length > 0;
}

// True when the form was submitted implausibly fast. A missing or garbled stamp (no JavaScript,
// older browser) is treated as fine: this check must never lock a real person out.
export function submittedTooFast(fd: FormData, now = Date.now()) {
  const raw = fd.get(OPENED_AT_FIELD);
  const openedAt = typeof raw === "string" ? Number(raw) : NaN;
  if (!Number.isFinite(openedAt) || openedAt > now) return false;
  return now - openedAt < MIN_FILL_MS;
}

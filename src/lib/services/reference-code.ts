import { randomInt } from "node:crypto";

// No 0/O, 1/I/L: codes get read aloud and written down.
const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const prefix = "LWN";

export function generateReferenceCode() {
  const chars = Array.from({ length: 8 }, () => alphabet[randomInt(alphabet.length)]).join("");
  return `${prefix}-${chars.slice(0, 4)}-${chars.slice(4)}`;
}

// Accepts "lwn7k2q9xma", "LWN 7K2Q 9XMA", etc. Returns null if it can't be a valid code.
export function normalizeReferenceCode(input: string) {
  const compact = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!compact.startsWith(prefix)) return null;
  const body = compact.slice(prefix.length);
  if (body.length !== 8 || [...body].some((c) => !alphabet.includes(c))) return null;
  return `${prefix}-${body.slice(0, 4)}-${body.slice(4)}`;
}

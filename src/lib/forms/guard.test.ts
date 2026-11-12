import { describe, expect, it } from "vitest";
import { HONEYPOT_FIELD, OPENED_AT_FIELD, isBot, submittedTooFast } from "./guard";

const form = (fields: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
};

describe("isBot", () => {
  it("flags a filled trap field only", () => {
    expect(isBot(form({ [HONEYPOT_FIELD]: "http://spam.example" }))).toBe(true);
    expect(isBot(form({ [HONEYPOT_FIELD]: "" }))).toBe(false);
    expect(isBot(form({}))).toBe(false);
  });

  it("does not trip on fields browsers like to autofill", () => {
    expect(isBot(form({ website: "https://me.example", url: "x", email: "a@b.co" }))).toBe(false);
  });
});

describe("submittedTooFast", () => {
  const now = 1_000_000;

  it("flags a submission within two seconds of the form opening", () => {
    expect(submittedTooFast(form({ [OPENED_AT_FIELD]: String(now - 500) }), now)).toBe(true);
    expect(submittedTooFast(form({ [OPENED_AT_FIELD]: String(now - 5000) }), now)).toBe(false);
  });

  it("never blocks when the stamp is missing, garbled or from the future", () => {
    expect(submittedTooFast(form({}), now)).toBe(false);
    expect(submittedTooFast(form({ [OPENED_AT_FIELD]: "" }), now)).toBe(false);
    expect(submittedTooFast(form({ [OPENED_AT_FIELD]: "soon" }), now)).toBe(false);
    expect(submittedTooFast(form({ [OPENED_AT_FIELD]: String(now + 9999) }), now)).toBe(false);
  });
});

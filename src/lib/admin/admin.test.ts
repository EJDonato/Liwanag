import { describe, expect, it } from "vitest";
import { loginSchema } from "../validation/admin";
import { LOCK_MINUTES, MAX_FAILED_LOGINS, isLocked, lockUntil, shouldLock } from "./lockout";
import { SESSION_SECONDS, signSessionToken, verifySessionToken } from "./token";

const SECRET = "test-secret-that-is-comfortably-longer-than-32-characters";
const T0 = Date.UTC(2026, 10, 4, 9, 0, 0);

describe("admin session token", () => {
  it("round-trips the admin id", async () => {
    const token = await signSessionToken("admin_123", SECRET, T0);
    expect(await verifySessionToken(token, SECRET, T0 + 1000)).toEqual({ adminId: "admin_123" });
  });

  it("is valid just inside 8 hours and rejected just after", async () => {
    const token = await signSessionToken("a", SECRET, T0);
    expect(await verifySessionToken(token, SECRET, T0 + (SESSION_SECONDS - 5) * 1000)).not.toBeNull();
    expect(await verifySessionToken(token, SECRET, T0 + (SESSION_SECONDS + 5) * 1000)).toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await signSessionToken("a", SECRET, T0);
    expect(await verifySessionToken(token, "another-secret-that-is-also-long-enough-123", T0)).toBeNull();
  });

  it("rejects a tampered token, garbage, and a missing token", async () => {
    const token = await signSessionToken("a", SECRET, T0);
    const [h, p, s] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ sub: "someone_else", iat: 1, exp: 9999999999 })).toString("base64url");
    expect(await verifySessionToken(`${h}.${forged}.${s}`, SECRET, T0)).toBeNull();
    expect(await verifySessionToken(`${h}.${p}.x${s}`, SECRET, T0)).toBeNull();
    expect(await verifySessionToken("not.a.token", SECRET, T0)).toBeNull();
    expect(await verifySessionToken(undefined, SECRET, T0)).toBeNull();
    expect(await verifySessionToken("", SECRET, T0)).toBeNull();
  });

  it("rejects an unsigned token (alg: none)", async () => {
    const enc = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
    const unsigned = `${enc({ alg: "none", typ: "JWT" })}.${enc({ sub: "admin", exp: 9999999999 })}.`;
    expect(await verifySessionToken(unsigned, SECRET, T0)).toBeNull();
  });
});

describe("lockout policy", () => {
  it("locks on the fifth failure, not before", () => {
    expect(MAX_FAILED_LOGINS).toBe(5);
    expect([1, 2, 3, 4].some(shouldLock)).toBe(false);
    expect(shouldLock(5)).toBe(true);
    expect(shouldLock(6)).toBe(true);
  });

  it("is locked for 15 minutes, then free", () => {
    const now = new Date(T0);
    const until = lockUntil(now);
    expect(until.getTime() - now.getTime()).toBe(LOCK_MINUTES * 60_000);
    expect(isLocked(until, new Date(T0 + 14 * 60_000))).toBe(true);
    expect(isLocked(until, new Date(T0 + 15 * 60_000))).toBe(false);
    expect(isLocked(null, now)).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts a normal sign-in and trims the username only", () => {
    const r = loginSchema.safeParse({ username: "  admin ", password: " p4ss word " });
    expect(r.success && r.data).toEqual({ username: "admin", password: " p4ss word " });
  });

  it("rejects empty and oversized values, including a missing field", () => {
    expect(loginSchema.safeParse({ username: "", password: "x" }).success).toBe(false);
    expect(loginSchema.safeParse({ username: "a", password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ username: "a".repeat(65), password: "x" }).success).toBe(false);
    expect(loginSchema.safeParse({ username: "a", password: "x".repeat(201) }).success).toBe(false);
    expect(loginSchema.safeParse({ username: "a", password: null }).success).toBe(false);
  });
});

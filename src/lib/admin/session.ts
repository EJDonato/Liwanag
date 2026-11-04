import { cookies } from "next/headers";
import { ADMIN_COOKIE, ADMIN_COOKIE_PATH } from "@/lib/admin/constants";
import { renderClock } from "@/lib/admin/format";
import { SESSION_SECONDS, signSessionToken, verifySessionToken } from "@/lib/admin/token";

// Fails closed: with no usable secret nobody can sign in or be recognised.
function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set to a random value of 32 or more characters.");
  }
  return secret;
}

export async function createAdminSession(adminId: string) {
  const token = await signSessionToken(adminId, authSecret());
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: ADMIN_COOKIE_PATH,
    maxAge: SESSION_SECONDS,
  });
}

export async function readAdminSession() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const secret = process.env.AUTH_SECRET;
  if (!token || !secret) return null;
  // performance.timeOrigin + performance.now() is the wall clock to the millisecond, and unlike
  // Date.now() Next allows it while rendering. Expiry is still checked against real time.
  return verifySessionToken(token, secret, renderClock().getTime());
}

export async function deleteAdminSession() {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: ADMIN_COOKIE_PATH });
}

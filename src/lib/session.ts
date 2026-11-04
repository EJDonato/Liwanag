import { cookies } from "next/headers";
import { normalizeReferenceCode } from "@/lib/services/reference-code";

// The reference code in an httpOnly cookie is how the server knows which client is filling in
// forms. It never grants read access to submitted answers, only the ability to continue.
const COOKIE = "lwn_ref";

export async function getReferenceCode() {
  const value = (await cookies()).get(COOKIE)?.value;
  return value ? normalizeReferenceCode(value) : null;
}

export async function setReferenceCode(code: string) {
  (await cookies()).set(COOKIE, code, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearReferenceCode() {
  (await cookies()).delete(COOKIE);
}

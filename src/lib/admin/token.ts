import { jwtVerify, SignJWT } from "jose";

// The signed value stored in the admin cookie. Pure functions (no Next imports) so they are
// easy to test and usable from both the proxy and server code. It carries only who the admin is
// and when it expires; roles and existence are looked up in the database on every request.

export const SESSION_HOURS = 8;
export const SESSION_SECONDS = SESSION_HOURS * 60 * 60;

const keyFor = (secret: string) => new TextEncoder().encode(secret);

export async function signSessionToken(adminId: string, secret: string, now = Date.now()) {
  const issuedAt = Math.floor(now / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminId)
    .setIssuedAt(issuedAt)
    .setExpirationTime(issuedAt + SESSION_SECONDS)
    .sign(keyFor(secret));
}

// Returns null for anything wrong: missing, tampered, expired, wrong algorithm, or a bad secret.
export async function verifySessionToken(
  token: string | undefined,
  secret: string,
  now = Date.now(),
): Promise<{ adminId: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, keyFor(secret), {
      algorithms: ["HS256"],
      currentDate: new Date(now),
    });
    return typeof payload.sub === "string" && payload.sub ? { adminId: payload.sub } : null;
  } catch {
    return null;
  }
}

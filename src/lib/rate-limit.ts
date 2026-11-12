import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import { db } from "@/lib/db";

// Slows down floods on the public forms without getting in the way of real use. Campuses often put
// many students behind one internet address, so the limits are generous: they stop scripts, not people.
export const limits = {
  form: { limit: 60, windowSeconds: 600 }, // interview, assessment, exit, privacy: per 10 minutes
  consent: { limit: 30, windowSeconds: 3600 }, // each one creates a client record: per hour
  contact: { limit: 10, windowSeconds: 3600 },
  testimony: { limit: 10, windowSeconds: 3600 },
  resume: { limit: 30, windowSeconds: 600 }, // guesses at reference codes
  login: { limit: 30, windowSeconds: 900 }, // staff sign-in attempts, on top of the per-account lockout
} as const;

export type Bucket = keyof typeof limits;

// The visitor's address is hashed with a secret before it is stored: enough to count requests,
// not enough to tell who anyone is.
async function visitorKey() {
  const h = await headers();
  const address = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const salt = process.env.AUTH_SECRET ?? "liwanag";
  return createHash("sha256").update(`${salt}:${address}`).digest("hex").slice(0, 32);
}

// Counts this request and says whether the visitor is over the limit for the bucket. One atomic
// statement does the counting, so simultaneous requests can't slip past each other.
// If the check itself fails, it lets the request through: a broken limiter must never block a person.
export async function tooManyRequests(bucket: Bucket): Promise<boolean> {
  try {
    const { limit, windowSeconds } = limits[bucket];
    const key = `${bucket}:${await visitorKey()}`;
    const rows = await db.$queryRaw<{ count: number }[]>`
      INSERT INTO "RateLimit" ("key", "count", "windowStart") VALUES (${key}, 1, now())
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "RateLimit"."windowStart" < now() - make_interval(secs => ${windowSeconds}) THEN 1 ELSE "RateLimit"."count" + 1 END,
        "windowStart" = CASE WHEN "RateLimit"."windowStart" < now() - make_interval(secs => ${windowSeconds}) THEN now() ELSE "RateLimit"."windowStart" END
      RETURNING "count"`;
    // Now and then, sweep out counters that expired long ago so the table stays tiny.
    if (Math.random() < 0.02) {
      await db.rateLimit.deleteMany({ where: { windowStart: { lt: new Date(Date.now() - 86_400_000) } } });
    }
    return Number(rows[0]?.count ?? 0) > limit;
  } catch (e) {
    unstable_rethrow(e);
    console.error("Rate limit check failed:", e instanceof Error ? e.name : "unknown error");
    return false;
  }
}

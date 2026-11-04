"use server";

import bcrypt from "bcryptjs";
import { redirect, unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { DECOY_HASH } from "@/lib/admin/constants";
import { isLocked, lockUntil, shouldLock } from "@/lib/admin/lockout";
import { createAdminSession, deleteAdminSession } from "@/lib/admin/session";
import { isBot } from "@/lib/forms/guard";
import { tooManyRequests } from "@/lib/rate-limit";
import type { FormState } from "@/lib/forms/state";
import { loginSchema } from "@/lib/validation/admin";

// One message for a wrong username, a wrong password and a locked account, so the form never
// confirms which usernames exist.
const SIGN_IN_FAILED =
  "That username and password did not work, or the account is temporarily locked. Check your details, or wait 15 minutes and try again.";

// Echo the username back, never the password: the shared form helpers echo every field.
function failed(fd: FormData, message: string = SIGN_IN_FAILED, fieldErrors?: Record<string, string[]>): FormState {
  const username = fd.get("username");
  return {
    status: "error",
    message,
    fieldErrors,
    values: { username: typeof username === "string" ? username : "" },
  };
}

export async function signIn(_prev: FormState, fd: FormData): Promise<FormState> {
  if (isBot(fd)) return failed(fd);
  if (await tooManyRequests("login")) {
    return failed(fd, "Too many sign-in attempts. Please wait a few minutes and try again.");
  }

  const parsed = loginSchema.safeParse({ username: fd.get("username"), password: fd.get("password") });
  if (!parsed.success) {
    return failed(fd, "Please check the highlighted fields.", z.flattenError(parsed.error).fieldErrors as Record<string, string[]>);
  }
  const { username, password } = parsed.data;

  let signedIn = false;
  try {
    const admin = await db.admin.findUnique({
      where: { username },
      select: { id: true, passwordHash: true, lockedUntil: true },
    });
    const locked = admin ? isLocked(admin.lockedUntil) : false;

    // Always do one bcrypt comparison, so unknown names and locked accounts take as long as real ones.
    const passwordOk = await bcrypt.compare(password, admin?.passwordHash ?? DECOY_HASH);

    if (!admin || locked || !passwordOk) {
      // Count a failure only against a real, unlocked account; the 5th one starts the lock.
      if (admin && !locked) {
        const { failedLogins } = await db.admin.update({
          where: { id: admin.id },
          data: { failedLogins: { increment: 1 } },
          select: { failedLogins: true },
        });
        if (shouldLock(failedLogins)) {
          await db.admin.update({
            where: { id: admin.id },
            data: { failedLogins: 0, lockedUntil: lockUntil() },
          });
        }
      }
      return failed(fd);
    }

    await db.admin.update({ where: { id: admin.id }, data: { failedLogins: 0, lockedUntil: null } });
    await createAdminSession(admin.id);
    signedIn = true;
  } catch (e) {
    unstable_rethrow(e);
    // Log the kind of error only, never the username or anything typed.
    console.error("Admin sign-in failed:", e instanceof Error ? e.name : "unknown error");
    return failed(fd, "We could not sign you in right now. Please try again in a moment.");
  }

  // redirect() works by throwing, so it must stay outside the try block above.
  if (signedIn) redirect("/admin");
  return failed(fd);
}

export async function signOut() {
  await deleteAdminSession();
  redirect("/admin/login");
}

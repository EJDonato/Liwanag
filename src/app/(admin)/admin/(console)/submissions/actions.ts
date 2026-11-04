"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin/dal";
import { fail } from "@/lib/forms/respond";
import type { FormState } from "@/lib/forms/state";
import { normalizeReferenceCode } from "@/lib/services/reference-code";

// Permanently deletes one client and all five of their forms (the database cascades). It exists so
// the privacy notice's promise, "you may ask us to delete your information", can be kept.
// Typing the reference code is the safeguard: there is no undo.
export async function deleteClient(_prev: FormState, fd: FormData): Promise<FormState> {
  await verifyAdmin();

  const code = normalizeReferenceCode(String(fd.get("referenceCode") ?? ""));
  if (!code) return fail(fd, "That client could not be found.");

  const typed = normalizeReferenceCode(String(fd.get("confirm") ?? ""));
  if (typed !== code) {
    return fail(fd, "Please check the highlighted fields.", { confirm: ["Type the reference code exactly to confirm."] });
  }

  try {
    const { count } = await db.client.deleteMany({ where: { referenceCode: code } });
    if (count === 0) return fail(fd, "That client no longer exists.");
  } catch (e) {
    unstable_rethrow(e);
    console.error("Deleting a client failed:", e instanceof Error ? e.name : "unknown error");
    return fail(fd, "Something went wrong, and nothing was deleted. Please try again.");
  }

  revalidatePath("/admin/submissions");
  revalidatePath("/admin");
  redirect("/admin/submissions");
}

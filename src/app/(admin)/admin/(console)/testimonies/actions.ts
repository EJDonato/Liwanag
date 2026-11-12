"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin/dal";
import { readForm } from "@/lib/forms/read";
import { fail, invalid } from "@/lib/forms/respond";
import type { FormState } from "@/lib/forms/state";
import { idSchema, testimonyEditSchema } from "@/lib/validation/contact";

// Server Actions are public endpoints: every one re-checks the session before touching data.

type Status = "PENDING" | "APPROVED" | "REJECTED";

function refresh() {
  revalidatePath("/admin/testimonies");
  revalidatePath("/testimonies");
}

async function setStatus(id: string, status: Status) {
  await verifyAdmin();
  if (!idSchema.safeParse(id).success) return;
  await db.testimony.updateMany({ where: { id }, data: { status } });
  refresh();
}

export async function approveTestimony(id: string) {
  await setStatus(id, "APPROVED");
}

export async function rejectTestimony(id: string) {
  await setStatus(id, "REJECTED");
}

// Used for "Unpublish" and "Move to pending": nothing is ever deleted, so every decision can be undone.
export async function restoreTestimony(id: string) {
  await setStatus(id, "PENDING");
}

export async function saveTestimony(_prev: FormState, fd: FormData): Promise<FormState> {
  await verifyAdmin();
  // The id travels as a hidden field. It is checked here like any other input: staff-only, but still untrusted.
  const id = String(fd.get("id") ?? "");
  if (!idSchema.safeParse(id).success) return fail(fd, "That testimony could not be found.");

  const parsed = testimonyEditSchema.safeParse(readForm(fd));
  if (!parsed.success) return invalid(fd, parsed.error);

  let status: Status;
  try {
    const existing = await db.testimony.findUnique({ where: { id }, select: { status: true } });
    if (!existing) return fail(fd, "That testimony no longer exists.");
    status = existing.status;
    await db.testimony.update({
      where: { id },
      data: { displayName: parsed.data.displayName || "Anonymous", content: parsed.data.content },
    });
  } catch (e) {
    unstable_rethrow(e);
    console.error("Saving a testimony edit failed:", e instanceof Error ? e.name : "unknown error");
    return fail(fd, "Something went wrong while saving. Please try again in a moment.");
  }

  refresh();
  // Back to the list the testimony lives in, so the edit is visible straight away.
  redirect(`/admin/testimonies?status=${status.toLowerCase()}`);
}

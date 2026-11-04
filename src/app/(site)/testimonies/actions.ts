"use server";

import { unstable_rethrow } from "next/navigation";
import { db } from "@/lib/db";
import { readForm } from "@/lib/forms/read";
import { fail, guard, invalid } from "@/lib/forms/respond";
import type { FormState } from "@/lib/forms/state";
import { testimonySchema } from "@/lib/validation/testimony";

export async function submitTestimony(_prev: FormState, fd: FormData): Promise<FormState> {
  const blocked = await guard(fd, "testimony");
  if (blocked) return blocked;

  const parsed = testimonySchema.safeParse(readForm(fd));
  if (!parsed.success) return invalid(fd, parsed.error);

  try {
    // Always PENDING: nothing is public until staff approve it.
    await db.testimony.create({
      data: {
        displayName: parsed.data.displayName || "Anonymous",
        content: parsed.data.content,
        status: "PENDING",
      },
    });
  } catch (e) {
    unstable_rethrow(e);
    // Never log what was written, only that saving failed.
    console.error("Saving a testimony failed:", e instanceof Error ? e.name : "unknown error");
    return fail(fd, "Something went wrong while saving. Please try again in a moment.");
  }

  return {
    status: "success",
    notice: "Thank you for sharing. A member of our team will review it before it appears.",
  };
}

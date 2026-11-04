"use server";

import { unstable_rethrow } from "next/navigation";
import { db } from "@/lib/db";
import { readForm } from "@/lib/forms/read";
import { fail, invalid, screen } from "@/lib/forms/respond";
import type { FormState } from "@/lib/forms/state";
import { contactSchema } from "@/lib/validation/contact";

export async function submitContactMessage(_prev: FormState, fd: FormData): Promise<FormState> {
  const blocked = screen(fd);
  if (blocked) return blocked;

  const parsed = contactSchema.safeParse(readForm(fd));
  if (!parsed.success) return invalid(fd, parsed.error);

  try {
    await db.contactMessage.create({ data: parsed.data });
  } catch (e) {
    unstable_rethrow(e);
    // Never log what was written, only that saving failed.
    console.error("Saving a contact message failed:", e instanceof Error ? e.name : "unknown error");
    return fail(fd, "Something went wrong while sending. Please try again in a moment.");
  }

  return {
    status: "success",
    notice:
      "Our team will read your message and reply to the email you gave. If you need help right now, please call a hotline instead of waiting for a reply.",
  };
}

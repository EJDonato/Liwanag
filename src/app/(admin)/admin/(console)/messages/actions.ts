"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin/dal";
import { idSchema } from "@/lib/validation/contact";

// Every action re-checks the session: Server Actions are public endpoints.

export async function setMessageRead(id: string, isRead: boolean) {
  await verifyAdmin();
  if (!idSchema.safeParse(id).success) return;
  await db.contactMessage.updateMany({ where: { id }, data: { isRead } });
  revalidatePath("/admin/messages");
}

// The only permanent delete in the admin area: it is for spam and for removing details someone
// asked us to erase, so the page asks for a second click first.
export async function deleteMessage(id: string) {
  await verifyAdmin();
  if (!idSchema.safeParse(id).success) return;
  await db.contactMessage.deleteMany({ where: { id } });
  revalidatePath("/admin/messages");
}

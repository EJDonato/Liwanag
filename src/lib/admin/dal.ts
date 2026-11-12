import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { readAdminSession } from "@/lib/admin/session";

// The data access layer for the admin area. The proxy only does a quick optimistic redirect;
// this is the real check, and it asks the database every time, so removing an admin account
// ends their access immediately even if their cookie is still valid.
export const getAdmin = cache(async () => {
  const session = await readAdminSession();
  if (!session) return null;
  return db.admin.findUnique({
    where: { id: session.adminId },
    select: { id: true, username: true, role: true },
  });
});

// Call this at the top of every admin page and server action.
export async function verifyAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

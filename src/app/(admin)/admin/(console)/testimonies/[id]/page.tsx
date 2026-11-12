import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageTitle } from "@/components/admin/ui";
import { TextAreaField, TextField } from "@/components/forms/fields";
import { FormFrame } from "@/components/forms/form-frame";
import { verifyAdmin } from "@/lib/admin/dal";
import { formatDateTime } from "@/lib/admin/format";
import { db } from "@/lib/db";
import { idSchema } from "@/lib/validation/contact";
import { saveTestimony } from "../actions";

export const metadata: Metadata = { title: "Edit testimony" };

const statusLabel = { PENDING: "Waiting for review", APPROVED: "On the site", REJECTED: "Declined" } as const;

export default async function EditTestimonyPage({ params }: PageProps<"/admin/testimonies/[id]">) {
  await verifyAdmin();
  const { id } = await params;
  const testimony = idSchema.safeParse(id).success ? await db.testimony.findUnique({ where: { id } }) : null;
  if (!testimony) notFound();

  return (
    <div className="max-w-2xl">
      <p>
        <Link href={`/admin/testimonies?status=${testimony.status.toLowerCase()}`} className="text-muted-foreground underline underline-offset-4 hover:text-foreground">
          Back to testimonies
        </Link>
      </p>
      <div className="mt-6">
        <PageTitle title="Edit testimony">
          {statusLabel[testimony.status]} · sent {formatDateTime(testimony.createdAt)}. Tidy wording or remove details
          that could identify someone. The person is not notified.
        </PageTitle>
      </div>

      <div className="mt-10">
        <FormFrame
          action={saveTestimony}
          submitLabel="Save changes"
          backLink={false}
          initialValues={{ displayName: testimony.displayName, content: testimony.content }}
        >
          <input type="hidden" name="id" value={testimony.id} />
          <TextField name="displayName" label="Name shown" hint="Leave blank to show Anonymous." autoComplete="off" />
          <TextAreaField name="content" label="Testimony" required rows={7} maxLength={600} hint="Up to 600 characters." />
        </FormFrame>
      </div>
    </div>
  );
}

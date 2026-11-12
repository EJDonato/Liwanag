import { getAdmin } from "@/lib/admin/dal";
import { toCsv } from "@/lib/admin/csv";
import { exportClients } from "@/lib/admin/queries";

const headers = [
  "Reference code",
  "Full name",
  "Email",
  "Phone",
  "Birthdate",
  "Started",
  "Consent signed",
  "Privacy signed",
  "Interview submitted",
  "Assessment submitted",
  "Assessment score (of 30)",
  "Assessment band",
  "Safety answer flagged",
  "Exit form submitted",
  "Exit overall rating (of 5)",
  "Allows testimony",
] as const;

export async function GET(request: Request) {
  // Route handlers are public endpoints too: check the session here, not only in the proxy.
  const admin = await getAdmin();
  if (!admin) return new Response("Please sign in.", { status: 401, headers: { "Cache-Control": "no-store" } });

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").slice(0, 100);
  const flag = searchParams.get("flag") === "safety";

  const rows = (await exportClients({ q, flag })).map(({ client: c, assessment, exitOverall }) => [
    c.referenceCode,
    c.fullName,
    c.email,
    c.phone,
    c.birthdate ? c.birthdate.toISOString().slice(0, 10) : null,
    c.createdAt,
    c.consent?.signedAt,
    c.privacy?.signedAt,
    c.interview?.submittedAt,
    c.assessment?.submittedAt,
    c.assessment?.totalScore ?? null,
    assessment?.band ?? null,
    assessment ? assessment.safetyFlag : null,
    c.exit?.submittedAt,
    exitOverall,
    c.exit ? c.exit.allowTestimony : null,
  ]);

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
  return new Response(toCsv(headers, rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="liwanag-submissions-${today}.csv"`,
      // Private health data: never let a browser or proxy keep a copy.
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

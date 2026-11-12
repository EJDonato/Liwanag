import Link from "next/link";

// A staff page for something that does not exist (an old link, or a record that was deleted).
export default function ConsoleNotFound() {
  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">That record could not be found</h1>
      <p className="mt-4 text-lg text-muted-foreground">It may have been deleted, or the address may be mistyped.</p>
      <p className="mt-8">
        <Link href="/admin" className="font-semibold underline underline-offset-4">
          Back to the dashboard
        </Link>
      </p>
    </div>
  );
}

"use client";

// A staff page failed to load (usually the database). No visitor-facing hotline copy here.
export default function ConsoleError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">This page could not load</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Something went wrong on our side, and nothing has been changed. Try again, and if it keeps
        happening, check the database connection.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex min-h-12 items-center rounded-full bg-night px-8 font-semibold text-white transition-colors hover:bg-night-2"
      >
        Try again
      </button>
    </div>
  );
}

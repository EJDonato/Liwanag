"use client";

import { useEffect, useState } from "react";

const EVENT = "admin:status";

// Tell everyone what just happened: sighted users get a short message, screen readers hear it too.
export function announce(message: string) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: message }));
}

// An action usually removes the button that was pressed, which would drop keyboard focus to the top
// of the page. Park focus on the results list instead, so the next Tab reaches the next item.
// The short delay lets the refreshed list replace the old one first.
export function focusResults() {
  setTimeout(() => document.getElementById("admin-results")?.focus({ preventScroll: true }), 200);
}

export function StatusRegion() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onStatus = (event: Event) => {
      setMessage((event as CustomEvent<string>).detail);
      clearTimeout(timer);
      timer = setTimeout(() => setMessage(""), 5000);
    };
    window.addEventListener(EVENT, onStatus);
    return () => {
      window.removeEventListener(EVENT, onStatus);
      clearTimeout(timer);
    };
  }, []);

  // The live region exists before any message does: screen readers only announce changes to one
  // that is already on the page.
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      {message && (
        <p className="pointer-events-auto rounded-full bg-night px-6 py-3 font-semibold text-white shadow-lg toast-life">{message}</p>
      )}
    </div>
  );
}

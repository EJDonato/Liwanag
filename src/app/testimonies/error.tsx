"use client";

import { RouteError } from "@/components/route-error";

export default function TestimoniesError({ reset }: { error: Error; reset: () => void }) {
  return <RouteError reset={reset} message="This is on our side, not yours. Please try again in a moment." />;
}

"use client";

import { RouteError } from "@/components/route-error";

export default function FormsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <RouteError
      reset={reset}
      message="This is on our side, not yours. Nothing you entered has been lost or shared."
    />
  );
}

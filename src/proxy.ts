import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin/constants";
import { verifySessionToken } from "@/lib/admin/token";

// A quick, optimistic gate: no valid cookie means no admin page, only the sign-in page.
// This is not the security boundary. Every admin page and action re-checks through
// lib/admin/dal.ts, which also confirms the account still exists.
export async function proxy(request: NextRequest) {
  const isSignIn = request.nextUrl.pathname === "/admin/login";
  const secret = process.env.AUTH_SECRET;
  const session = secret ? await verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value, secret) : null;

  const response =
    !isSignIn && !session
      ? NextResponse.redirect(new URL("/admin/login", request.url))
      : NextResponse.next();

  // Staff pages are private: never cache them, never index them.
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/api/auth",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the landing page (root)
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static assets and Next internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for better-auth session cookie
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ??
    request.cookies.get("__Secure-better-auth.session_token");

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

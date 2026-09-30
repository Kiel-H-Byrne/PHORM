import { NextResponse, type NextRequest } from "next/server";

// UX-only gate: redirects signed-out visitors to login. Real authorization
// happens in the API routes, which verify Firebase ID tokens.
const protectedPaths = [
  "/dashboard",
  "/member-directory",
  "/members",
  "/connections",
];

// Define public paths that should never be redirected
const publicPaths = [
  "/auth/login",
  "/",
  "/about",
  "/privacy-and-terms",
  "/tech-stack",
  "/listings",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // Check if the path is a public path
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // Get the Firebase auth cookie
  const authCookie = request.cookies.get("firebase-auth-token");
  const isAuthenticated = !!authCookie;

  // If it's a protected path and user is not authenticated, redirect to login
  if (isProtectedPath && !isAuthenticated) {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Continue with the request
  return NextResponse.next();
}

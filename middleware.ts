import { NextResponse, type NextRequest } from "next/server";

// Define which routes require authentication
const protectedPaths = [
  '/dashboard',
  '/member-directory',
];

// Define public paths that should never be redirected
const publicPaths = [
  '/auth/login',
  '/',
  '/about',
  '/privacy-and-terms',
  '/tech-stack',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(path =>
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // Check if the path is a public path
  const isPublicPath = publicPaths.some(path =>
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // Get the Firebase auth cookie
  const authCookie = request.cookies.get('firebase-auth-token');
  const isAuthenticated = !!authCookie;

  // If it's a protected path and user is not authenticated, redirect to login
  if (isProtectedPath && !isAuthenticated) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // If it's an API route that requires authentication
  if (pathname.startsWith('/api/users') && !isAuthenticated) {
    return NextResponse.json(
      { success: false, message: 'Authentication required' },
      { status: 401 }
    );
  }

  // For API listings, we don't block but might want to limit results
  if (pathname.startsWith('/api/listings')) {
    // Allow access but might limit results based on auth status
    // This would be handled in the API route itself
  }

  // Continue with the request
  return NextResponse.next();
}

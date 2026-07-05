import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes
const publicRoutes = ["/signin", "/request"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Get authentication token
  const token = request.cookies.get("access_token")?.value;

  // 1. If trying to access a protected route without a token, redirect to /signin
  if (!isPublicRoute && !token) {
    const signInUrl = new URL("/signin", request.url);
    return NextResponse.redirect(signInUrl);
  }

  // 2. If trying to access /signin while already logged in, redirect to home
  if (pathname === "/signin" && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except API routes, next static files, images, favicon, etc.
  matcher: [
    "/((?!api|_next/static|_next/image|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.ico).*)",
  ],
};

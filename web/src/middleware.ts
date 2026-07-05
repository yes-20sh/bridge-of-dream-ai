import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/explore",
  "/saved",
  "/applied",
  "/network",
  "/account",
  "/resume-edit",
  "/jobs",
  "/admin",
];

const authRoutes = ["/signin", "/request", "/"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  // Validate the route. If it doesn't match any known page/prefix, redirect to /
  const isValidRoute =
    pathname === "/" ||
    protectedRoutes.some((route) => pathname === route || pathname.startsWith(route + "/")) ||
    authRoutes.some((route) => pathname === route || pathname.startsWith(route + "/")) ||
    pathname === "/help" ||
    pathname.startsWith("/help/");

  if (!isValidRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Check if the path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname === route || pathname.startsWith(route + "/")
  );

  // Check if the path is an auth route (signin, request)
  const isAuthRoute = authRoutes.some((route) =>
    pathname === route || pathname.startsWith(route + "/")
  );

  // Redirect to signin if accessing a protected route without a token
  if (isProtectedRoute && !token) {
    const url = new URL("/signin", request.url);
    return NextResponse.redirect(url);
  }

  // Redirect to explore if logged in and trying to access signin or request page
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/explore", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico and other assets with file extensions
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};

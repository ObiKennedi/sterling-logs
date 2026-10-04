import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Next.js 16 Network Proxy & Security Boundary
 * Intercepts incoming requests before route rendering:
 * - Redirects users with active sessions away from auth pages to /dashboard
 * - Separates active sessions based on roles:
 *     - "admin" -> /admin
 *     - "user"  -> /dashboard
 * - Protects /dashboard and /admin against unauthenticated access
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check for Better Auth session token in cookies
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  const hasSessionCookie = Boolean(sessionToken);

  // 2. Fetch session and role data when session token is present
  let session = null;
  let userRole = "user";

  if (hasSessionCookie) {
    try {
      session = await auth.api.getSession({
        headers: request.headers,
      });

      if (session?.user) {
        userRole = (session.user as { role?: string }).role || "user";
      }
    } catch (err) {
      console.warn("[proxy.ts] Session verification warning:", err);
    }
  }

  const isAuthenticated = Boolean(session?.user || hasSessionCookie);

  // 3. Route classifications
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  const isDashboardRoute =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  const isAdminRoute =
    pathname === "/admin" || pathname.startsWith("/admin/");

  // CASE 1: Active session on auth routes (/login, /signup)
  // Direct them to /dashboard or /admin based on role
  if (isAuthRoute && isAuthenticated) {
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // CASE 2: User requests /dashboard
  if (isDashboardRoute) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role separation: If user is an admin, route to /admin
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // CASE 3: User requests /admin
  if (isAdminRoute) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role separation: Non-admin users redirected to /dashboard
    if (session?.user && userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

// Export both standard Next.js 16 proxy and backward-compatible middleware aliases
export { proxy as middleware };
export default proxy;

export const config = {
  matcher: [
    /*
     * Match application routes, excluding:
     * - api routes (/api/*)
     * - static assets (_next/static, _next/image, favicon.ico)
     * - static images and files (.png, .svg, .jpg, .webp, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

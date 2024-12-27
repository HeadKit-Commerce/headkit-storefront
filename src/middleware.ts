import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPrivateRoute = pathname.startsWith("/account/") && !pathname.startsWith("/account/forgot-password") && !pathname.startsWith("/account/reset-password");
  const isAuthRoute = pathname === "/account";
  const authToken = request.cookies.get("woocommerce-auth")?.value;

  if (isPrivateRoute && !authToken) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  if (isAuthRoute && authToken) {
    return NextResponse.redirect(new URL("/account/profile", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*"],
}; 
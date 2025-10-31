import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAMES } from "./lib/headkit/constants";
import { refreshTokenInMiddleware } from "./lib/headkit/actions/auth";
import { getSecureCookieOptions } from "./lib/auth-utils";

interface JWTPayload {
  exp?: number;
}

// Edge Runtime compatible JWT expiration checker
function isTokenExpiredEdge(token: string): boolean {
  try {
    if (!token) return true;
    
    // Split the JWT token and get the payload
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    // Decode the payload (base64url decode)
    const payload = parts[1];
    // Add padding if needed
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    
    let decodedPayload: JWTPayload;
    try {
      // Use atob for base64 decoding (available in Edge Runtime)
      const jsonString = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
      decodedPayload = JSON.parse(jsonString) as JWTPayload;
    } catch {
      return true;
    }
    
    if (!decodedPayload.exp) return false;
    
    // Check if token is expired
    return decodedPayload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPrivateRoute = pathname.startsWith("/account/") && !pathname.startsWith("/account/forgot-password") && !pathname.startsWith("/account/reset-password");
  const isAuthRoute = pathname === "/account";
  const authToken = request.cookies.get(COOKIE_NAMES.AUTH_TOKEN)?.value;

  // For private routes, check if we have a valid token
  if (isPrivateRoute) {
    let validToken = authToken;

    // Check if token exists and is not expired
    if (!validToken || isTokenExpiredEdge(validToken)) {
      // Try to refresh the token
      const refreshedTokens = await refreshTokenInMiddleware(request);
      
      if (refreshedTokens) {
        validToken = refreshedTokens.authToken;
        // Create response with both new auth token and new refresh token
        const response = NextResponse.next();
        response.cookies.set(COOKIE_NAMES.AUTH_TOKEN, refreshedTokens.authToken, getSecureCookieOptions());
        
        // Set the new refresh token from getCustomer
        response.cookies.set(COOKIE_NAMES.REFRESH_TOKEN, refreshedTokens.refreshToken, getSecureCookieOptions());
        
        return response;
      } else {
        // Clear invalid tokens and redirect to login
        const response = NextResponse.redirect(new URL("/account", request.url));
        response.cookies.delete(COOKIE_NAMES.AUTH_TOKEN);
        response.cookies.delete(COOKIE_NAMES.REFRESH_TOKEN);
        return response;
      }
    }
  }

  // If user is already authenticated and trying to access auth page, redirect to profile
  if (isAuthRoute && authToken && !isTokenExpiredEdge(authToken)) {
    return NextResponse.redirect(new URL("/account/profile", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*"],
};


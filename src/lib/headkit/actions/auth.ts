"use server";

import { cookies } from "next/headers";
// jwtDecode removed - using Edge Runtime compatible version below
import { COOKIE_NAMES, EXPIRATION_THRESHOLD } from "../constants";
import { headkit } from "../client";
import { v7 as uuidv7 } from "uuid";
import { NextRequest } from "next/server";
import { getSecureCookieOptions, logCookieError } from "../../auth-utils";

interface JWTPayload {
  exp?: number;
}

// Edge Runtime compatible JWT expiration checker
const isTokenExpiredSync = (token: string): boolean => {
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
};

// Async version for server actions (required for server actions)
export const isTokenExpired = async (token: string): Promise<boolean> => {
  return isTokenExpiredSync(token);
};

export const shouldUpdateToken = async (token: string): Promise<boolean> => {
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
    
    const timeUntilExpiration = decodedPayload.exp - Math.floor(Date.now() / 1000);
    return timeUntilExpiration < EXPIRATION_THRESHOLD;
  } catch {
    return true;
  }
};

const getValidToken = async (cookieName: string) => {
  try {
    const token = (await cookies()).get(cookieName)?.value;
    if (!token) return null;
    
    return (await isTokenExpired(token)) ? null : token;
  } catch (error) {
    // This is expected during static generation
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Could not read cookie ${cookieName} (likely during static generation):`, (error as Error).message || error);
    }
    return null;
  }
};

export const getWoocommerceAuthToken = async () => {
  return getValidToken(COOKIE_NAMES.AUTH_TOKEN);
};

export const getWoocommerceRefreshToken = async () => {
  return getValidToken(COOKIE_NAMES.REFRESH_TOKEN);
};

export const getWoocommerceSession = async () => {
  return getValidToken(COOKIE_NAMES.SESSION);
};

export const handleAuthToken = async (token: string) => {
  try {
    (await cookies()).set(COOKIE_NAMES.AUTH_TOKEN, token, getSecureCookieOptions());
  } catch (error) {
    logCookieError("set auth token", error);
  }
};

export const handleRefreshToken = async (token: string) => {
  try {
    (await cookies()).set(COOKIE_NAMES.REFRESH_TOKEN, token, getSecureCookieOptions());
  } catch (error) {
    logCookieError("set refresh token", error);
  }
};

export const removeAuthToken = async () => {
  try {
    (await cookies()).delete(COOKIE_NAMES.AUTH_TOKEN);
  } catch (error) {
    logCookieError("remove auth token", error);
  }
};

export const removeRefreshToken = async () => {
  try {
    (await cookies()).delete(COOKIE_NAMES.REFRESH_TOKEN);
  } catch (error) {
    logCookieError("remove refresh token", error);
  }
};

export const removeSession = async () => {
  try {
    (await cookies()).delete(COOKIE_NAMES.SESSION);
  } catch (error) {
    logCookieError("remove session", error);
  }
};

export const removeSingleCheckoutSession = async () => {
  try {
    (await cookies()).delete(COOKIE_NAMES.SINGLE_CHECKOUT);
  } catch (error) {
    logCookieError("remove single checkout session", error);
  }
};

export const setSingleCheckoutSession = async () => {
  try {
    (await cookies()).set(COOKIE_NAMES.SINGLE_CHECKOUT, "true", getSecureCookieOptions());
  } catch (error) {
    logCookieError("set single checkout session", error);
  }
};

export const getSingleCheckoutSession = async () => {
  return getValidToken(COOKIE_NAMES.SINGLE_CHECKOUT);
};

export const isSingleCheckoutMode = async () => {
  const session = await getSingleCheckoutSession();
  return session === "true";
};

export const refreshJwtAuthToken = async ({ input }: { input: { jwtRefreshToken: string } }) => {
  const response = await headkit().refreshJwtAuthToken({
    input: {
      jwtRefreshToken: input.jwtRefreshToken,
      clientMutationId: uuidv7(),
    },
  });
  return response;
};


// Simplified refresh function for middleware use  
export const refreshTokenForMiddleware = async (refreshToken: string): Promise<{authToken: string, refreshToken: string} | null> => {
  try {
    if (!refreshToken || isTokenExpiredSync(refreshToken)) {
      return null;
    }
    
    const response = await refreshJwtAuthToken({
      input: {
        jwtRefreshToken: refreshToken,
      },
    });

    if (response.errors) {
      return null;
    }

    const newAuthToken = response.data?.refreshJwtAuthToken?.authToken;
    if (!newAuthToken) {
      return null;
    }

    // Now call getCustomer with the new auth token to get the new refresh token
    // Import headkit client directly to avoid pulling in Stripe dependencies
    const { headkit } = await import('../client');
    
    // Temporarily set the auth token so getCustomer can use it
    await handleAuthToken(newAuthToken);
    
    try {
      const customerResponse = await headkit().getCustomer({});
      const newRefreshToken = customerResponse.data?.customer?.jwtRefreshToken;
      
      if (newRefreshToken) {
        return {
          authToken: newAuthToken,
          refreshToken: newRefreshToken
        };
      } else {
        return null;
      }
    } catch (customerError) {
      console.error("💥 refreshTokenForMiddleware error:", customerError);
      return null;
    }
  } catch (error) {
    console.error("💥 refreshTokenForMiddleware error:", error);
    return null;
  }
};

export const refreshAuthToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await getWoocommerceRefreshToken();
    if (!refreshToken) {
      return null;
    }

    const response = await refreshJwtAuthToken({
      input: {
        jwtRefreshToken: refreshToken,
      },
    });

    if (response.data?.refreshJwtAuthToken?.authToken) {
      const newAuthToken = response.data.refreshJwtAuthToken.authToken;
      await handleAuthToken(newAuthToken);
      return newAuthToken;
    }

    return null;
  } catch (error) {
    console.error("💥 refreshAuthToken error:", error);
    return null;
  }
};

export const getValidAuthToken = async (): Promise<string | null> => {
  // First try to get current token
  const currentToken = await getWoocommerceAuthToken();
  
  if (currentToken && !(await isTokenExpired(currentToken))) {
    return currentToken;
  }

  // If token is expired or missing, try to refresh
  const refreshedToken = await refreshAuthToken();
  
  if (refreshedToken) {
    return refreshedToken;
  }

  // If refresh failed, clear both tokens
  await Promise.all([removeAuthToken(), removeRefreshToken()]);
  return null;
};



/**
 * Clears all authentication tokens
 * Consolidates token cleanup logic used across multiple places
 */
export const clearAllAuthTokens = async (): Promise<void> => {
  await Promise.all([
    removeAuthToken(),
    removeRefreshToken()
  ]);
};

export const refreshTokenInMiddleware = async (request: NextRequest): Promise<{authToken: string, refreshToken: string} | null> => {
  try {
    const refreshToken = request.cookies.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;
    if (!refreshToken) {
      return null;
    }
    
    
    const tokens = await refreshTokenForMiddleware(refreshToken);
    
    
    return tokens;
  } catch (error) {
    console.error("💥 refreshTokenInMiddleware error:", error);
    return null;
  }
};

"use server";

import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { COOKIE_NAMES, EXPIRATION_THRESHOLD } from "../constants";

interface JWTPayload {
  exp?: number;
}

export const isTokenExpired = async (token: string): Promise<boolean> => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    if (!decoded.exp) return false;
    
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const shouldUpdateToken = async (token: string): Promise<boolean> => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    if (!decoded.exp) return false;
    
    const timeUntilExpiration = decoded.exp - Math.floor(Date.now() / 1000);
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

export const getWoocommerceSession = async () => {
  return getValidToken(COOKIE_NAMES.SESSION);
};

export const handleAuthToken = async (token: string) => {
  try {
    (await cookies()).set(COOKIE_NAMES.AUTH_TOKEN, token);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn("Could not set auth token (likely during static generation):", (error as Error).message || error);
    }
  }
};

export const removeAuthToken = async () => {
  try {
    (await cookies()).delete(COOKIE_NAMES.AUTH_TOKEN);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn("Could not remove auth token (likely during static generation):", (error as Error).message || error);
    }
  }
};

export const removeSession = async () => {
  try {
    (await cookies()).delete(COOKIE_NAMES.SESSION);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn("Could not remove session (likely during static generation):", (error as Error).message || error);
    }
  }
};

export const removeSingleCheckoutSession = async () => {
  try {
    (await cookies()).delete(COOKIE_NAMES.SINGLE_CHECKOUT);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn("Could not remove single checkout session (likely during static generation):", (error as Error).message || error);
    }
  }
};

export const setSingleCheckoutSession = async () => {
  try {
    (await cookies()).set(COOKIE_NAMES.SINGLE_CHECKOUT, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn("Could not set single checkout session (likely during static generation):", (error as Error).message || error);
    }
  }
};

export const getSingleCheckoutSession = async () => {
  return getValidToken(COOKIE_NAMES.SINGLE_CHECKOUT);
};

export const isSingleCheckoutMode = async () => {
  const session = await getSingleCheckoutSession();
  return session === "true";
};

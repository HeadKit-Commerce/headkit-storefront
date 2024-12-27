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
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  
  return (await isTokenExpired(token)) ? null : token;
};

export const getWoocommerceAuthToken = async () => {
  return getValidToken(COOKIE_NAMES.AUTH_TOKEN);
};

export const getWoocommerceSession = async () => {
  return getValidToken(COOKIE_NAMES.SESSION);
};

export const handleAuthToken = async (token: string) => {
  (await cookies()).set(COOKIE_NAMES.AUTH_TOKEN, token);
};

export const removeAuthToken = async () => {
  (await cookies()).delete(COOKIE_NAMES.AUTH_TOKEN);
};

export const removeSession = async () => {
  (await cookies()).delete(COOKIE_NAMES.SESSION);
};

export const removeSingleCheckoutSession = async () => {
  (await cookies()).delete(COOKIE_NAMES.SINGLE_CHECKOUT);
};

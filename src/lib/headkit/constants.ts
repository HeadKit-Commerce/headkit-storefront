export const COOKIE_NAMES = {
  AUTH_TOKEN: "woocommerce-auth",
  SESSION: "woocommerce-session"
} as const;

export const HEADER_NAMES = {
  AUTH_TOKEN: "x-headkit-woocommerce-auth",
  SESSION: "x-headkit-woocommerce-session"
} as const;

export const EXPIRATION_THRESHOLD = 24 * 60 * 60; // 24 hours in seconds 
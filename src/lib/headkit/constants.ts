export const COOKIE_NAMES = {
  AUTH_TOKEN: "woocommerce-auth",
  REFRESH_TOKEN: "woocommerce-refresh",
  SESSION: "wp-woocommerce-session",
  SINGLE_CHECKOUT: "woocommerce-session-single-checkout",
} as const;

export const HEADER_NAMES = {
  AUTH_TOKEN: "x-headkit-woocommerce-auth",
  SESSION: "x-headkit-woocommerce-session",
  FORCE_TEST_MODE: "X-Headkit-Force-Test-Mode"
} as const;

export const EXPIRATION_THRESHOLD = 24 * 60 * 60; // 24 hours in seconds 
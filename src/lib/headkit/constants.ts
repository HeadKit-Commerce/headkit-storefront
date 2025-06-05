// Legacy cookie names (for backward compatibility)
export const LEGACY_COOKIE_NAMES = {
  AUTH_TOKEN: "woocommerce-auth",
  SESSION: "wp-woocommerce-session",
  SINGLE_CHECKOUT: "woocommerce-session-single-checkout",
} as const;

// New unified cookie names (platform-agnostic)
export const COOKIE_NAMES = {
  // Session management
  SESSION: "headkit_session",
  SESSION_ID: "headkit_session_id", 
  SINGLE_CHECKOUT: "headkit_single_checkout",
  
  // Cart management
  CART_HASH: "headkit_cart_hash",
  ITEMS_IN_CART: "headkit_items_in_cart",
  CART_ID: "headkit_cart_id",
  
  // Authentication
  AUTH_TOKEN: "headkit_auth_token",
  USER_ID: "headkit_user_id",
  
  // Marketing/Analytics
  MAILCHIMP_USER_EMAIL: "mailchimp_user_email",
  MAILCHIMP_USER_PREVIOUS_EMAIL: "mailchimp_user_previous_email",
  
  // Checkout
  CHECKOUT_DATA: "headkit_checkout_data",
  
  // Preferences
  USER_PREFERENCES: "headkit_user_prefs",
  
  // Payment
  STRIPE_PAYMENT_INTENT: "headkit_stripe_payment_intent",
  STRIPE_CUSTOMER_ID: "headkit_stripe_customer_id",
} as const;

// Platform-specific cookie prefixes for multi-backend support
export const COOKIE_PREFIXES = {
  WOOCOMMERCE: 'hk_wc_',
  SHOPIFY: 'hk_shopify_',
  STRIPE: 'hk_stripe_',
  COMMON: 'hk_common_',
  MAILCHIMP: 'hk_mc_',
  AUTH: 'hk_auth_',
} as const;

// New unified cookie names with prefixes
export const UNIFIED_COOKIE_NAMES = {
  // WooCommerce specific
  WC_SESSION: `${COOKIE_PREFIXES.WOOCOMMERCE}session`,
  WC_CART_HASH: `${COOKIE_PREFIXES.WOOCOMMERCE}cart_hash`,
  WC_ITEMS_IN_CART: `${COOKIE_PREFIXES.WOOCOMMERCE}items_in_cart`,
  WC_AUTH_TOKEN: `${COOKIE_PREFIXES.WOOCOMMERCE}auth_token`,
  WC_SINGLE_CHECKOUT: `${COOKIE_PREFIXES.WOOCOMMERCE}single_checkout`,
  
  // Shopify specific (for future)
  SHOPIFY_SESSION: `${COOKIE_PREFIXES.SHOPIFY}session`,
  SHOPIFY_CART_TOKEN: `${COOKIE_PREFIXES.SHOPIFY}cart_token`,
  SHOPIFY_CUSTOMER_TOKEN: `${COOKIE_PREFIXES.SHOPIFY}customer_token`,
  
  // Payment related
  STRIPE_PAYMENT_INTENT: `${COOKIE_PREFIXES.STRIPE}payment_intent`,
  STRIPE_CUSTOMER_ID: `${COOKIE_PREFIXES.STRIPE}customer_id`,
  
  // Common/platform-agnostic
  USER_PREFERENCES: `${COOKIE_PREFIXES.COMMON}user_prefs`,
  CART_ID: `${COOKIE_PREFIXES.COMMON}cart_id`,
  CHECKOUT_DATA: `${COOKIE_PREFIXES.COMMON}checkout_data`,
  
  // Marketing/Analytics
  MAILCHIMP_USER_EMAIL: `${COOKIE_PREFIXES.MAILCHIMP}user_email`,
  MAILCHIMP_USER_PREVIOUS_EMAIL: `${COOKIE_PREFIXES.MAILCHIMP}user_previous_email`,
  
  // Authentication
  CURRENT_PLATFORM: `${COOKIE_PREFIXES.AUTH}current_platform`,
  USER_ID: `${COOKIE_PREFIXES.AUTH}user_id`,
} as const;

// Platform types for type safety
export type Platform = 'woocommerce' | 'shopify' | 'stripe' | 'common' | 'mailchimp' | 'auth';

// Cookie filtering configuration for each platform
export const PLATFORM_COOKIE_FILTERS = {
  woocommerce: {
    // Cookies that should be sent to WooCommerce backend
    outbound: [
      'PHPSESSID',
      'woocommerce_cart_hash', 
      'woocommerce_items_in_cart',
      'wp_woocommerce_session_',  // prefix
      'wordpress_',               // prefix
      'wp-settings-',            // prefix
      'wordpress_logged_in_',    // prefix
    ],
    // Cookies that WooCommerce can set (will be prefixed on return)
    inbound: [
      'PHPSESSID',
      'woocommerce_cart_hash',
      'woocommerce_items_in_cart', 
      'wp_woocommerce_session_',  // prefix
    ],
  },
  shopify: {
    outbound: [
      '_shopify_y',
      '_shopify_s', 
      '_shopify_sa_p',
      '_shopify_sa_t',
      'cart',
      'secure_customer_sig',
    ],
    inbound: [
      '_shopify_y',
      '_shopify_s',
      'cart',
      'secure_customer_sig',
    ],
  },
  stripe: {
    outbound: [
      '_stripe_mid',
      '_stripe_sid',
    ],
    inbound: [],  // Stripe usually doesn't set cookies
  },
  common: {
    outbound: [
      // Platform-agnostic cookies that all backends might need
      'mailchimp_user_email',
      'mailchimp_user_previous_email',
    ],
    inbound: [],
  },
  mailchimp: {
    outbound: [
      'mailchimp_user_email',
      'mailchimp_user_previous_email',
    ],
    inbound: [
      'mailchimp_user_email',
      'mailchimp_user_previous_email',
    ],
  },
  auth: {
    outbound: [
      'headkit_auth_token',
      'user_session',
    ],
    inbound: [
      'headkit_auth_token',
      'user_session',
    ],
  },
} as const;

export const HEADER_NAMES = {
  // Gateway authentication (frontend → gateway)
  GATEWAY_AUTH: "Authorization", // Bearer ${HEADKIT_API_TOKEN}
  
  // User authentication (platform-agnostic)
  USER_AUTH: "x-headkit-user-auth", // User login token
  
  // Legacy platform-specific headers (for backward compatibility)
  LEGACY_WC_AUTH: "x-headkit-woocommerce-auth",
  LEGACY_WC_SESSION: "x-headkit-woocommerce-session",
  
  // Cache control
  NO_CACHE: "x-no-cache",
  
  // Platform detection (optional, for explicit platform targeting)
  PLATFORM_HINT: "x-headkit-platform", // "woocommerce" | "shopify" | etc.
} as const;

export const EXPIRATION_THRESHOLD = 24 * 60 * 60; // 24 hours in seconds 
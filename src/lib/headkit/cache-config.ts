/**
 * Centralized cache tag definitions for the entire application
 * All revalidation is tag-based with 7-day stale time fallback
 * 
 * Tags must match WordPress webhook implementation in headkit-webhook.php
 */

export const CACHE_TAGS = {
  // Content Pages
  PAGES: 'headkit:pages',
  PAGE: (uri: string) => `headkit:page:${uri}`,
  POSTS: 'headkit:posts',
  POST: (slug: string) => `headkit:post:${slug}`,
  
  // Products
  PRODUCTS: 'headkit:products',
  PRODUCT: (slug: string) => `headkit:product:${slug}`,
  PRODUCT_CATEGORIES: 'headkit:product-categories',
  PRODUCT_FILTERS: 'headkit:product-filters',
  
  // Collections (matches WordPress webhook)
  COLLECTIONS: 'headkit:collections',
  COLLECTION: (slug: string) => `headkit:collections:${slug}`,
  
  // Brands
  BRANDS: 'headkit:brands',
  BRAND: (slug: string) => `headkit:brand:${slug}`,
  
  // Special Collections
  NEW_IN: 'headkit:new-in',
  SALE: 'headkit:sale',
  SHOP: 'headkit:page:shop',
  
  // Navigation & Settings (note: singular 'menu' matches WordPress webhook)
  MENU: 'headkit:menu',
  BRANDING: 'headkit:branding',
  GENERAL_SETTINGS: 'headkit:general-settings',
  SEO_SETTINGS: 'headkit:seo-settings',
  STORE_SETTINGS: 'headkit:store-settings',
  
  // eCommerce Config
  PAYMENT_GATEWAYS: 'headkit:payment-gateways',
  STRIPE_CONFIG: 'headkit:stripe-config',
  PICKUP_LOCATIONS: 'headkit:pickup-locations',
  
  // Carousels (note: singular 'carousel' matches WordPress webhook)
  CAROUSEL: 'headkit:carousel',
  CAROUSEL_CATEGORY: (category: string) => `headkit:carousel:${category}`,
  
  // Forms
  FAQS: 'headkit:faqs',
  GRAVITY_FORMS: 'headkit:gravity-forms',
  FORM: (id: string) => `headkit:form:${id}`,
} as const;

/**
 * Very long stale time - rely on tag-based revalidation
 * This prevents cache churn and unnecessary refetches
 * Actual revalidation is triggered by WordPress webhooks
 */
export const DEFAULT_STALE_TIME = 7 * 24 * 60 * 60; // 7 days in seconds


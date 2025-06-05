import { COOKIE_PREFIXES, PLATFORM_COOKIE_FILTERS, type Platform } from '../constants';

export const encodeSessionCookie = (key: string, value: string): string => {
  // Remove the prefix to get just the unique part
  const uniqueId = key.replace("wp_woocommerce_session_", "");
  return `${uniqueId}::${value}`;
};

export const decodeSessionCookie = (
  encoded: string
): { key: string; value: string } | null => {
  if (!encoded) return null;

  const [uniqueId, value] = encoded.split("::");
  if (!uniqueId || !value) return null;

  return {
    key: `wp_woocommerce_session_${uniqueId}`,
    value,
  };
};

export const parseCookies = (
  setCookieHeader: string
): Record<string, string> => {
  const cookies: Record<string, string> = {};

  const cookieStrings = setCookieHeader.split(",").map((str) => str.trim());

  cookieStrings.forEach((cookieStr) => {
    const [nameValue] = cookieStr.split(";");
    const [name, value] = nameValue.split("=").map((s) => s.trim());

    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });

  return cookies;
};

export const getSessionKeyFromCookies = (
  cookies: Record<string, string>
): string | undefined => {
  return Object.keys(cookies).find((key) =>
    key.startsWith("wp_woocommerce_session_")
  );
};

// === NEW UNIFIED COOKIE MANAGEMENT ===

/**
 * Cookie Management for Multi-Platform Headless Commerce
 */

/**
 * Check if a cookie name belongs to a specific platform
 */
export const isPlatformCookie = (cookieName: string, platform: Platform): boolean => {
  const prefix = COOKIE_PREFIXES[platform.toUpperCase() as keyof typeof COOKIE_PREFIXES];
  return cookieName.startsWith(prefix);
};

/**
 * Extract platform from cookie name
 */
export const extractPlatformFromCookie = (cookieName: string): Platform | null => {
  for (const [platform, prefix] of Object.entries(COOKIE_PREFIXES)) {
    if (cookieName.startsWith(prefix)) {
      return platform.toLowerCase() as Platform;
    }
  }
  return null;
};

/**
 * Add platform prefix to cookie name
 */
export const addPlatformPrefix = (cookieName: string, platform: Platform): string => {
  const prefix = COOKIE_PREFIXES[platform.toUpperCase() as keyof typeof COOKIE_PREFIXES];
  return `${prefix}${cookieName}`;
};

/**
 * Remove platform prefix from cookie name
 */
export const removePlatformPrefix = (cookieName: string): string => {
  for (const prefix of Object.values(COOKIE_PREFIXES)) {
    if (cookieName.startsWith(prefix)) {
      return cookieName.substring(prefix.length);
    }
  }
  return cookieName;
};

/**
 * Filter cookies for a specific platform (outbound to backend)
 */
export const filterCookiesForPlatform = (
  cookieString: string, 
  platform: Platform
): string => {
  if (!cookieString) return '';
  
  const platformConfig = PLATFORM_COOKIE_FILTERS[platform];
  if (!platformConfig) return '';
  
  const cookies = cookieString.split(';').map(c => c.trim());
  const validCookies: string[] = [];
  
  for (const cookie of cookies) {
    if (!cookie) continue;
    
    const [cookieName] = cookie.split('=');
    if (!cookieName) continue;
    
    const trimmedName = cookieName.trim();
    
    // Check if this cookie should be sent to this platform
    const shouldInclude = platformConfig.outbound.some((allowedName: string) => {
      if (allowedName.endsWith('_')) {
        // Prefix match
        return trimmedName.startsWith(allowedName);
      }
      return trimmedName === allowedName;
    });
    
    if (shouldInclude) {
      validCookies.push(cookie);
    }
  }
  
  return validCookies.join('; ');
};

/**
 * Transform cookies from platform-specific format to unified format
 */
export const transformInboundCookies = (
  cookies: Record<string, string>, 
  platform: Platform
): Record<string, string> => {
  const transformedCookies: Record<string, string> = {};
  const platformConfig = PLATFORM_COOKIE_FILTERS[platform];
  
  if (!platformConfig) return cookies;
  
  for (const [cookieName, cookieValue] of Object.entries(cookies)) {
    // Check if this cookie should be captured and prefixed
    const shouldCapture = platformConfig.inbound.some((allowedName: string) => {
      if (allowedName.endsWith('_')) {
        return cookieName.startsWith(allowedName);
      }
      return cookieName === allowedName;
    });
    
    if (shouldCapture) {
      // Add platform prefix to avoid conflicts
      const prefixedName = addPlatformPrefix(cookieName, platform);
      transformedCookies[prefixedName] = cookieValue;
    }
    
    // Also keep non-platform-specific cookies as-is
    if (!shouldCapture && !Object.values(COOKIE_PREFIXES).some(prefix => cookieName.startsWith(prefix))) {
      transformedCookies[cookieName] = cookieValue;
    }
  }
  
  return transformedCookies;
};

/**
 * Get cookies for a specific platform from all stored cookies
 */
export const getCookiesForPlatform = (
  allCookies: Record<string, string>, 
  platform: Platform
): Record<string, string> => {
  const platformCookies: Record<string, string> = {};
  
  for (const [cookieName, cookieValue] of Object.entries(allCookies)) {
    if (isPlatformCookie(cookieName, platform)) {
      // Remove prefix for backend consumption
      const unprefixedName = removePlatformPrefix(cookieName);
      platformCookies[unprefixedName] = cookieValue;
    }
  }
  
  return platformCookies;
};

/**
 * Build cookie string for a specific platform
 */
export const buildCookieStringForPlatform = (
  allCookies: Record<string, string>, 
  platform: Platform
): string => {
  const platformCookies = getCookiesForPlatform(allCookies, platform);
  
  return Object.entries(platformCookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
};

/**
 * Cookie Manager Class for unified cookie operations
 */
export class HeadKitCookieManager {
  constructor(private cookieString: string = '') {}
  
  /**
   * Parse cookie string into platform-organized object
   */
  parseByPlatform(): Record<Platform, Record<string, string>> {
    const result: Record<Platform, Record<string, string>> = {
      woocommerce: {},
      shopify: {},
      stripe: {},
      common: {},
      mailchimp: {},
      auth: {},
    };
    
    if (!this.cookieString) return result;
    
    const cookies = this.cookieString.split(';').map(c => c.trim());
    
    for (const cookie of cookies) {
      if (!cookie) continue;
      
      const [name, ...valueParts] = cookie.split('=');
      if (!name || valueParts.length === 0) continue;
      
      const cookieName = name.trim();
      const cookieValue = valueParts.join('=');
      const platform = extractPlatformFromCookie(cookieName);
      
      if (platform) {
        const unprefixedName = removePlatformPrefix(cookieName);
        result[platform][unprefixedName] = cookieValue;
      }
    }
    
    return result;
  }
  
  /**
   * Get cookies for a specific platform
   */
  getForPlatform(platform: Platform): string {
    const allCookies = this.parseAllCookies();
    return buildCookieStringForPlatform(allCookies, platform);
  }
  
  /**
   * Add cookies with platform prefix
   */
  addCookiesForPlatform(cookies: Record<string, string>, platform: Platform): string {
    const existingCookies = this.parseAllCookies();
    
    // Add new cookies with platform prefix
    for (const [name, value] of Object.entries(cookies)) {
      const prefixedName = addPlatformPrefix(name, platform);
      existingCookies[prefixedName] = value;
    }
    
    // Rebuild cookie string
    return Object.entries(existingCookies)
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
  }
  
  private parseAllCookies(): Record<string, string> {
    const cookies: Record<string, string> = {};
    
    if (!this.cookieString) return cookies;
    
    const cookiePairs = this.cookieString.split(';').map(c => c.trim());
    
    for (const pair of cookiePairs) {
      if (!pair) continue;
      
      const [name, ...valueParts] = pair.split('=');
      if (name && valueParts.length > 0) {
        cookies[name.trim()] = valueParts.join('=');
      }
    }
    
    return cookies;
  }
}

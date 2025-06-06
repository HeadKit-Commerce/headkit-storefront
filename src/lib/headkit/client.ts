import { GraphQLClient } from "graphql-request";
import { getSdk } from "./generated";
import { HEADER_NAMES } from "./constants";

// Helper function to forward cookies from GraphQL response to browser
// const forwardCookiesToBrowser = async (responseCookies: string[]) => {
//   if (responseCookies.length === 0) return;

//   try {
//     const { cookies: cookiesHelper } = await import("next/headers");
//     const cookieStore = await cookiesHelper();

//     for (const cookieString of responseCookies) {
//       try {
//         // Parse cookie string: "name=value; attribute1; attribute2=value2"
//         const [nameValue, ...attributes] = cookieString
//           .split(";")
//           .map((s) => s.trim());
//         const [name, value] = nameValue.split("=").map((s) => s.trim());

//         if (!name || value === undefined) continue;

//         // Parse cookie attributes
//         const cookieOptions: {
//           maxAge?: number;
//           expires?: Date;
//           path?: string;
//           domain?: string;
//           secure?: boolean;
//           httpOnly?: boolean;
//           sameSite?: "strict" | "lax" | "none";
//         } = {};

//         for (const attr of attributes) {
//           const [attrName, attrValue] = attr.split("=").map((s) => s.trim());
//           const lowerAttrName = attrName.toLowerCase();

//           switch (lowerAttrName) {
//             case "max-age":
//               if (attrValue) cookieOptions.maxAge = parseInt(attrValue, 10);
//               break;
//             case "expires":
//               if (attrValue) cookieOptions.expires = new Date(attrValue);
//               break;
//             case "path":
//               if (attrValue) cookieOptions.path = attrValue;
//               break;
//             case "domain":
//               if (attrValue) cookieOptions.domain = attrValue;
//               break;
//             case "secure":
//               cookieOptions.secure = true;
//               break;
//             case "httponly":
//               cookieOptions.httpOnly = true;
//               break;
//             case "samesite":
//               if (attrValue) {
//                 const sameSiteValue = attrValue.toLowerCase();
//                 if (
//                   sameSiteValue === "strict" ||
//                   sameSiteValue === "lax" ||
//                   sameSiteValue === "none"
//                 ) {
//                   cookieOptions.sameSite = sameSiteValue;
//                 }
//               }
//               break;
//           }
//         }

//         // Set the cookie in Next.js
//         cookieStore.set(name, value, cookieOptions);
//         console.log(
//           `🍪 Auto-set cookie in browser: ${name}=${value}`,
//           cookieOptions
//         );
//       } catch (error) {
//         console.error(`Failed to parse cookie: ${cookieString}`, error);
//       }
//     }
//   } catch (error) {
//     console.error("Failed to forward cookies to browser:", error);
//   }
// };

// Custom GraphQL client that captures response headers and forwards cookies
// class CookieAwareGraphQLClient {
//   private endpoint: string;
//   private defaultHeaders: Record<string, string>;

//   constructor(endpoint: string, config: { headers: Record<string, string> }) {
//     this.endpoint = endpoint;
//     this.defaultHeaders = config.headers;
//   }

//   async request<T = unknown, V = Record<string, unknown>>(
//     document: string,
//     variables?: V,
//     requestHeaders?: Record<string, string>
//   ): Promise<T> {
//     // Use fetch directly to capture response headers
//     const response = await fetch(this.endpoint, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         ...this.defaultHeaders,
//         ...requestHeaders,
//       },
//       body: JSON.stringify({
//         query: document,
//         variables,
//       }),
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();

//     // Extract and forward cookies
//     const cookies: string[] = [];
//     const setCookieHeader = response.headers.get("set-cookie");
//     if (setCookieHeader) {
//       cookies.push(setCookieHeader);
//     }

//     const setCookieHeaders = response.headers.getSetCookie();
//     if (setCookieHeaders) {
//       cookies.push(...setCookieHeaders);
//     }

//     if (cookies.length > 0) {
//       console.log("🍪 Captured cookies from response:", cookies);
//       await forwardCookiesToBrowser(cookies.filter(Boolean));
//     }

//     if (data.errors) {
//       throw new Error(data.errors[0]?.message || "GraphQL Error");
//     }

//     return data.data;
//   }
// }

// Server-side GraphQL client for use in Server Actions and Route Handlers
// For client-side operations, use server actions that call this internally
// LEGACY VERSION - Use headkit() instead for automatic cookie handling
export const headkitLegacy = (options?: {
  // User authentication (platform-agnostic)
  userAuthToken?: string;

  // Legacy support (deprecated)
  authToken?: string;

  // Platform hint for optimization (optional)
  platform?: "woocommerce" | "shopify" | "stripe" | "auto";

  // Standard options
  revalidateTime?: number;
  revalidateTags?: string[];
  debug?: boolean;
  forceNoCache?: boolean;
}) => {
  const headers: Record<string, string> = {
    // Gateway authentication
    [HEADER_NAMES.GATEWAY_AUTH]: `Bearer ${process.env.HEADKIT_API_TOKEN}`,
  };

  // Unified user authentication (preferred)
  if (options?.userAuthToken) {
    headers[HEADER_NAMES.USER_AUTH] = options.userAuthToken;
  }
  // Legacy support for backward compatibility
  else if (options?.authToken) {
    headers[HEADER_NAMES.LEGACY_WC_AUTH] = options.authToken;
  }

  // Platform hint for gateway optimization
  if (options?.platform && options.platform !== "auto") {
    headers[HEADER_NAMES.PLATFORM_HINT] = options.platform;
  }

  // Cache control
  if (options?.forceNoCache) {
    headers[HEADER_NAMES.NO_CACHE] = "true";
  }

  if (options?.debug) {
    console.log("HEADKIT LEGACY CLIENT DEBUG", {
      hasGatewayAuth: !!headers[HEADER_NAMES.GATEWAY_AUTH],
      hasUserAuth: !!headers[HEADER_NAMES.USER_AUTH],
      hasLegacyAuth: !!headers[HEADER_NAMES.LEGACY_WC_AUTH],
      platform: options?.platform,
      headers: Object.keys(headers),
    });
  }

  const client = new GraphQLClient(
    process.env.NEXT_PUBLIC_HEADKIT_API_GRAPHQL_ENDPOINT || "",
    {
      headers,
      // Server Actions automatically handle cookies via Next.js cookies() function
      // No manual cookie handling needed here
      // next: {
      //   revalidate: options?.revalidateTime,
      //   tags: options?.revalidateTags,
      // },
    }
  );

  return getSdk(client);
};

// Cookie-aware client that works exactly like headkit() but automatically handles cookies
// This is now the DEFAULT headkit client with automatic cookie management
// export const headkit = async (options?: Parameters<typeof headkitLegacy>[0] & {
//   // New option to skip cookie reading for static generation
//   skipCookies?: boolean;
// }) => {
//   const headers: Record<string, string> = {
//     [HEADER_NAMES.GATEWAY_AUTH]: `Bearer ${process.env.HEADKIT_API_TOKEN}`,
//   };

//   if (options?.userAuthToken) {
//     headers[HEADER_NAMES.USER_AUTH] = options.userAuthToken;
//   } else if (options?.authToken) {
//     headers[HEADER_NAMES.LEGACY_WC_AUTH] = options.authToken;
//   }

//   if (options?.platform && options.platform !== "auto") {
//     headers[HEADER_NAMES.PLATFORM_HINT] = options.platform;
//   }

//   if (options?.forceNoCache) {
//     headers[HEADER_NAMES.NO_CACHE] = "true";
//   }

//   // Read existing cookies from Next.js and include them in the request
//   // Only try to read cookies if we're in a request context and not skipping cookies
//   if (!options?.skipCookies) {
//     try {
//       const { cookies: cookiesHelper } = await import("next/headers");
//       const cookieStore = await cookiesHelper();

//       // Get all cookies and format them as a cookie header
//       const cookieHeader = cookieStore.getAll()
//         .map(cookie => `${cookie.name}=${cookie.value}`)
//         .join('; ');

//       if (cookieHeader) {
//         headers['Cookie'] = cookieHeader;
//         console.log("🍪 Sending cookies to gateway:", cookieHeader);
//       }
//     } catch (error) {
//       // This is expected during static generation or when cookies() is called outside request scope
//       if (process.env.NODE_ENV === 'development') {
//         console.warn("Could not read cookies (likely during static generation):", (error as Error).message || error);
//       }
//       // Continue without cookies - this is fine for static generation
//     }
//   }

//   if (options?.debug) {
//     console.log("HEADKIT WITH COOKIES DEBUG", {
//       hasGatewayAuth: !!headers[HEADER_NAMES.GATEWAY_AUTH],
//       hasUserAuth: !!headers[HEADER_NAMES.USER_AUTH],
//       hasLegacyAuth: !!headers[HEADER_NAMES.LEGACY_WC_AUTH],
//       platform: options?.platform,
//       headers: Object.keys(headers),
//       hasCookies: !!headers['Cookie'],
//       skipCookies: options?.skipCookies,
//     });
//   }

//   // Create a regular GraphQL client
//   const regularClient = new GraphQLClient(
//     process.env.NEXT_PUBLIC_HEADKIT_API_GRAPHQL_ENDPOINT || "",
//     {
//       headers,
//     }
//   );

//   // Create cookie-aware client
//   const cookieClient = new CookieAwareGraphQLClient(
//     process.env.NEXT_PUBLIC_HEADKIT_API_GRAPHQL_ENDPOINT || "",
//     { headers }
//   );

//   // Get the regular SDK
//   const regularSdk = getSdk(regularClient);

//   // Wrap each method to use the cookie-aware client
//   const cookieAwareSdk = {} as ReturnType<typeof getSdk>;

//   // Iterate through all methods of the regular SDK and wrap them
//   for (const [methodName, method] of Object.entries(regularSdk)) {
//     if (typeof method === 'function') {
//       (cookieAwareSdk as Record<string, unknown>)[methodName] = async (...args: unknown[]) => {
//         try {
//           // Get the GraphQL document and variables from the method call
//           // This is a bit hacky but works for our generated SDK
//           const result = await (method as (...args: unknown[]) => Promise<unknown>).apply({
//             request: cookieClient.request.bind(cookieClient)
//           }, args);
//           return result;
//         } catch (error) {
//           console.error(`Error in ${methodName}:`, error);
//           throw error;
//         }
//       };
//     }
//   }

//   return cookieAwareSdk;
// };

// Static-generation-safe client that doesn't attempt to read cookies
// export const headkitStatic = async (
//   options?: Parameters<typeof headkitLegacy>[0]
// ) => {
//   return headkit({ ...options, skipCookies: true });
// };

export const headkit = async (options?: {
  cookies?: Record<string, string>;
  userAuthToken?: string;
  // Standard options
  revalidateTime?: number;
  revalidateTags?: string[];
  debug?: boolean;
  forceNoCache?: boolean;
}) => {
  const headers: Record<string, string> = {
    [HEADER_NAMES.GATEWAY_AUTH]: `Bearer ${process.env.HEADKIT_API_TOKEN}`,
  };

  if (options?.userAuthToken) {
    headers[HEADER_NAMES.USER_AUTH] = options.userAuthToken;
  }

  if (options?.forceNoCache) {
    headers[HEADER_NAMES.NO_CACHE] = "true";
  }

  if (options?.debug) {
    console.log("HEADKIT WITH COOKIES DEBUG", {
      hasGatewayAuth: !!headers[HEADER_NAMES.GATEWAY_AUTH],
      hasUserAuth: !!headers[HEADER_NAMES.USER_AUTH],
      headers: Object.keys(headers),
      cookies: options?.cookies,
    });
  }

  if (options?.cookies) {
    headers['Cookie'] = Object.entries(options.cookies)
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
  }

  // Create a regular GraphQL client
  const regularClient = new GraphQLClient(
    process.env.NEXT_PUBLIC_HEADKIT_API_GRAPHQL_ENDPOINT || "",
    {
      headers,
    }
  );

  return getSdk(regularClient);
};

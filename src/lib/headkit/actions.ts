"use server";

import { headkit } from "./client";
import {
  ActionWishlistInput,
  AddToCartInput,
  CheckoutInput,
  GetBrandsQueryVariables,
  GetCustomerQueryVariables,
  GetPostCategoriesQueryVariables,
  GetPostsQueryVariables,
  GetProductFiltersQueryVariables,
  GetProductListQueryVariables,
  Order,
  PageIdType,
  ProductCategoryIdType,
  RemoveItemsFromCartInput,
  SubmitGfFormInput,
  UpdateCustomerInput,
  UpdateItemQuantitiesInput,
} from "./generated";
import { v7 as uuidv7 } from "uuid";
import { getWoocommerceAuthToken } from "./actions/auth";
import { cookies } from "next/headers";

// Type for response with headers that might have getSetCookie
interface ResponseWithHeaders {
  headers?: {
    getSetCookie?: () => string[];
  };
}

// Helper function for actions that need cookie handling (user-specific, stateful)
const withCookieHandling = async <T>(
  operation: (client: Awaited<ReturnType<typeof headkit>>) => Promise<T>,
  options?: {
    debug?: boolean;
    forceNoCache?: boolean;
    revalidateTime?: number;
    revalidateTags?: string[];
  }
): Promise<T> => {
  const cookieStore = await cookies();
  const client = await headkit({
    cookies: Object.fromEntries(cookieStore.getAll().map((cookie) => [cookie.name, cookie.value])),
    debug: options?.debug,
    forceNoCache: options?.forceNoCache,
    revalidateTime: options?.revalidateTime,
    revalidateTags: options?.revalidateTags,
  });

  const response = await operation(client);
  
  // Handle setting cookies from response if present
  if (response && typeof response === 'object' && 'headers' in response) {
    const responseWithHeaders = response as ResponseWithHeaders;
    if (responseWithHeaders.headers?.getSetCookie) {
      const setCookieHeader = responseWithHeaders.headers.getSetCookie();
      if (setCookieHeader) {
        for (const cookie of setCookieHeader) {
          const [name, value] = cookie.split("=");
          cookieStore.set(name, value);
        }
      }
    }
  }

  return response;
};

// Helper function for actions that don't need cookies (public/static content)
const withoutCookies = async <T>(
  operation: (client: Awaited<ReturnType<typeof headkit>>) => Promise<T>,
  options?: {
    debug?: boolean;
    forceNoCache?: boolean;
    revalidateTime?: number;
    revalidateTags?: string[];
  }
): Promise<T> => {
  const client = await headkit({
    debug: options?.debug,
    forceNoCache: options?.forceNoCache,
    revalidateTime: options?.revalidateTime,
    revalidateTags: options?.revalidateTags,
  });

  return operation(client);
};

// =============================================================================
// COOKIE-DEPENDENT ACTIONS (User-specific, stateful)
// =============================================================================

// Cart Actions
const getCart = async () => {
  return withCookieHandling(
    async (client) => {
      const response = await client.getCart();
      console.log(
        "getCart response with cookies:",
        JSON.stringify(response, null, 2)
      );
      return response;
    },
    { debug: true, forceNoCache: true }
  );
};

const addToCart = async ({ input }: { input: AddToCartInput }) => {
  return withCookieHandling(
    async (client) => {
      const response = await client.addToCart({ input });
      console.log(
        "addToCart response with cookies:",
        JSON.stringify(response, null, 2)
      );
      return response;
    },
    { debug: true, forceNoCache: true }
  );
};

const removeCartItem = async ({
  cartInput,
}: {
  cartInput: RemoveItemsFromCartInput;
}) => {
  return withCookieHandling(async (client) => {
    return client.removeItemsFromCart({ cartInput });
  });
};

const applyCoupon = async ({ code }: { code: string }) => {
  return withCookieHandling(async (client) => {
    return client.applyCoupon({ code });
  });
};

const removeCoupons = async ({ code }: { code: string }) => {
  return withCookieHandling(async (client) => {
    return client.removeCoupons({ code });
  });
};

const emptyCart = async () => {
  return withCookieHandling(async (client) => {
    return client.emptyCart({ input: {} });
  });
};

const updateShippingMethod = async ({
  shippingMethod,
}: {
  shippingMethod: string;
}) => {
  return withCookieHandling(async (client) => {
    return client.updateShippingMethod({ shippingMethod });
  });
};

const updateItemQuantities = async ({
  input,
}: {
  input: UpdateItemQuantitiesInput;
}) => {
  return withCookieHandling(async (client) => {
    return client.updateItemQuantities({ input });
  });
};

const updateCartItemQuantity = async ({
  input,
}: {
  input: UpdateItemQuantitiesInput;
}) => {
  return withCookieHandling(async (client) => {
    return client.updateItemQuantities({ input });
  });
};

// Customer/Auth Actions
const getCustomer = async (variables: GetCustomerQueryVariables) => {
  return withCookieHandling(async (client) => {
    return client.getCustomer(variables);
  });
};

const updateCustomer = async ({
  input,
  withCustomer = true,
  withCart = false,
}: {
  input: UpdateCustomerInput;
  withCustomer?: boolean;
  withCart?: boolean;
}) => {
  return withCookieHandling(async (client) => {
    return client.updateCustomer({
      input,
      withCustomer,
      withCart,
    });
  });
};

const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  return withCookieHandling(async (client) => {
    return client.login({
      input: {
        clientMutationId: uuidv7(),
        username: email,
        password,
      },
    });
  });
};

const registerUser = async ({
  firstName,
  lastName,
  email,
  password,
}: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) => {
  return withCookieHandling(async (client) => {
    return client.registerUser({
      input: {
        clientMutationId: uuidv7(),
        username: email,
        email,
        password,
        firstName,
        lastName,
        nicename: `${firstName} ${lastName}`,
      },
    });
  });
};

const sendPasswordResetEmail = async ({ email }: { email: string }) => {
  return withCookieHandling(async (client) => {
    return client.sendPasswordResetEmail({
      input: {
        clientMutationId: uuidv7(),
        username: email,
      },
    });
  });
};

const resetUserPassword = async ({
  input,
}: {
  input: { key: string; login: string; password: string };
}) => {
  return withCookieHandling(async (client) => {
    return client.resetUserPassword({
      input: {
        clientMutationId: uuidv7(),
        ...input,
      },
    });
  });
};

// Order Actions
const getOrders = async () => {
  return withCookieHandling(async (client) => {
    return client.getOrders({ first: 20 });
  });
};

const getOrder = async ({ id }: { id: string }) => {
  // Guest user - try to get order through customer query
  const guestOrder = await getGuestOrder({ orderId: id });
  
  return {
    data: {
      order: guestOrder.data?.customer?.orders?.nodes?.[0] as Order | undefined,
    },
  };
};

const getGuestOrder = async ({ orderId }: { orderId: string }) => {
  return withCookieHandling(async (client) => {
    const response = await client.getCustomer({
      withAddress: true,
      withOrders: true,
    });

    const order = response.data?.customer?.orders?.nodes?.find(
      (order) => order?.databaseId === Number(orderId)
    );

    return {
      data: {
        customer: {
          ...response.data?.customer,
          orders: {
            nodes: order ? [order] : [],
          },
        },
      },
    };
  });
};

// Payment Actions
const checkout = async ({ input }: { input: CheckoutInput }) => {
  return withCookieHandling(async (client) => {
    return client.checkout({ input });
  });
};

const getPaymentGateways = async () => {
  return withCookieHandling(async (client) => {
    return client.getPaymentGateways();
  });
};

const createPaymentIntent = async ({
  amount,
  currency,
}: {
  amount: number;
  currency: string;
}) => {
  return withCookieHandling(async (client) => {
    return client.createPaymentIntent({
      input: { amount, currency },
    });
  });
};

const getAvailablePaymentMethods = async () => {
  return withCookieHandling(async (client) => {
    return client.getAvailablePaymentMethods();
  });
};

// Form Actions (that modify state)
const submitGravityForm = async ({ input }: { input: SubmitGfFormInput }) => {
  return withCookieHandling(async (client) => {
    return client.submitGravityForm({ input });
  });
};

// Wishlist Actions
const actionWishlist = async ({ input }: { input: ActionWishlistInput }) => {
  return withCookieHandling(
    async (client) => {
      return client.actionWishlist({ input });
    },
    { forceNoCache: true }
  );
};

// =============================================================================
// NON-COOKIE ACTIONS (Public/static content)
// =============================================================================

// Product Actions
const getProductList = async ({
  input,
}: {
  input: GetProductListQueryVariables;
}) => {
  return withoutCookies(async (client) => {
    return client.getProductList(input);
  });
};

const getProductFilters = async ({
  input,
}: {
  input: GetProductFiltersQueryVariables;
}) => {
  return withoutCookies(async (client) => {
    return client.getProductFilters(input);
  });
};

const getProductCategory = async ({
  id,
  type,
}: {
  id: string;
  type?: ProductCategoryIdType;
}) => {
  return withoutCookies(async (client) => {
    return client.getProductCategory({ id, type });
  });
};

// NEW: Product Actions
const getProduct = async ({
  id,
  type,
}: {
  id: string;
  type?: import("./generated").ProductIdTypeEnum;
}) => {
  return withoutCookies(async (client) => {
    return client.getProduct({ id, type });
  });
};

const getProducts = async ({
  first,
  where,
}: {
  first?: number;
  where?: Record<string, unknown>;
}) => {
  return withoutCookies(async (client) => {
    return client.getProducts({ first, where });
  });
};

const getProductCategories = async ({
  where,
}: {
  where?: Record<string, unknown>;
} = {}) => {
  return withoutCookies(async (client) => {
    return client.getProductCategories({ where });
  });
};

const getProductSlugs = async ({
  after,
  first = 100,
}: {
  after?: string | null;
  first?: number;
} = {}) => {
  return withoutCookies(async (client) => {
    return client.getProducts({ 
      first, 
      after,
      where: {} 
    });
  });
};

// NEW: Carousel Actions
const getCarousel = async ({
  where,
}: {
  where?: Record<string, unknown>;
} = {}) => {
  return withoutCookies(async (client) => {
    return client.getCarousel({ where });
  });
};

// Store Settings Actions
const getStoreSettings = async () => {
  return withoutCookies(async (client) => {
    return client.getStoreSettings();
  });
};

const getStripeConfig = async () => {
  return withoutCookies(async (client) => {
    return client.getStripeConfig();
  });
};

const getPickupLocations = async () => {
  return withoutCookies(async (client) => {
    return client.getPickupLocations();
  });
};

// NEW: General Settings Actions
const getGeneralSettings = async () => {
  return withoutCookies(async (client) => {
    return client.getGeneralSettings();
  });
};

// Content Actions
export async function getMenu() {
  return withoutCookies(async (client) => {
    return client.getMenu();
  });
}

export async function getBranding() {
  return withoutCookies(
    async (client) => {
      return client.getBranding();
    },
    {
      revalidateTime: 86400,
      revalidateTags: ["headkit:branding"],
    }
  );
}

export async function getSEOSettings() {
  const client = await headkit();
  return client.getSEOSettings();
}

export async function getPage({ id, type }: { id: string; type: PageIdType }) {
  return withoutCookies(async (client) => {
    return client.getPage({ id, type });
  });
}

// Form Actions (read-only)
const getGravityFormById = async ({ id }: { id: string }) => {
  return withoutCookies(async (client) => {
    return client.getGravityFormById({ id });
  });
};

// Post Actions
export async function getPostFilters({
  input,
}: {
  input: GetPostCategoriesQueryVariables;
}) {
  return withoutCookies(async (client) => {
    return client.getPostCategories(input);
  });
}

export async function getPostList({
  input,
}: {
  input: GetPostsQueryVariables;
}) {
  return withoutCookies(async (client) => {
    return client.getPosts(input);
  });
}

// NEW: Post Actions
const getPost = async ({
  id,
  type,
}: {
  id: string;
  type?: import("./generated").PostIdType;
}) => {
  return withoutCookies(async (client) => {
    return client.getPost({ id, type });
  });
};

const getPosts = async ({
  first,
  last,
  where,
}: {
  first?: number;
  last?: number;
  where?: Record<string, unknown>;
} = {}) => {
  return withoutCookies(async (client) => {
    return client.getPosts({ first, last, where });
  });
};

// NEW: FAQ Actions
const getFAQs = async ({
  where,
}: {
  where?: Record<string, unknown>;
} = {}) => {
  return withoutCookies(async (client) => {
    return client.getFAQs({ where });
  });
};

// Brand Actions
export async function getBrandList({
  input,
}: {
  input: GetBrandsQueryVariables;
}) {
  return withoutCookies(async (client) => {
    return client.getBrands(input);
  });
}

export async function getBrand({ slug }: { slug: string }) {
  return withoutCookies(async (client) => {
    return client.getBrand({ slug });
  });
}

// =============================================================================
// STATIC-SAFE VERSIONS (for build/static generation)
// =============================================================================

const getCartStatic = async () => {
  // Return null during static generation - cart is user-specific
  return { data: { cart: null } };
};

const getMenuStatic = async () => {
  return withoutCookies(async (client) => {
    return client.getMenu();
  });
};

const getBrandingStatic = async () => {
  return withoutCookies(async (client) => {
    return client.getBranding();
  });
};

const getStoreSettingsStatic = async () => {
  return withoutCookies(async (client) => {
    return client.getStoreSettings();
  });
};

const getStripeConfigStatic = async () => {
  return withoutCookies(async (client) => {
    return client.getStripeConfig();
  });
};

const getGeneralSettingsStatic = async () => {
  return withoutCookies(async (client) => {
    return client.getGeneralSettings();
  });
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const updateCartItemMeta = async (order: Record<string, unknown>) => {
  return Promise.resolve(order);
};

// =============================================================================
// EXPORTS
// =============================================================================

// Cookie-dependent exports (user-specific, stateful)
export {
  // Cart
  getCart,
  addToCart,
  removeCartItem,
  applyCoupon,
  removeCoupons,
  emptyCart,
  updateShippingMethod,
  updateItemQuantities,
  updateCartItemQuantity,
  
  // Customer/Auth
  getCustomer,
  updateCustomer,
  login,
  registerUser,
  sendPasswordResetEmail,
  resetUserPassword,
  
  // Orders
  getOrders,
  getOrder,
  getGuestOrder,
  
  // Payment
  checkout,
  getPaymentGateways,
  createPaymentIntent,
  getAvailablePaymentMethods,
  
  // Forms (state-changing)
  submitGravityForm,
  
  // Wishlist
  actionWishlist,
  
  // Legacy/Utils
  getWoocommerceAuthToken,
  updateCartItemMeta,
};

// Non-cookie exports (public/static content)
export {
  // Products
  getProductList,
  getProductFilters,
  getProductCategory,
  getProduct,
  getProducts,
  getProductCategories,
  getProductSlugs,
  getCarousel,
  
  // Store Settings
  getStoreSettings,
  getStripeConfig,
  getPickupLocations,
  getGeneralSettings,
  
  // Forms (read-only)
  getGravityFormById,
  
  // Posts
  getPost,
  getPosts,
  getFAQs,
  
  // Static-safe versions
  getMenuStatic,
  getBrandingStatic,
  getStoreSettingsStatic,
  getStripeConfigStatic,
  getCartStatic,
  getGeneralSettingsStatic,
};

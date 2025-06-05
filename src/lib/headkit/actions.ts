"use server";

import { headkit } from "./client";
import { headkitStatic } from "./client";
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
  PageIdType,
  ProductCategoryIdType,
  RemoveItemsFromCartInput,
  SubmitGfFormInput,
  UpdateCustomerInput,
  UpdateItemQuantitiesInput,
} from "./generated";
import { v7 as uuidv7 } from "uuid";
import { getWoocommerceAuthToken } from "./actions/auth";

// Simplified client config - no cookie management needed
const getClientConfig = async () => {
  const config: {
    userAuthToken?: string; // New unified auth
    platform?: "woocommerce" | "shopify" | "stripe" | "auto";
    debug?: boolean;
    forceNoCache?: boolean;
  } = {};

  // Get user auth token (platform-agnostic)
  const userAuthToken = await getWoocommerceAuthToken();
  if (userAuthToken) {
    config.userAuthToken = userAuthToken;
    config.platform = "woocommerce"; // Could be auto-detected by gateway
  }

  return config;
};

// Simple actions - now with automatic cookie handling via the new headkit()
const getCart = async () => {
  const config = await getClientConfig();
  const client = await headkit({
    ...config,
    debug: true,
    forceNoCache: true, // Cart is always fresh
  });
  
  const response = await client.getCart();
  console.log("getCart response with cookies:", JSON.stringify(response, null, 2));
  return response;
};

const addToCart = async ({ input }: { input: AddToCartInput }) => {
  const config = await getClientConfig();
  const client = await headkit({
    ...config,
    debug: true,
    forceNoCache: true,
  });
  
  const response = await client.addToCart({ input });
  console.log("addToCart response with cookies:", JSON.stringify(response, null, 2));
  return response;
};

const removeCartItem = async ({ cartInput }: { cartInput: RemoveItemsFromCartInput }) => {
  const config = await getClientConfig();
  const client = await headkit(config);
  const response = await client.removeItemsFromCart({ cartInput });
  return response;
};

const applyCoupon = async ({ code }: { code: string }) => {
  const config = await getClientConfig();
  const client = await headkit(config);
  const response = await client.applyCoupon({ code });
  return response;
};

const removeCoupons = async ({ code }: { code: string }) => {
  const config = await getClientConfig();
  const client = await headkit(config);
  const response = await client.removeCoupons({ code });
  return response;
};

const checkout = async ({ input }: { input: CheckoutInput }) => {
  const config = await getClientConfig();
  const client = await headkit(config);
  const response = await client.checkout({ input });
  return response;
};

const getCustomer = async (variables: GetCustomerQueryVariables) => {
  const config = await getClientConfig();
  const client = await headkit(config);
  const response = await client.getCustomer(variables);
  return response;
};

const emptyCart = async () => {
  const config = await getClientConfig();
  const client = await headkit(config);
  const response = await client.emptyCart({ input: {} });
  return response;
};

const updateShippingMethod = async ({ shippingMethod }: { shippingMethod: string }) => {
  const config = await getClientConfig();
  const client = await headkit(config);
  const response = await client.updateShippingMethod({ shippingMethod });
  return response;
};

const getPaymentGateways = async () => {
  const client = await headkit();
  const response = await client.getPaymentGateways();
  return response;
};

const createPaymentIntent = async ({ amount, currency }: { amount: number; currency: string }) => {
  const config = await getClientConfig();
  const client = await headkit(config);
  const response = await client.createPaymentIntent({
    input: { amount, currency },
  });
  return response;
};

const updateCustomer = async ({ input, withCustomer = true, withCart = false }: {
  input: UpdateCustomerInput;
  withCustomer?: boolean;
  withCart?: boolean;
}) => {
  const config = await getClientConfig();
  const client = await headkit(config);
  const response = await client.updateCustomer({
    input,
    withCustomer,
    withCart,
  });
  return response;
};

const getGravityFormById = async ({ id }: { id: string }) => {
  const client = await headkit();
  const response = await client.getGravityFormById({ id });
  return response;
};

const submitGravityForm = async ({ input }: { input: SubmitGfFormInput }) => {
  const client = await headkit();
  const response = await client.submitGravityForm({ input });
  return response;
};

const sendPasswordResetEmail = async ({ email }: { email: string }) => {
  const client = await headkit();
  const response = await client.sendPasswordResetEmail({
    input: {
      clientMutationId: uuidv7(),
      username: email,
    },
  });
  return response;
};

const resetUserPassword = async ({ input }: {
  input: { key: string; login: string; password: string };
}) => {
  const client = await headkit();
  const response = await client.resetUserPassword({
    input: {
      clientMutationId: uuidv7(),
      ...input,
    },
  });
  return response;
};

const login = async ({ email, password }: { email: string; password: string }) => {
  const client = await headkit();
  const response = await client.login({
    input: {
      clientMutationId: uuidv7(),
      username: email,
      password,
    },
  });
  return response;
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
  const client = await headkit();
  const response = await client.registerUser({
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
  return response;
};

const updateItemQuantities = async ({ input }: { input: UpdateItemQuantitiesInput }) => {
  const config = await getClientConfig();
  const client = await headkit(config);
  const response = await client.updateItemQuantities({ input });
  return response;
};

const getAvailablePaymentMethods = async () => {
  const config = await getClientConfig();
  const client = await headkit(config);
  const response = await client.getAvailablePaymentMethods();
  return response;
};

const getOrder = async ({ id }: { id: string }) => {
  const config = await getClientConfig();

  if (config.userAuthToken) {
    // Logged in user - use getOrder
    const client = await headkit(config);
    const order = await client.getOrder({ orderId: id });
    return {
      data: {
        order: order.data?.order,
      },
    };
  }

  // Guest user - try to get order through customer query
  const guestOrder = await getGuestOrder({ orderId: id });
  return {
    data: {
      order: guestOrder.data?.customer?.orders?.nodes?.[0],
    },
  };
};

const getProductList = async ({ input }: { input: GetProductListQueryVariables }) => {
  const client = await headkit();
  const response = await client.getProductList(input);
  return response;
};

const getProductFilters = async ({ input }: { input: GetProductFiltersQueryVariables }) => {
  const client = await headkit();
  const response = await client.getProductFilters(input);
  return response;
};

const getStripeConfig = async () => {
  const client = await headkit();
  const response = await client.getStripeConfig();
  return response;
};

const getStoreSettings = async () => {
  const client = await headkit();
  const response = await client.getStoreSettings();
  return response;
};

const getPickupLocations = async () => {
  const client = await headkit();
  const response = await client.getPickupLocations();
  return response;
};

const updateCartItemQuantity = async ({ input }: { input: UpdateItemQuantitiesInput }) => {
  const config = await getClientConfig();
  const client = await headkit(config);
  const response = await client.updateItemQuantities({ input });
  return response;
};

const getProductCategory = async ({ id, type }: { id: string; type?: ProductCategoryIdType }) => {
  const client = await headkit();
  const response = await client.getProductCategory({ id, type });
  return response;
};

const getOrders = async () => {
  const config = await getClientConfig();
  const client = await headkit(config);
  const response = await client.getOrders({ first: 20 });
  return response;
};

const getGuestOrder = async ({ orderId }: { orderId: string }) => {
  const config = await getClientConfig();
  const client = await headkit(config);
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
};

const updateCartItemMeta = async (order: Record<string, unknown>) => {
  return Promise.resolve(order);
};

const actionWishlist = async ({ input }: { input: ActionWishlistInput }) => {
  const config = await getClientConfig();
  const client = await headkit({
    ...config,
    forceNoCache: true,
  });
  const response = await client.actionWishlist({ input });
  return response;
};

// Post Actions
export async function getPostFilters({ input }: { input: GetPostCategoriesQueryVariables }) {
  const client = await headkit();
  const response = await client.getPostCategories(input);
  return response;
}

export async function getPostList({ input }: { input: GetPostsQueryVariables }) {
  const client = await headkit();
  const response = await client.getPosts(input);
  return response;
}

// Brand Actions
export async function getBrandList({ input }: { input: GetBrandsQueryVariables }) {
  const client = await headkit();
  const response = await client.getBrands(input);
  return response;
}

export async function getBrand({ slug }: { slug: string }) {
  const client = await headkit();
  const response = await client.getBrand({ slug });
  return response;
}

export async function getBranding() {
  const client = await headkit({
    revalidateTime: 86400,
    revalidateTags: ["headkit:branding"],
  });
  const response = await client.getBranding();
  return response;
}

export async function getSEOSettings() {
  const client = await headkit();
  const response = await client.getSEOSettings();
  return response;
}

export async function getPage({ id, type }: { id: string; type: PageIdType }) {
  const client = await headkit();
  const response = await client.getPage({ id, type });
  return response;
}

export async function getMenu() {
  const client = await headkit();
  const response = await client.getMenu();
  return response;
}

// Static-safe versions for use during build/static generation
const getCartStatic = async () => {
  // Return null during static generation - cart is user-specific
  return { data: { cart: null } };
};

const getMenuStatic = async () => {
  const client = await headkitStatic();
  const response = await client.getMenu();
  return response;
};

const getBrandingStatic = async () => {
  const client = await headkitStatic();
  const response = await client.getBranding();
  return response;
};

const getStoreSettingsStatic = async () => {
  const client = await headkitStatic();
  const response = await client.getStoreSettings();
  return response;
};

const getStripeConfigStatic = async () => {
  const client = await headkitStatic();
  const response = await client.getStripeConfig();
  return response;
};

export {
  getCustomer,
  updateCustomer,
  getCart,
  addToCart,
  removeCartItem,
  applyCoupon,
  removeCoupons,
  emptyCart,
  updateShippingMethod,
  getPaymentGateways,
  createPaymentIntent,
  checkout,
  getGravityFormById,
  submitGravityForm,
  sendPasswordResetEmail,
  resetUserPassword,
  login,
  registerUser,
  updateItemQuantities,
  getAvailablePaymentMethods,
  getOrder,
  getProductList,
  getProductFilters,
  getStripeConfig,
  getPickupLocations,
  updateCartItemQuantity,
  getProductCategory,
  getWoocommerceAuthToken,
  getOrders,
  getGuestOrder,
  updateCartItemMeta,
  actionWishlist,
  getStoreSettings,
  // Static-safe versions
  getMenuStatic,
  getBrandingStatic, 
  getStoreSettingsStatic,
  getStripeConfigStatic,
  getCartStatic,
};

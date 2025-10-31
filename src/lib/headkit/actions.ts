"use server";

import { headkit } from "./client";
import {
  ActionWishlistInput,
  AddToCartInput,
  CheckoutInput,
  RebuildCartFromKlaviyoInput,
  RemoveItemsFromCartInput,
  SubmitGfFormInput,
  UpdateCustomerInput,
  UpdateItemQuantitiesInput,
  UpdatePaymentIntentInput,
} from "./generated";
import { cookies } from "next/headers";
import { v7 as uuidv7 } from "uuid";
import { getWoocommerceAuthToken } from "./actions/auth";
import { COOKIE_NAMES } from "./constants";
import {
  parseCookies,
  getSessionKeyFromCookies,
  encodeSessionCookie,
} from "./utils/cookies";

/**
 * Server Actions - Mutations Only
 * 
 * This file contains ONLY write operations (mutations).
 * All read operations have been moved to:
 * - queries.ts (cached reads)
 * - queries-dynamic.ts (uncached/fresh reads)
 */

const getClientConfig = async (singleCheckout?: boolean) => {
  const config: {
    authToken?: string;
    woocommerceSession?: string;
    mailchimpUserEmail?: string;
    mailchimpUserPreviousEmail?: string;
  } = {};

  const authToken = await getWoocommerceAuthToken();
  if (authToken) {
    config.authToken = authToken;
  }

  if (singleCheckout) {
    const singleCheckoutToken = (await cookies()).get(
      COOKIE_NAMES.SINGLE_CHECKOUT
    )?.value;
    if (singleCheckoutToken) {
      config.woocommerceSession = singleCheckoutToken;
    }
  } else {
    const sessionToken = (await cookies()).get(COOKIE_NAMES.SESSION)?.value;
    if (sessionToken) {
      config.woocommerceSession = sessionToken;
    }
  }

  const mailchimpUserEmail = (await cookies()).get(
    "mailchimp_user_email"
  )?.value;
  if (mailchimpUserEmail) {
    config.mailchimpUserEmail = mailchimpUserEmail;
  }

  const mailchimpUserPreviousEmail = (await cookies()).get(
    "mailchimp_user_previous_email"
  )?.value;
  if (mailchimpUserPreviousEmail) {
    config.mailchimpUserPreviousEmail = mailchimpUserPreviousEmail;
  }

  return config;
};

const handleSessionResponse = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any,
  singleCheckout?: boolean
) => {
  const setCookieHeader = response.headers.get("set-cookie");
  if (!setCookieHeader) {
    return;
  }

  const cookiesObj = parseCookies(setCookieHeader);
  const cookieStore = await cookies();

  const sessionKey = getSessionKeyFromCookies(cookiesObj);

  if (sessionKey) {
    const sessionValue = cookiesObj[sessionKey];
    const encodedSession = encodeSessionCookie(sessionKey, sessionValue);

    if (singleCheckout) {
      cookieStore.set(COOKIE_NAMES.SINGLE_CHECKOUT, encodedSession);
    } else {
      cookieStore.set(COOKIE_NAMES.SESSION, encodedSession);
    }
  }

  Object.entries(cookiesObj).forEach(([name, value]) => {
    if (!name.startsWith("wp_woocommerce_session_")) {
      cookieStore.set(name, value);
    }
  });
};

// ============================================
// CART MUTATIONS
// ============================================

const addToCart = async ({
  input,
  singleCheckout,
}: {
  input: AddToCartInput;
  singleCheckout?: boolean;
}) => {
  const config = await getClientConfig(singleCheckout);

  const response = await headkit(config).addToCart({ input });
  await handleSessionResponse(response, singleCheckout);
  return response;
};

const removeCartItem = async ({
  cartInput,
}: {
  cartInput: RemoveItemsFromCartInput;
}) => {
  const response = await headkit(await getClientConfig()).removeItemsFromCart({
    cartInput,
  });
  await handleSessionResponse(response);
  return response;
};

const applyCoupon = async ({ code }: { code: string }) => {
  const response = await headkit(await getClientConfig()).applyCoupon({ code });
  await handleSessionResponse(response);
  return response;
};

const removeCoupons = async ({ code }: { code: string }) => {
  const response = await headkit(await getClientConfig()).removeCoupons({
    code,
  });
  await handleSessionResponse(response);
  return response;
};

const applyGiftCard = async ({ code }: { code: string }) => {
  const response = await headkit(await getClientConfig()).applyGiftCardToCart({
    code,
  });
  await handleSessionResponse(response);
  return response;
};

const removeGiftCard = async ({ id }: { id: string }) => {
  const response = await headkit(await getClientConfig()).removeGiftCard({
    id,
  });
  await handleSessionResponse(response);
  return response;
};

const emptyCart = async () => {
  const response = await headkit(await getClientConfig()).emptyCart({
    input: {},
  });

  return response;
};

const updateShippingMethod = async ({
  shippingMethod,
  singleCheckout,
}: {
  shippingMethod: string;
  singleCheckout?: boolean;
}) => {
  const response = await headkit(
    await getClientConfig(singleCheckout)
  ).updateShippingMethod({
    shippingMethod,
  });
  await handleSessionResponse(response, singleCheckout);
  return response;
};

const updateItemQuantities = async ({
  input,
}: {
  input: UpdateItemQuantitiesInput;
}) => {
  const response = await headkit(await getClientConfig()).updateItemQuantities({
    input,
  });
  await handleSessionResponse(response);
  return response;
};

const rebuildCartFromKlaviyo = async ({
  input,
}: {
  input: RebuildCartFromKlaviyoInput;
}) => {
  const response = await headkit(await getClientConfig()).rebuildCartFromKlaviyo({
    input,
  });
  
  await handleSessionResponse(response);
  return response;
};

const updateCartItem = async ({
  input,
}: {
  input: UpdateItemQuantitiesInput;
}) => {
  const response = await headkit(await getClientConfig()).updateItemQuantities({
    input,
  });

  return response;
};

// ============================================
// CHECKOUT MUTATIONS
// ============================================

const checkout = async ({
  input,
  singleCheckout,
}: {
  input: CheckoutInput;
  singleCheckout?: boolean;
}) => {
  const response = await headkit(
    await getClientConfig(singleCheckout)
  ).checkout({ input });

  if (
    response.data?.checkout &&
    response.data?.checkout?.result === "success"
  ) {
    await handleSessionResponse(response, singleCheckout);
  }
  return response;
};

const createPaymentIntent = async ({
  amount,
  currency,
}: {
  amount: number;
  currency: string;
}) => {
  const response = await headkit(await getClientConfig()).createPaymentIntent({
    input: {
      amount,
      currency,
    },
  });
  return response;
};

const updatePaymentIntent = async ({
  input,
}: {
  input: UpdatePaymentIntentInput;
}) => {
  const response = await headkit(await getClientConfig()).updatePaymentIntent({
    input,
  });
  return response;
};

// ============================================
// CUSTOMER MUTATIONS
// ============================================

const updateCustomer = async ({
  input,
  withCustomer = true,
  withCart = false,
  singleCheckout = false,
}: {
  input: UpdateCustomerInput;
  withCustomer?: boolean;
  withCart?: boolean;
  singleCheckout?: boolean;
}) => {
  const config = await getClientConfig(singleCheckout);
  const response = await headkit(config).updateCustomer({
    input,
    withCustomer,
    withCart,
  });
  await handleSessionResponse(response, singleCheckout);
  return response;
};

// ============================================
// AUTH MUTATIONS
// ============================================

const sendPasswordResetEmail = async ({ email }: { email: string }) => {
  const response = await headkit().sendPasswordResetEmail({
    input: {
      clientMutationId: uuidv7(),
      username: email,
    },
  });
  return response;
};

const resetUserPassword = async ({
  input,
}: {
  input: { key: string; login: string; password: string };
}) => {
  const response = await headkit().resetUserPassword({
    input: {
      clientMutationId: uuidv7(),
      ...input,
    },
  });
  return response;
};

const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const response = await headkit().login({
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
  const response = await headkit().registerUser({
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

// ============================================
// FORM MUTATIONS
// ============================================

const submitGravityForm = async ({ input }: { input: SubmitGfFormInput }) => {
  const response = await headkit().submitGravityForm({ input });
  return response;
};

// ============================================
// WISHLIST MUTATIONS
// ============================================

const actionWishlist = async ({ input }: { input: ActionWishlistInput }) => {
  const response = await headkit(await getClientConfig()).actionWishlist({
    input,
  });
  return response;
};

// ============================================
// EXPORTS - Mutations Only
// ============================================

export {
  // Cart mutations
  addToCart,
  removeCartItem,
  applyCoupon,
  removeCoupons,
  applyGiftCard,
  removeGiftCard,
  emptyCart,
  updateShippingMethod,
  updateItemQuantities,
  updateCartItem,
  rebuildCartFromKlaviyo,
  
  // Checkout mutations
  checkout,
  createPaymentIntent,
  updatePaymentIntent,
  
  // Customer mutations
  updateCustomer,
  
  // Auth mutations
  sendPasswordResetEmail,
  resetUserPassword,
  login,
  registerUser,
  
  // Form mutations
  submitGravityForm,
  
  // Wishlist mutations
  actionWishlist,
  
  // Auth helpers (for queries-dynamic.ts)
  getWoocommerceAuthToken,
};

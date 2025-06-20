"use server";

import { headkit } from "./client";
import {
  ActionWishlistInput,
  AddToCartInput,
  CheckoutInput,
  GetBrandsQueryVariables,
  GetCarouselQueryVariables,
  GetCustomerQueryVariables,
  GetFaQsQueryVariables,
  GetGeneralSettingsQueryVariables,
  GetPostCategoriesQueryVariables,
  GetPostsQueryVariables,
  GetProductCategoriesQueryVariables,
  GetProductFiltersQueryVariables,
  GetProductListQueryVariables,
  GetProductsQueryVariables,
  GetProductSlugsQueryVariables,
  PageIdType,
  PostIdType,
  ProductCategoryIdType,
  ProductIdTypeEnum,
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

const getCart = async (singleCheckout?: boolean) => {
  const config = await getClientConfig(singleCheckout);

  const response = await headkit(config).getCart();
  await handleSessionResponse(response, singleCheckout);
  return response;
};

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
    console.log("checkout success");
    await handleSessionResponse(response, singleCheckout);
  }
  return response;
};

const getCustomer = async (variables: GetCustomerQueryVariables) => {
  const config = await getClientConfig();
  const response = await headkit(config).getCustomer(variables);

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

const getPaymentGateways = async () => {
  const response = await headkit().getPaymentGateways();
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

const getGravityFormById = async ({ id }: { id: string }) => {
  const response = await headkit().getGravityFormById({ id });
  return response;
};

const submitGravityForm = async ({ input }: { input: SubmitGfFormInput }) => {
  const response = await headkit().submitGravityForm({ input });
  return response;
};

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

const getAvailablePaymentMethods = async () => {
  const response = await headkit(
    await getClientConfig()
  ).getAvailablePaymentMethods();
  return response;
};

const getOrder = async ({ id }: { id: string }) => {
  const singleCheckoutToken = (await cookies()).get(
    COOKIE_NAMES.SINGLE_CHECKOUT
  )?.value;
  const config = await getClientConfig(!!singleCheckoutToken);

  if (config.authToken) {
    // Logged in user - use getOrder
    const order = await headkit(config).getOrder({ orderId: id });
    return {
      data: {
        order: order.data?.order,
      },
    };
  }

  // Guest user - try both session tokens
  const guestOrder = await getGuestOrder({
    orderId: id,
    sessionToken: singleCheckoutToken || config.woocommerceSession,
  });

  return {
    data: {
      order: guestOrder.data?.customer?.orders?.nodes?.[0],
    },
  };
};

const getProductList = async ({
  input,
}: {
  input: GetProductListQueryVariables;
}) => {
  const response = await headkit().getProductList(input);
  return response;
};

const getProductFilters = async (
  productFiltersQuery?: GetProductFiltersQueryVariables
) => {
  const response = await headkit().getProductFilters(productFiltersQuery);
  return response;
};

const getStripeConfig = async () => {
  const response = await headkit().getStripeConfig();
  return response;
};

const getStoreSettings = async () => {
  const response = await headkit().getStoreSettings();
  return response;
};

const getPickupLocations = async () => {
  const response = await headkit().getPickupLocations();
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

const getProductCategory = async ({ slug }: { slug: string }) => {
  const response = await headkit().getProductCategory({
    id: slug,
    type: ProductCategoryIdType.Slug,
  });
  return response;
};

const getOrders = async () => {
  const response = await headkit(await getClientConfig()).getOrders();
  return response;
};

// For guest users in checkout success
const getGuestOrder = async ({
  orderId,
  sessionToken,
}: {
  orderId: string;
  sessionToken?: string;
}) => {
  const config = sessionToken
    ? { woocommerceSession: sessionToken }
    : await getClientConfig();

  const response = await headkit(config).getCustomer({
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

const actionWishlist = async ({ input }: { input: ActionWishlistInput }) => {
  const response = await headkit(await getClientConfig()).actionWishlist({
    input,
  });
  return response;
};

// Post Actions
export async function getPostFilters({
  input,
}: {
  input: GetPostCategoriesQueryVariables;
}) {
  const response = await headkit().getPostCategories(input);
  return response;
}

export async function getPostList({
  input,
}: {
  input: GetPostsQueryVariables;
}) {
  const response = await headkit().getPosts(input);
  return response;
}

// Brand Actions
export async function getBrandList({
  input,
}: {
  input: GetBrandsQueryVariables;
}) {
  const response = await headkit().getBrands(input);
  return response;
}

export async function getBrand({ slug }: { slug: string }) {
  const response = await headkit().getBrand({ slug });
  return response;
}

export async function getBranding() {
  const response = await headkit({
    revalidateTime: 24 * 60 * 60,
    revalidateTags: ["headkit:branding"],
  }).getBranding();
  return response;
}

export async function getCarousel(
  variables?: GetCarouselQueryVariables
) {
  const response = await headkit().getCarousel(variables);
  return response;
}

export async function getProductCategories(
  variables?: GetProductCategoriesQueryVariables
) {
  const response = await headkit().getProductCategories(variables);
  return response;
}

export async function getSEOSettings() {
  const response = await headkit().getSEOSettings();
  return response;
}

export async function getPage({ id, type }: { id: string; type: PageIdType }) {
  const response = await headkit({
    revalidateTime: 24 * 60 * 60,
    revalidateTags: ["headkit:page", `headkit:page:${id}`],
  }).getPage({ id, type });
  return response;
}

// FAQ Actions
export async function getFAQs(variables?: GetFaQsQueryVariables) {
  const response = await headkit().getFAQs(variables);
  return response;
}

// Post Actions
export async function getPost({ id, type }: { id: string; type: PostIdType }) {
  const response = await headkit().getPost({ id, type });
  return response;
}

export async function getPosts(variables: GetPostsQueryVariables) {
  const response = await headkit().getPosts(variables);
  return response;
}

// Product Actions
export async function getProduct({ id, type }: { id: string; type: ProductIdTypeEnum }) {
  const response = await headkit().getProduct({ id, type });
  return response;
}

export async function getProducts(variables?: GetProductsQueryVariables) {
  const response = await headkit().getProducts(variables);
  return response;
}

export async function getProductSlugs(variables?: GetProductSlugsQueryVariables) {
  const response = await headkit().getProductSlugs(variables);
  return response;
}

// General Settings Actions
export async function getGeneralSettings(variables?: GetGeneralSettingsQueryVariables) {
  const response = await headkit().getGeneralSettings(variables);
  return response;
}

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
  updatePaymentIntent,
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
  updateCartItem,
  getProductCategory,
  getWoocommerceAuthToken,
  getOrders,
  getGuestOrder,
  actionWishlist,
  getStoreSettings,
};

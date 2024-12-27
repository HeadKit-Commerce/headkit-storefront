"use server";

import { headkit } from "./client";
import {
  AddToCartInput,
  CheckoutInput,
  GetCustomerQueryVariables,
  GetProductFiltersQueryVariables,
  GetProductListQueryVariables,
  ProductCategoryIdType,
  RemoveItemsFromCartInput,
  SubmitGfFormInput,
  UpdateCustomerInput,
  UpdateItemQuantitiesInput,
} from "./generated";
import { cookies } from "next/headers";
import { v7 as uuidv7 } from "uuid";
import {
  getWoocommerceSession,
  getWoocommerceAuthToken,
  shouldUpdateToken,
} from "./actions/auth";
import { COOKIE_NAMES } from "./constants";

const getClientConfig = async () => {
  const config: { authToken?: string; woocommerceSession?: string } = {};

  const authToken = await getWoocommerceAuthToken();
  if (authToken) {
    config.authToken = authToken;
  }

  const sessionToken = await getWoocommerceSession();
  if (sessionToken) {
    config.woocommerceSession = sessionToken;
  }

  return config;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleSessionResponse = async (response: any) => {
  const currentSession = await getWoocommerceSession();
  const newSession = response.headers.get(COOKIE_NAMES.SESSION);

  if (newSession) {
    if (!currentSession) {
      (await cookies()).set(COOKIE_NAMES.SESSION, newSession);
    } else if (await shouldUpdateToken(currentSession)) {
      (await cookies()).set(COOKIE_NAMES.SESSION, newSession);
    }
  }
};

const getCart = async () => {
  const response = await headkit(await getClientConfig()).getCart();
  await handleSessionResponse(response);
  return response;
};

const addToCart = async ({ input }: { input: AddToCartInput }) => {
  const response = await headkit(await getClientConfig()).addToCart({ input });
  await handleSessionResponse(response);
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

const checkout = async ({ input }: { input: CheckoutInput }) => {
  const response = await headkit(await getClientConfig()).checkout({ input });

  return response;
};

const getCustomer = async (variables: GetCustomerQueryVariables) => {
  const response = await headkit(await getClientConfig()).getCustomer(
    variables
  );

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
}: {
  shippingMethod: string;
}) => {
  const response = await headkit(await getClientConfig()).updateShippingMethod({
    shippingMethod,
  });
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

const updateCustomer = async ({
  input,
  withCustomer = true,
  withCart = false,
}: {
  input: UpdateCustomerInput;
  withCustomer?: boolean;
  withCart?: boolean;
}) => {
  const response = await headkit(await getClientConfig()).updateCustomer({
    input,
    withCustomer,
    withCart,
  });
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
  const config = await getClientConfig();

  if (config.authToken) {
    // Logged in user - use getOrder
    const order = await headkit(config).getOrder({ orderId: id });
    return {
      data: {
        order: order.data?.order,
      },
    };
  }

  // Guest user - use getCustomer with filter
  const order = await getGuestOrder({ orderId: id });
  return {
    data: {
      order: order.data?.customer?.orders?.nodes?.[0],
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
const getGuestOrder = async ({ orderId }: { orderId: string }) => {
  const response = await headkit(await getClientConfig()).getCustomer({
    withAddress: true,
    withOrders: true,
  });

  const order = response.data?.customer?.orders?.nodes?.find(
    (order) => order.databaseId === Number(orderId)
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
  updateCartItem,
  getProductCategory,
  getWoocommerceAuthToken,
  getOrders,
  getGuestOrder,
};

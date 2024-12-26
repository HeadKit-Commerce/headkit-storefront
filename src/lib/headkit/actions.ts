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

const getWoocommerceSession = async () => {
  return (await cookies()).get("woocommerce-session")?.value;
};

const getCart = async () => {
  const response = await headkit({
    woocommerceSession: await getWoocommerceSession(),
  }).getCart();

  return response;
};

const addToCart = async ({ input }: { input: AddToCartInput }) => {
  const response = await headkit({
    woocommerceSession: await getWoocommerceSession(),
  }).addToCart({ input });

  // set the session cookie
  const session = response.headers.get("woocommerce-session");
  if (session) {
    (await cookies()).set("woocommerce-session", session);
  }
  return response;
};

const updateCartItem = async ({
  input,
}: {
  input: UpdateItemQuantitiesInput;
}) => {
  const response = await headkit({
    woocommerceSession: await getWoocommerceSession(),
  }).updateItemQuantities({ input });

  return response;
};

const removeCartItem = async ({
  cartInput,
}: {
  cartInput: RemoveItemsFromCartInput;
}) => {
  const response = await headkit({
    woocommerceSession: await getWoocommerceSession(),
  }).removeItemsFromCart({ cartInput });

  return response;
};

const applyCoupon = async ({ code }: { code: string }) => {
  const response = await headkit({
    woocommerceSession: await getWoocommerceSession(),
  }).applyCoupon({ code });

  return response;
};

const removeCoupons = async ({ code }: { code: string }) => {
  const response = await headkit({
    woocommerceSession: await getWoocommerceSession(),
  }).removeCoupons({ code });

  return response;
};

const checkout = async ({ input }: { input: CheckoutInput }) => {
  const response = await headkit({
    woocommerceSession: await getWoocommerceSession(),
  }).checkout({ input });

  return response;
};

const getCustomer = async (variables: GetCustomerQueryVariables) => {
  const response = await headkit({
    woocommerceSession: await getWoocommerceSession(),
  }).getCustomer(variables);

  return response;
};

const emptyCart = async () => {
  const response = await headkit({
    woocommerceSession: await getWoocommerceSession(),
  }).emptyCart({ input: {} });

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

const updateShippingMethod = async ({
  shippingMethod,
}: {
  shippingMethod: string;
}) => {
  const response = await headkit({
    woocommerceSession: await getWoocommerceSession(),
  }).updateShippingMethod({ shippingMethod });
  return response;
};

const getPaymentGateways = async () => {
  const response = await headkit().getPaymentGateways();
  return response;
};

const getOrder = async ({ id }: { id: string }) => {
  const response = await headkit({
    woocommerceSession: await getWoocommerceSession(),
  }).getOrder({ orderId: id });
  return response;
};

const createPaymentIntent = async ({
  amount,
  currency,
}: {
  amount: number;
  currency: string;
}) => {
  const response = await headkit({
    woocommerceSession: await getWoocommerceSession(),
  }).createPaymentIntent({
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
  const response = await headkit({
    woocommerceSession: await getWoocommerceSession(),
  }).updateCustomer({
    input,
    withCustomer,
    withCart,
  });
  return response;
};

const getProductList = async ({
  input,
}: {
  input: GetProductListQueryVariables;
}) => {
  const response = await headkit().getProductList(input);
  return response;
};

const getProductCategory = async ({ slug }: { slug: string }) => {
  const response = await headkit().getProductCategory({
    id: slug,
    type: ProductCategoryIdType.Slug,
  });
  return response;
};

const getProductFilters = async (
  productFiltersQuery?: GetProductFiltersQueryVariables
) => {
  const response = await headkit().getProductFilters(productFiltersQuery);
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

export {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  applyCoupon,
  removeCoupons,
  checkout,
  getCustomer,
  emptyCart,
  getStripeConfig,
  getPickupLocations,
  updateShippingMethod,
  getPaymentGateways,
  getOrder,
  createPaymentIntent,
  updateCustomer,
  getProductList,
  getProductCategory,
  getProductFilters,
  submitGravityForm,
  getGravityFormById,
};

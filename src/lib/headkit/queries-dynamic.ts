"use server";

import { headkit } from './client';
import { cookies } from 'next/headers';
import { COOKIE_NAMES } from './constants';
import { getWoocommerceAuthToken } from './actions/auth';
import { GetCustomerQueryVariables } from './generated';

/**
 * Dynamic queries that should NOT be cached
 * These operations require fresh data on every request:
 * - Cart operations (session-based)
 * - Order operations (user-specific)
 * - Customer operations (auth-based)
 * - Payment methods (cart-dependent)
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

// ============================================
// CART OPERATIONS - Always fresh
// ============================================

export async function getCart(singleCheckout?: boolean) {
  const config = await getClientConfig(singleCheckout);
  return await headkit(config).getCart();
}

// ============================================
// ORDER OPERATIONS - Always fresh
// ============================================

export async function getOrder({ id }: { id: string }) {
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
}

export async function getOrders() {
  const config = await getClientConfig();
  return await headkit(config).getOrders();
}

export async function getGuestOrder({
  orderId,
  sessionToken,
}: {
  orderId: string;
  sessionToken?: string;
}) {
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
}

// ============================================
// CUSTOMER OPERATIONS - Always fresh
// ============================================

export async function getCustomer(variables: GetCustomerQueryVariables) {
  const config = await getClientConfig();
  return await headkit(config).getCustomer(variables);
}

// ============================================
// PAYMENT OPERATIONS - Always fresh
// ============================================

export async function getAvailablePaymentMethods() {
  const config = await getClientConfig();
  return await headkit(config).getAvailablePaymentMethods();
}


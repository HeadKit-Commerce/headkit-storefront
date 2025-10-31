import { NextResponse } from 'next/server';
import {
  checkout,
  updatePaymentIntent,
} from '@/lib/headkit/actions';
import {
  getStoreSettings,
  getStripeConfig,
} from '@/lib/headkit/queries';
import { v7 as uuidv7 } from 'uuid';
import {
  getCheckoutData,
  deleteCheckoutData,
} from '@/lib/headkit/actions/cookies';
import Stripe from 'stripe';
import { determineStripeKey } from '@/lib/stripe/utils';

export async function GET(request: Request) {
  // Get payment intent ID and client secret from URL params
  const url = new URL(request.url);
  const paymentIntent = url.searchParams.get('payment_intent');
  const paymentIntentClientSecret = url.searchParams.get('payment_intent_client_secret');

  if (!paymentIntent || !paymentIntentClientSecret) {
    return NextResponse.redirect(new URL('/checkout?error=missing_parameters', request.url));
  }

  // Always retrieve payment intent data to get payment_method information
  const [storeSettings, stripeConfig] = await Promise.all([
    getStoreSettings(),
    getStripeConfig(),
  ]);

  // Determine which Stripe key to use with new utility function
  const config = determineStripeKey({
    backendConfig: stripeConfig.data.stripeConfig 
      ? {
          publishableKeyTest: stripeConfig.data.stripeConfig.publishableKeyTest,
          publishableKeyLive: stripeConfig.data.stripeConfig.publishableKeyLive,
          accountId: stripeConfig.data.stripeConfig.accountId,
        }
      : undefined,
    paymentMode: storeSettings.data.storeSettings?.paymentMode,
  });

  // Debug logging for checkout confirm mode determination
  console.log('[Checkout Confirm - Stripe Mode]', {
    paymentIntent: paymentIntent,
    paymentMode: storeSettings.data.storeSettings?.paymentMode,
    selectedMode: config.isUsingTestKey ? 'test' : 'live',
    hasAccountId: !!config.accountId,
  });

  const stripe = new Stripe(config.publishableKey, {
    ...(config.accountId ? { stripeAccount: config.accountId } : {}),
  });

  const paymentIntentData = await stripe.paymentIntents.retrieve(paymentIntent, {
    client_secret: paymentIntentClientSecret,
    expand: ['payment_method'],
  });

  // Determine payment success using Stripe payment intent status
  const isPaymentSuccessful = paymentIntentData.status === 'succeeded';

  try {
    // Get checkout data
    const checkoutData = await getCheckoutData();
    if (!checkoutData?.value) {
      return NextResponse.redirect(new URL('/checkout?error=missing_checkout_data', request.url));
    }

    const checkoutDataObject = JSON.parse(checkoutData.value);

    // Check if payment was successful
    if (isPaymentSuccessful) {
      // Process the checkout with payment confirmed
      const checkoutInput = {
        ...checkoutDataObject,
        clientMutationId: uuidv7(),
        isPaid: true,
        metaData: [
          ...(checkoutDataObject.metaData || []).filter(
            (item: { key: string; value: string }) => item !== null && item.key !== "_headkit_payments_status"
          ),
          {
            key: "_headkit_payments_status",
            value: "processing",
          },
          {
            key: "_stripe_intent_id",
            value: paymentIntent,
          },
          {
            key: "_stripe_payment_method",
            value: JSON.stringify(paymentIntentData.payment_method),
          },
        ],
      };

      const checkoutResponse = await checkout({
        input: checkoutInput,
      });

      // Clean up checkout data
      await deleteCheckoutData();

      if (checkoutResponse.errors || !checkoutResponse.data?.checkout?.order?.databaseId) {
        return NextResponse.redirect(new URL('/checkout?error=checkout_failed', request.url));
      }

      // Get the order ID for updating payment intent
      const orderId = checkoutResponse.data.checkout.order.databaseId;

      // Update payment intent with order ID using GraphQL mutation
      try {
        await updatePaymentIntent({
          input: {
            paymentIntentId: paymentIntent,
            orderId: orderId.toString(),
          },
        });
      } catch {
        // Don't fail the checkout if update fails
      }

      // Redirect to success page
      return NextResponse.redirect(new URL(`/checkout/success/${orderId}`, request.url));
    } else {
      // Payment was not successful
      // Process the checkout with payment failed
      const checkoutInput = {
        ...checkoutDataObject,
        clientMutationId: uuidv7(),
        isPaid: false,
        metaData: [
          ...(checkoutDataObject.metaData || []).filter(
            (item: { key: string; value: string }) => item !== null && item.key !== "_headkit_payments_status"
          ),
          {
            key: "_headkit_payments_status",
            value: "failed",
          },
        ],
      };

      await checkout({
        input: checkoutInput,
      });

      return NextResponse.redirect(new URL('/checkout?error=payment_failed', request.url));
    }
  } catch {
    return NextResponse.redirect(new URL('/checkout?error=processing_error', request.url));
  }
} 
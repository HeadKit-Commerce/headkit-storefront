import { NextResponse } from 'next/server';
import { checkout, getStripeConfig } from '@/lib/headkit/actions';
import { v7 as uuidv7 } from 'uuid';
import Stripe from 'stripe';
import { getCheckoutData, deleteCheckoutData } from '@/lib/headkit/actions/cookies';

export async function GET(request: Request) {
  // Get payment intent ID and client secret from URL params
  const url = new URL(request.url);
  const paymentIntent = url.searchParams.get('payment_intent');
  const paymentIntentClientSecret = url.searchParams.get('payment_intent_client_secret');
  const redirectStatus = url.searchParams.get('redirect_status');
  
  console.log('=================== PAYMENT STATUS CHECK START ===================');
  console.log('Payment status check - payment intent:', paymentIntent);
  console.log('Payment status check - redirect status:', redirectStatus);
  
  if (!paymentIntent || !paymentIntentClientSecret) {
    console.log('Payment status check failed: Missing payment intent or client secret');
    return NextResponse.redirect(new URL('/checkout?error=missing_parameters', request.url));
  }

  try {
    // Get checkout data
    const checkoutData = await getCheckoutData();
    if (!checkoutData?.value) {
      console.log('Payment status check failed: Missing checkout data');
      return NextResponse.redirect(new URL('/checkout?error=missing_checkout_data', request.url));
    }

    const checkoutDataObject = JSON.parse(checkoutData.value);
    console.log('Checkout data retrieved:', {
      hasBilling: !!checkoutDataObject.billing,
      hasMetaData: !!checkoutDataObject.metaData,
    });

    // Get Stripe configuration
    const stripeConfigResponse = await getStripeConfig();
    const stripeFullConfig = stripeConfigResponse.data?.stripeConfig;
    
    if (!stripeFullConfig) {
      console.error('Stripe configuration not available');
      return NextResponse.redirect(new URL('/checkout?error=stripe_configuration', request.url));
    }
    
    // Determine which mode to use - if NEXT_PUBLIC_STRIPE_LIVE_MODE is set, use that, otherwise use publishable key to infer
    let shouldUseLiveMode = false;
    
    if (process.env.NEXT_PUBLIC_STRIPE_LIVE_MODE !== undefined) {
      // Environment variable override
      shouldUseLiveMode = process.env.NEXT_PUBLIC_STRIPE_LIVE_MODE === 'true';
    } else {
      // Infer from whether live publishable key is being used
      shouldUseLiveMode = !!(stripeFullConfig.publishableKeyLive && stripeFullConfig.publishableKeyLive.length > 0);
    }
    
    // Use environment variables for secret keys
    const secretKey = shouldUseLiveMode 
      ? process.env.STRIPE_SECRET_KEY_LIVE 
      : process.env.STRIPE_SECRET_KEY_TEST;

    if (!secretKey) {
      console.error('Stripe secret key not found for mode:', shouldUseLiveMode ? 'live' : 'test');
      return NextResponse.redirect(new URL('/checkout?error=stripe_configuration', request.url));
    }

    // Create Stripe instance with secret key
    const stripeInstanceServer = new Stripe(secretKey, {
      stripeAccount: stripeFullConfig.accountId || undefined,
    });

    try {
      // Retrieve payment intent details
      const paymentIntentResponse = await stripeInstanceServer.paymentIntents.retrieve(
        paymentIntent, 
        {
          client_secret: paymentIntentClientSecret,
          expand: ["payment_method"],
        }
      );

      console.log('Payment intent status:', paymentIntentResponse.status);

      if (paymentIntentResponse.status === 'succeeded') {
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
              key: "_headkit_payment_mode",
              value: shouldUseLiveMode ? "live" : "test",
            },
            {
              key: "_stripe_intent_id",
              value: paymentIntent,
            },
            {
              key: "_stripe_payment_method",
              value: JSON.stringify(paymentIntentResponse.payment_method),
            },
          ],
        };

        const checkoutResponse = await checkout({
          input: checkoutInput,
        });

        console.log('PAYMENT SUCCESS: checkout response', {
          hasErrors: !!checkoutResponse.errors,
          orderId: checkoutResponse.data?.checkout?.order?.databaseId,
        });

        // Clean up checkout data
        await deleteCheckoutData();

        if (checkoutResponse.errors || !checkoutResponse.data?.checkout?.order?.databaseId) {
          console.error('Checkout error details:', JSON.stringify(checkoutResponse.errors, null, 2));
          return NextResponse.redirect(new URL('/checkout?error=checkout_failed', request.url));
        }

        // Get the order ID for updating payment intent description
        const orderId = checkoutResponse.data.checkout.order.databaseId;
        
        // Update payment intent description with order ID
        try {
          await stripeInstanceServer.paymentIntents.update(paymentIntent, {
            description: `Order ID: ${orderId}`
          });
          console.log('Payment intent description updated with order ID:', orderId);
        } catch (updateError) {
          console.error('Error updating payment intent description:', updateError);
          // Don't fail the checkout if description update fails
        }

        // Redirect to success page
        console.log('Payment successful, redirecting to success page with order ID:', orderId);
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
            {
              key: "_headkit_payment_mode",
              value: shouldUseLiveMode ? "live" : "test",
            },
          ],
        };

        await checkout({
          input: checkoutInput,
        });

        console.log('Payment failed with status:', paymentIntentResponse.status);
        return NextResponse.redirect(new URL('/checkout?error=payment_failed', request.url));
      }
    } catch (stripeError) {
      console.error('Error retrieving payment intent:', stripeError);
      return NextResponse.redirect(new URL('/checkout?error=stripe_error', request.url));
    }
  } catch (error) {
    console.error('Error processing payment status:', error);
    console.log('=================== PAYMENT STATUS CHECK END ===================');
    return NextResponse.redirect(new URL('/checkout?error=processing_error', request.url));
  }
} 
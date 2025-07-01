"use server";

import { updatePaymentIntent as headkitUpdatePaymentIntent } from "../headkit/actions";

const updatePaymentIntentDescription = async ({
  paymentIntent,
  orderId,
}: {
  paymentIntent: string;
  orderId: string;
}) => {
  try {
    if (!paymentIntent || !orderId) {
      console.error("Missing required parameters:", { paymentIntent, orderId });
      return;
    }

    const updateResponse = await headkitUpdatePaymentIntent({
      input: {
        paymentIntentId: paymentIntent,
        orderId: orderId,
      },
    });

    if (updateResponse.errors && updateResponse.errors.length > 0) {
      console.error("GraphQL errors in updatePaymentIntent:", updateResponse.errors);
      return;
    }

    if (!updateResponse.data?.updatePaymentIntent) {
      console.error("No updatePaymentIntent data in response");
      return;
    }

    return updateResponse.data.updatePaymentIntent;
  } catch (error) {
    console.error("Failed to update payment intent:", {
      paymentIntent,
      orderId,
      error: error instanceof Error ? error.message : error,
    });
    throw error;
  }
};

export { updatePaymentIntentDescription };

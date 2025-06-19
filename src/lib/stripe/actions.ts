"use server";

import { updatePaymentIntent } from "../headkit/actions";

const updatePaymentIntentDescription = async ({
  paymentIntent,
  orderId,
}: {
  paymentIntent: string;
  orderId: string;
}) => {
  try {
    console.log("=== UPDATE PAYMENT INTENT DEBUG START ===");
    console.log("Input parameters:", { paymentIntent, orderId });
    console.log("Parameter types:", { 
      paymentIntentType: typeof paymentIntent, 
      orderIdType: typeof orderId 
    });
    
    if (!paymentIntent || !orderId) {
      console.error("Missing required parameters:", { paymentIntent, orderId });
      throw new Error(`Missing required parameters: paymentIntent=${paymentIntent}, orderId=${orderId}`);
    }
    
    console.log("Calling headkit updatePaymentIntent GraphQL mutation...");
    
    const updateResponse = await updatePaymentIntent({
      input: {
        paymentIntentId: paymentIntent,
        orderId: orderId,
      },
    });
    
    console.log("GraphQL response received:", {
      success: !!updateResponse.data?.updatePaymentIntent,
      responseId: updateResponse.data?.updatePaymentIntent?.id,
      errors: updateResponse.errors,
      fullResponse: JSON.stringify(updateResponse, null, 2)
    });
    
    if (updateResponse.errors && updateResponse.errors.length > 0) {
      console.error("GraphQL errors in updatePaymentIntent:", updateResponse.errors);
      throw new Error(`GraphQL errors: ${JSON.stringify(updateResponse.errors)}`);
    }
    
    if (!updateResponse.data?.updatePaymentIntent) {
      console.error("No updatePaymentIntent data in response");
      throw new Error("No updatePaymentIntent data in response");
    }
    
    console.log("=== UPDATE PAYMENT INTENT SUCCESS ===");
    console.log("Successfully updated payment intent:", {
      paymentIntent, 
      orderId, 
      responseId: updateResponse.data.updatePaymentIntent.id 
    });
    
    return updateResponse.data.updatePaymentIntent;
    
  } catch (error) {
    console.error("=== UPDATE PAYMENT INTENT ERROR ===");
    console.error("Failed to update payment intent:", {
      paymentIntent,
      orderId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};

export { updatePaymentIntentDescription };

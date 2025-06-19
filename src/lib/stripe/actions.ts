"use server";

import { updatePaymentIntent } from "../headkit/actions";

const updatePaymentIntentDescription = async ({
  paymentIntent,
  orderId,
}: {
  paymentIntent: string;
  orderId: string;
}) => {
  console.log("Starting updatePaymentIntentDescription", { paymentIntent, orderId });
  
  console.log("Updating payment intent via GraphQL mutation", { 
    paymentIntent, 
    orderId
  });
  
  const updateResponse = await updatePaymentIntent({
    input: {
      paymentIntentId: paymentIntent,
      orderId: orderId,
    },
  });
  
  console.log("Payment intent updated successfully", { 
    paymentIntent, 
    orderId, 
    responseId: updateResponse.data?.updatePaymentIntent?.id 
  });
  
  return updateResponse.data?.updatePaymentIntent;
};

export { updatePaymentIntentDescription };

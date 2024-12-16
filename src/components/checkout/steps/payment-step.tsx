"use client";

import React from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { StripePaymentElementChangeEvent } from "@stripe/stripe-js";
import { createPaymentIntent, getPaymentGateways } from "@/lib/headkit/actions";
import { useEffect, useState } from "react";
import { PaymentGateway } from "@/lib/headkit/generated";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAppContext } from "@/components/context/app-context";
import { getFloatVal } from "@/lib/utils";

const paymentSchema = z.object({
  paymentGatewayId: z.string().optional(),
});

interface PaymentStepProps {
  enableStripe: boolean;
  onSubmit: (data: {
    paymentMethod: string;
    transactionId: string;
    paymentIntentId?: string;
    stripePaymentMethod?: string;
  }) => void;
  buttonLabel?: string;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  enableStripe,
  onSubmit,
  buttonLabel = "Pay",
}) => {
  const { cartData } = useAppContext();
  const stripe = useStripe();
  const elements = useElements();
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([]);
  const [isStripeReady, setIsStripeReady] = useState(false);

  // Fetch payment gateways on component mount
  useEffect(() => {
    const fetchPaymentGateways = async () => {
      const response = await getPaymentGateways();
      console.log("response", response);
      setPaymentGateways(response.data?.paymentGateways?.nodes ?? []);
    };
    fetchPaymentGateways();
  }, []);

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
  });

  const handleSubmit = async (data: z.infer<typeof paymentSchema>) => {
    // If using Stripe
    if (enableStripe && stripe && elements && isStripeReady) {
      await elements?.submit();

      const { data: paymentIntent } = await createPaymentIntent({
        amount:
          getFloatVal(cartData?.total ?? "0") > 0
            ? Math.round(getFloatVal(cartData?.total ?? "0") * 100)
            : 9900,
        currency: "aud",
      });

      console.log("paymentIntent", paymentIntent);

      const result = await stripe.confirmPayment({
        clientSecret: paymentIntent.createPaymentIntent.clientSecret,
        elements,
        confirmParams: {
          return_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/checkout/success`,
          expand: ["payment_method"],
        },
        redirect: "if_required",
      });

      console.log("result", result);
      if (result?.error) {
        console.error(result?.error.message);
        return;
      }

      onSubmit({
        paymentMethod: "stripe",
        transactionId: result.paymentIntent.id,
        paymentIntentId: paymentIntent.createPaymentIntent.id,
        stripePaymentMethod: JSON.stringify(
          result.paymentIntent.payment_method
        ),
      });
    } else {
      // For other payment gateways
      onSubmit({
        paymentMethod: data.paymentGatewayId ?? "",
        transactionId: "ch_mock_123456789",
      });
    }
  };

  const handleStripeChange = (event: StripePaymentElementChangeEvent) => {
    console.log(event);
    setIsStripeReady(event.complete);
  };

  return (
    <div className="space-y-6">
      {enableStripe && (
        <PaymentElement
          options={{
            layout: "accordion",
          }}
          onChange={handleStripeChange}
        />
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="paymentGatewayId"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Select Payment Method</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="space-y-3"
                  >
                    {paymentGateways
                      .filter((gateway) => gateway.id !== "stripe")
                      .map((gateway) => (
                        <FormItem
                          key={gateway.id}
                          className="flex items-center space-x-3 space-y-0"
                        >
                          <FormControl>
                            <RadioGroupItem value={gateway.id} />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            <div className="ml-2">
                              <div className="font-medium">{gateway.title}</div>
                              <div className="text-sm text-gray-600">
                                {gateway.description}
                              </div>
                            </div>
                          </FormLabel>
                        </FormItem>
                      ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full mt-4"
            disabled={
              enableStripe
                ? !form.formState.isValid && !isStripeReady
                : !form.formState.isValid
            }
          >
            {buttonLabel}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export { PaymentStep };

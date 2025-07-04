"use client";

import React, { useRef } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useForm, UseFormReturn } from "react-hook-form";
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
import {
  StripePaymentElementChangeEvent,
  PaymentIntent,
} from "@stripe/stripe-js";
import { createPaymentIntent, getPaymentGateways } from "@/lib/headkit/actions";
import { useEffect, useState } from "react";
import { PaymentGateway } from "@/lib/headkit/generated";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAppContext } from "@/contexts/app-context";
import { getFloatVal } from "@/lib/utils";

const paymentSchema = z.object({
  paymentGatewayId: z.string(),
});

interface PaymentStepProps {
  enableStripe: boolean;
  onSubmit: (data: {
    paymentMethod: string;
    transactionId?: string;
    paymentIntentId?: string;
    stripePaymentMethod?: string;
    paymentStatus?: "failed" | "processing" | "pending";
  }) => Promise<{ success: boolean; error?: string }>;
  buttonLabel?: string;
}

const StripePaymentStep = React.forwardRef<
  { handleSubmit: () => Promise<void> },
  Omit<PaymentStepProps, "buttonLabel"> & {
    onStripeReady: (ready: boolean) => void;
    onClick?: () => void;
  }
>(({ onSubmit, onStripeReady, onClick }, ref) => {
  const { cartData } = useAppContext();
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async () => {
    try {
      if (stripe && elements) {
        await elements?.submit();

        const { data: paymentIntentData } = await createPaymentIntent({
          amount:
            getFloatVal(cartData?.total ?? "0") > 0
              ? Math.round(getFloatVal(cartData?.total ?? "0") * 100)
              : 9900,
          currency: "aud",
        });

  

        // Submit the pending status and wait for it to complete
        const pendingResult = await onSubmit({
          paymentMethod: "headkit-payments",
          paymentIntentId: paymentIntentData.createPaymentIntent.id,
          paymentStatus: "pending",
        });

        if (!pendingResult.success) {
          throw new Error(
            pendingResult.error || "Failed to create pending payment"
          );
        }

        const result = await stripe.confirmPayment({
          clientSecret: paymentIntentData.createPaymentIntent.clientSecret,
          elements,
          confirmParams: {
            return_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/checkout/confirm`,
            expand: ["payment_method"],
          },
          redirect: "if_required",
        });

        if (result?.error) {
          console.error("Payment failed", result?.error.message);
          await onSubmit({
            paymentMethod: "headkit-payments",
            paymentIntentId: paymentIntentData.createPaymentIntent.id,
            stripePaymentMethod: result.error.payment_method
              ? JSON.stringify(result.error.payment_method)
              : undefined,
            paymentStatus: "failed",
            transactionId:
              result.error.payment_intent?.id || result.error.charge,
          });
          throw new Error(result.error.message || "Payment failed");
        }

        if (result.paymentIntent?.status === "succeeded") {
  
          const paymentIntent = result.paymentIntent as PaymentIntent;
          const successResult = await onSubmit({
            paymentMethod: "headkit-payments",
            transactionId: paymentIntent.id,
            paymentIntentId: paymentIntentData.createPaymentIntent.id,
            stripePaymentMethod: JSON.stringify(paymentIntent.payment_method),
            paymentStatus: "processing",
          });

          if (!successResult.success) {
            throw new Error(
              successResult.error || "Failed to complete payment"
            );
          }
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      throw error; // Re-throw so parent can handle
    }
  };

  const handleStripeChange = (event: StripePaymentElementChangeEvent) => {
    onStripeReady(event.complete);
  };

  React.useImperativeHandle(ref, () => ({
    handleSubmit,
  }));

  return (
    <div className={`space-y-6`}>
      <PaymentElement
        options={{
          layout: {
            type: "accordion",
            defaultCollapsed: false,
            radios: true,
          },
        }}
        onFocus={() => {
          if (onClick) {
            onClick();
          }
        }}
        onChange={handleStripeChange}
      />
    </div>
  );
});

StripePaymentStep.displayName = "StripePaymentStep";

const StandardPaymentStep: React.FC<{
  onSubmit: PaymentStepProps["onSubmit"];
  onStandardReady: (ready: boolean) => void;
  form: UseFormReturn<z.infer<typeof paymentSchema>>;
  isActive: boolean;
  onClick?: () => void;
}> = ({ onSubmit, onStandardReady, form, isActive, onClick }) => {
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([]);

  useEffect(() => {
    const fetchPaymentGateways = async () => {
      const response = await getPaymentGateways();
      setPaymentGateways(response.data?.paymentGateways?.nodes ?? []);
    };
    fetchPaymentGateways();
  }, []);

  useEffect(() => {
    onStandardReady(form.formState.isValid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.formState.isValid]);

  const handleSubmit = async (data: z.infer<typeof paymentSchema>) => {
    const result = await onSubmit({
      paymentMethod: data.paymentGatewayId ?? "",
    });

    if (!result.success) {
      throw new Error(result.error || "Payment failed");
    }
  };

  return (
    <div onClick={onClick} className={`${!isActive ? "cursor-pointer" : ""}`}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="paymentGatewayId"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="space-y-3"
                  >
                    {paymentGateways
                      .filter((gateway) => gateway.id !== "headkit-payments")
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
                              <div className="font-semibold mb-1 text-primary">
                                {gateway.title}
                              </div>
                              <div className="text-sm text-gray-600 leading-tight">
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
        </form>
      </Form>
    </div>
  );
};

const PaymentStep: React.FC<PaymentStepProps> = ({
  enableStripe,
  onSubmit,
  buttonLabel = "Pay",
}) => {
  const [isStripeReady, setIsStripeReady] = useState(false);
  const [isStandardReady, setIsStandardReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activePaymentMethod, setActivePaymentMethod] = useState<
    "stripe" | "standard" | null
  >(null);

  const form = useForm<{ paymentGatewayId: string }>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentGatewayId: "",
    },
  });

  const stripeRef = useRef<{ handleSubmit: () => Promise<void> }>(null);

  const handlePayment = async () => {
    setLoading(true);
    try {
      if (enableStripe && isStripeReady && activePaymentMethod === "stripe") {
        await stripeRef.current?.handleSubmit();
      } else if (form.formState.isValid && activePaymentMethod === "standard") {
        await form.handleSubmit(async (data) => {
          const result = await onSubmit({
            paymentMethod: data.paymentGatewayId ?? "",
          });

          if (!result.success) {
            throw new Error(result.error || "Payment failed");
          }
        })();
      }
    } catch (error) {
      console.error("Payment submission error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {enableStripe && (
        <div onClick={() => setActivePaymentMethod("stripe")}>
          <StripePaymentStep
            ref={stripeRef}
            enableStripe={enableStripe}
            onSubmit={onSubmit}
            onStripeReady={setIsStripeReady}
            onClick={() => setActivePaymentMethod("stripe")}
          />
        </div>
      )}

      <div>
        <StandardPaymentStep
          onSubmit={onSubmit}
          onStandardReady={setIsStandardReady}
          form={form}
          isActive={activePaymentMethod === "standard"}
          onClick={() => setActivePaymentMethod("standard")}
        />
      </div>

      <Button
        onClick={handlePayment}
        disabled={
          loading ||
          (activePaymentMethod === "stripe" && !isStripeReady) ||
          (activePaymentMethod === "standard" && !isStandardReady) ||
          activePaymentMethod === null
        }
        className="w-full"
      >
        {loading ? "Processing..." : buttonLabel}
      </Button>
    </div>
  );
};

export { PaymentStep };

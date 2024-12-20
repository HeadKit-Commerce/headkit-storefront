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
import { StripePaymentElementChangeEvent } from "@stripe/stripe-js";
import { createPaymentIntent, getPaymentGateways } from "@/lib/headkit/actions";
import { useEffect, useState } from "react";
import { PaymentGateway } from "@/lib/headkit/generated";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAppContext } from "@/components/context/app-context";
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
  }) => void;
  buttonLabel?: string;
}

const StripePaymentStep = React.forwardRef<
  { handleSubmit: () => Promise<void> },
  Omit<PaymentStepProps, 'buttonLabel'> & { onStripeReady: (ready: boolean) => void }
>(({ onSubmit, onStripeReady }, ref) => {
  const { cartData } = useAppContext();
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async () => {
    if (stripe && elements) {
      await elements?.submit();

      const { data: paymentIntent } = await createPaymentIntent({
        amount:
          getFloatVal(cartData?.total ?? "0") > 0
            ? Math.round(getFloatVal(cartData?.total ?? "0") * 100)
            : 9900,
        currency: "aud",
      });

      const result = await stripe.confirmPayment({
        clientSecret: paymentIntent.createPaymentIntent.clientSecret,
        elements,
        confirmParams: {
          return_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/checkout/success`,
          expand: ["payment_method"],
        },
        redirect: "if_required",
      });

      if (result?.error) {
        console.error(result?.error.message);
        return;
      }

      onSubmit({
        paymentMethod: "stripe",
        transactionId: result.paymentIntent.id,
        paymentIntentId: paymentIntent.createPaymentIntent.id,
        stripePaymentMethod: JSON.stringify(result.paymentIntent.payment_method),
      });
    }
  };

  const handleStripeChange = (event: StripePaymentElementChangeEvent) => {
    onStripeReady(event.complete);
  };

  React.useImperativeHandle(ref, () => ({
    handleSubmit
  }));

  return (
    <div className="space-y-6">
      <PaymentElement
        options={{
          layout: "accordion",
        }}
        onChange={handleStripeChange}
      />
    </div>
  );
});

StripePaymentStep.displayName = "StripePaymentStep";

const StandardPaymentStep: React.FC<{
  onSubmit: PaymentStepProps['onSubmit'];
  onStandardReady: (ready: boolean) => void;
  form: UseFormReturn<z.infer<typeof paymentSchema>>;
}> = ({
  onSubmit,
  onStandardReady,
  form
}) => {
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
    }, [form.formState.isValid, onStandardReady]);

    const handleSubmit = (data: z.infer<typeof paymentSchema>) => {
      onSubmit({
        paymentMethod: data.paymentGatewayId ?? "",
      });
    };

    return (
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
        </form>
      </Form>
    );
  };

const PaymentStep: React.FC<PaymentStepProps> = ({ enableStripe, onSubmit, buttonLabel = "Pay" }) => {
  const [isStripeReady, setIsStripeReady] = useState(false);
  const [isStandardReady, setIsStandardReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const form = useForm<{ paymentGatewayId: string }>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentGatewayId: ''
    }
  });
  const stripeRef = useRef<{ handleSubmit: () => Promise<void> }>(null);

  const handlePayment = async () => {
    setLoading(true);
    try {
      if (enableStripe && isStripeReady) {
        await stripeRef.current?.handleSubmit();
      } else {
        await form.handleSubmit((data) => {
          onSubmit({
            paymentMethod: data.paymentGatewayId ?? "",
          });
        })();
      }
    } catch (error) {
      console.error('Payment error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {enableStripe && (
        <StripePaymentStep
          ref={stripeRef}
          onSubmit={onSubmit}
          enableStripe={enableStripe}
          onStripeReady={setIsStripeReady}
        />
      )}
      <StandardPaymentStep
        onSubmit={onSubmit}
        onStandardReady={setIsStandardReady}
        form={form}
      />
      <Button
        onClick={handlePayment}
        className="w-full mt-4"
        disabled={loading || (enableStripe ? !isStripeReady : !isStandardReady)}
        loading={loading}
        rightIcon="arrowRight"
      >
        {buttonLabel}
      </Button>
    </div>
  );
};

export { PaymentStep };

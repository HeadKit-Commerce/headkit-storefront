"use client";

import { ExpressCheckoutElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { ClickResolveDetails } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/components/context/app-context";
import { useState } from "react";
import { AlertBox } from "@/components/alert-box/alert-box";
import { getFloatVal } from "@/lib/utils";
import { createPaymentIntent } from "@/lib/headkit/actions";

interface ExpressCheckoutButtonProps {
  productId?: number;
  variationId?: number;
  price?: number;
  productName?: string;
  singleCheckout: boolean;
}

interface CartNode {
  total: string;
  product: {
    node: {
      name: string;
    };
  };
}

interface CartType {
  contents?: {
    nodes?: CartNode[];
  };
  needsShippingAddress?: boolean;
  total?: string;
}

export function ExpressCheckoutButton({
  productId,
  variationId,
  price,
  productName,
  singleCheckout,
}: ExpressCheckoutButtonProps) {
  const router = useRouter();
  const { initCurrency, cartData: cartDataContext, isGlobalDisabled, setIsGlobalDisabled } = useAppContext();
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const cartData = singleCheckout ? null : cartDataContext as CartType;

  const onConfirm = async () => {
    if (!stripe || !elements) return;

    setErrorMessage(null);
    setIsLoading(true);
    setIsGlobalDisabled(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message);
      }

      const { data: paymentIntent } = await createPaymentIntent({
        amount: singleCheckout 
          ? Math.round((price ?? 0) * 100)
          : Math.round(getFloatVal(cartData?.total ?? "0") * 100),
        currency: initCurrency.toLowerCase(),
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
        throw new Error(result.error.message);
      }

      // Handle successful payment
      router.push(`/checkout/success/${result.paymentIntent.id}`);

    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An error occurred");
      setIsLoading(false);
      setIsGlobalDisabled(false);
      setIsOpen(false);
    }
  };

  if (isLoading) {
    return <div>Processing...</div>;
  }

  return (
    <div className="relative">
      {isGlobalDisabled && (
        <div className="absolute inset-0 z-10 cursor-not-allowed" />
      )}
      
      <ExpressCheckoutElement
        key={singleCheckout ? `${productId}-${variationId}` : "cart-checkout"}
        onConfirm={onConfirm}
        options={{
          buttonType: {
            googlePay: "pay",
          },
          layout: {
            maxColumns: 2,
            overflow: "never",
          },
          buttonHeight: 40,
        }}
        onShippingAddressChange={async (e) => {
          try {
            e.resolve({
              lineItems: [],
              shippingRates: [],
            });
          } catch {
            e.reject();
          }
        }}
        onClick={async (e) => {
          try {
            if (!isOpen) {
              setErrorMessage(null);
              const resolveDetails: ClickResolveDetails = {
                phoneNumberRequired: true,
                shippingAddressRequired: cartData?.needsShippingAddress || singleCheckout,
                billingAddressRequired: true,
                emailRequired: true,
                lineItems: singleCheckout
                  ? [{ amount: Math.round(price! * 100), name: productName! }]
                  : cartData?.contents?.nodes?.map((node) => ({
                      amount: Math.round(getFloatVal(node?.total) * 100),
                      name: node?.product?.node?.name,
                    })),
              };

              if (cartData?.needsShippingAddress || singleCheckout) {
                resolveDetails.shippingRates = [{
                  amount: 0,
                  id: "999",
                  displayName: "Shipping options update once you add your address",
                }];
              }

              e.resolve(resolveDetails);
              setIsOpen(true);
            }
          } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Something went wrong!");
          }
        }}
      />

      {errorMessage && (
        <AlertBox variant="danger" title="Error">
          {errorMessage}
        </AlertBox>
      )}
    </div>
  );
} 
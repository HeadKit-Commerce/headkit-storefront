"use client";

import { Elements } from "@stripe/react-stripe-js";
import { StripeElementsOptions } from "@stripe/stripe-js";
import { useAppContext } from "@/contexts/app-context";
import { getFloatVal } from "@/lib/utils";
import { ExpressCheckoutButton } from "@/components/stripe/express-checkout-button";
import { useMemo } from "react";
import { useStripe } from "@/contexts/stripe-context";

interface ExpressCheckoutProps {
  disabled: boolean;
  price?: number;
  productId?: number;
  variationId?: number;
  productName?: string;
  singleCheckout?: boolean;
  onComplete?: () => void;
}

export function ExpressCheckout({
  disabled,
  price,
  productId,
  variationId,
  productName,
  singleCheckout = false,
  onComplete,
}: ExpressCheckoutProps) {
  const { initCurrency, cartData } = useAppContext();
  const { stripe, isLoading } = useStripe();

  const options: StripeElementsOptions = useMemo(() => ({
    mode: "payment",
    amount: singleCheckout
      ? Math.round((price ?? 0) * 100)
      : Math.round(getFloatVal(cartData?.total ?? "0") * 100),
    currency: initCurrency.toLowerCase(),
    appearance: {
      theme: "stripe",
      variables: {
        colorText: "#23102E",
        colorTextSecondary: "#23102E",
        fontSizeBase: "16px",
        spacingUnit: "5px",
        fontFamily: '"Urbanist", system-ui, sans-serif',
      },
    },
  }), [singleCheckout, price, cartData?.total, initCurrency]);

  if (disabled || (singleCheckout ? !price : !cartData?.total) || !stripe || isLoading) {
    return null;
  }

  console.log("singleCheckout", singleCheckout, JSON.stringify(options, null, 2));

  return (
    <Elements options={options} stripe={stripe}>
      <ExpressCheckoutButton
        productId={productId}
        variationId={variationId}
        price={price}
        productName={productName}
        singleCheckout={singleCheckout}
        onComplete={onComplete}
      />
    </Elements>
  );
} 
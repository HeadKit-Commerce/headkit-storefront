"use client";

import { Elements } from "@stripe/react-stripe-js";
import { StripeElementsOptions } from "@stripe/stripe-js";
import { getStripePromise } from "@/lib/stripe/get-stripe-promise";
import { useAppContext } from "@/components/context/app-context";
import { getFloatVal } from "@/lib/utils";
import { ExpressCheckoutButton } from "@/components/stripe/express-checkout-button";
import { useEffect, useMemo, useState } from "react";
import { Stripe } from "@stripe/stripe-js";

interface ExpressCheckoutProps {
  disabled: boolean;
  price?: number;
  productId?: number;
  variationId?: number;
  productName?: string;
  singleCheckout?: boolean;
}

export function ExpressCheckout({
  disabled,
  price,
  productId,
  variationId,
  productName,
  singleCheckout = false,
}: ExpressCheckoutProps) {
  const { initCurrency, cartData, stripeConfig } = useAppContext();
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    if (stripeConfig?.publishableKey && stripeConfig?.accountId) {
      setStripePromise(getStripePromise(stripeConfig.publishableKey, stripeConfig.accountId));
    }
  }, [stripeConfig]);

  const options: StripeElementsOptions = useMemo(() => {
    return {
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
          spacingUnit: "10px",
          fontFamily: '"Urbanist", system-ui, sans-serif',
        },
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartData?.contentsTotal, price, singleCheckout]);

  if (disabled || (singleCheckout ? !price : !cartData?.total) || !stripePromise) {
    return null;
  }

  return (
    <Elements options={options} stripe={stripePromise}>
      <ExpressCheckoutButton
        productId={productId}
        variationId={variationId}
        price={price}
        productName={productName}
        singleCheckout={singleCheckout}
      />
    </Elements>
  );
} 
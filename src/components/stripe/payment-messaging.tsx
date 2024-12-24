"use client";

import { Elements, PaymentMethodMessagingElement } from "@stripe/react-stripe-js";
import { getStripePromise } from "@/lib/stripe/get-stripe-promise";
import { useAppContext } from "@/components/context/app-context";
import { StripeConfig } from "@/lib/headkit/generated";
import { useEffect, useState } from "react";
import { Stripe } from "@stripe/stripe-js";

interface PaymentMethodMessagingProps {
  disabled: boolean;
  price: number;
  stripeConfig: StripeConfig | null;
}

export function PaymentMethodMessaging({ disabled, price, stripeConfig }: PaymentMethodMessagingProps) {
  const { initLang, initCurrency } = useAppContext();
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const lang = initLang.split("-");
  const validCurrencies = ["USD", "GBP", "EUR", "DKK", "NOK", "SEK", "AUD", "CAD", "NZD"] as const;
  const validCountries = ["US", "CA", "AU", "NZ", "GB", "IE", "FR", "ES", "DE", "AT", "BE", "DK", "FI", "IT", "NL", "NO", "SE"] as const;
  
  const isValidCurrency = validCurrencies.includes(initCurrency.toUpperCase() as typeof validCurrencies[number]);
  const isValidCountry = validCountries.includes(lang[1].toUpperCase() as typeof validCountries[number]);
  const isStripeEnabled = !!(stripeConfig?.publishableKey && stripeConfig?.accountId);

  useEffect(() => {
    if (isStripeEnabled) {
      setStripePromise(getStripePromise(stripeConfig?.publishableKey ?? "", stripeConfig?.accountId ?? ""));
    }
  }, [stripeConfig, isStripeEnabled]);

  if (disabled || !isValidCurrency || !isValidCountry || !isStripeEnabled || !stripePromise) {
    return null;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        fonts: [{ cssSrc: "https://fonts.googleapis.com/css2?family=Urbanist&display=swap" }],
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
        currency: initCurrency.toLowerCase(),
      }}
    >
      <PaymentMethodMessagingElement
        options={{
          amount: Math.round(price * 100),
          currency: initCurrency.toUpperCase() as typeof validCurrencies[number],
          paymentMethodTypes: ["klarna", "afterpay_clearpay", "affirm"],
          countryCode: lang[1].toUpperCase() as typeof validCountries[number],
        }}
      />
    </Elements>
  );
} 
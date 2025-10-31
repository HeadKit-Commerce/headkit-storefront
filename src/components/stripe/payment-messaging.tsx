"use client";

import {
  Elements,
  PaymentMethodMessagingElement,
} from "@stripe/react-stripe-js";
import { useAppContext } from "@/contexts/app-context";
import { useStripeConfig } from "@/contexts/stripe-context";
import { useEffect, useState } from "react";
import { Stripe } from "@stripe/stripe-js";

interface PaymentMethodMessagingProps {
  disabled: boolean;
  price: number;
}

export function PaymentMethodMessaging({
  disabled,
  price,
}: PaymentMethodMessagingProps) {
  const { initLang, initCurrency } = useAppContext();
  const { loadStripe, publishableKey } = useStripeConfig();
  const lang = initLang.split("-");
  
  const [stripe, setStripe] = useState<Promise<Stripe | null> | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  
  const validCurrencies = [
    "USD",
    "GBP",
    "EUR",
    "DKK",
    "NOK",
    "SEK",
    "AUD",
    "CAD",
    "NZD",
  ] as const;
  const validCountries = [
    "US",
    "CA",
    "AU",
    "NZ",
    "GB",
    "IE",
    "FR",
    "ES",
    "DE",
    "AT",
    "BE",
    "DK",
    "FI",
    "IT",
    "NL",
    "NO",
    "SE",
  ] as const;

  const isValidCurrency = validCurrencies.includes(
    initCurrency.toUpperCase() as (typeof validCurrencies)[number]
  );
  const isValidCountry = validCountries.includes(
    lang[1].toUpperCase() as (typeof validCountries)[number]
  );
  const isStripeEnabled = !!publishableKey;

  // Load Stripe when component is enabled and conditions are met
  useEffect(() => {
    if (!disabled && isValidCurrency && isValidCountry && isStripeEnabled && !stripe && !stripeLoading) {
      setStripeLoading(true);
      const stripePromise = loadStripe();
      setStripe(stripePromise);
      stripePromise.then(() => {
        setStripeLoading(false);
      }).catch(() => {
        setStripeLoading(false);
      });
    }
  }, [disabled, isValidCurrency, isValidCountry, isStripeEnabled, stripe, stripeLoading, loadStripe]);

  if (
    disabled ||
    !isValidCurrency ||
    !isValidCountry ||
    !isStripeEnabled ||
    !stripe ||
    stripeLoading
  ) {
    return null;
  }

  return (
    <Elements
      stripe={stripe}
      options={{
        mode: "payment",
        amount: Math.round(price * 100),
        currency: initCurrency.toLowerCase(),
        fonts: [
          {
            family: "Urbanist",
            src: "https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&display=swap",
            style: "normal",
            weight: "400",
          },
        ],
        appearance: {
          theme: "stripe",
          variables: {
            borderRadius: "8px",
            focusBoxShadow: "none",
            colorPrimary: "#23102E",
            colorBackground: "#f2f2f2",
            colorText: "#23102E",
            colorDanger: "#df1b41",
            fontFamily: "Urbanist, system-ui, sans-serif",
            colorTextPlaceholder: "#5F5F5F",
          },
          rules: {
            ".Input": {
              padding: "12px 10px",
            },
            ".Input:focus": {
              outline: "2px solid #23102E",
            },
          },
        },
      }}
    >
      <PaymentMethodMessagingElement
        options={{
          amount: Math.round(price * 100),
          currency:
            initCurrency.toUpperCase() as (typeof validCurrencies)[number],
          paymentMethodTypes: ["klarna", "afterpay_clearpay", "affirm"],
          countryCode: lang[1].toUpperCase() as (typeof validCountries)[number],
        }}
      />
    </Elements>
  );
} 
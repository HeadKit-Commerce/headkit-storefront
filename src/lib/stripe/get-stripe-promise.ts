import type { Stripe } from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;

// uses the singleton pattern and lazy load stripe for performance with pure
// see https://vercel.com/guides/getting-started-with-nextjs-typescript-stripe
export const getStripePromise = (publishableKey: string, accountId: string) => {
  if (!stripePromise && publishableKey && accountId) {
    stripePromise = loadStripe(publishableKey, {
      stripeAccount: accountId,
    });
  }
  return stripePromise;
};

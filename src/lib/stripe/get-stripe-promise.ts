import type { Stripe } from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;

/**
 * Gets the Stripe instance using the singleton pattern for lazy loading
 * Supports both custom keys (no accountId) and Stripe Connect (with accountId)
 * 
 * @param publishableKey - Stripe publishable key
 * @param accountId - Optional Stripe Connect account ID
 * @returns Promise resolving to Stripe instance
 * @see https://vercel.com/guides/getting-started-with-nextjs-typescript-stripe
 */
export const getStripePromise = (
  publishableKey: string, 
  accountId?: string
) => {
  if (!stripePromise && publishableKey) {
    // Only pass stripeAccount option if accountId is provided (Stripe Connect mode)
    const loadOptions = accountId ? { stripeAccount: accountId } : undefined;
    stripePromise = loadStripe(publishableKey, loadOptions);
  }
  return stripePromise;
};

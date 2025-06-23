import { PaymentMode } from "@/lib/headkit/generated";

interface StripeConfig {
  publishableKeyLive?: string | null | undefined;
  publishableKeyTest: string;
}

interface StoreSettings {
  paymentMode: PaymentMode;
}

export interface StripeKeyResult {
  stripeKey: string;
  isUsingTestKey: boolean;
  reason: 'env_override' | 'store_settings' | 'live_key_unavailable';
}

/**
 * Determines which Stripe key to use based on environment, store settings, and key availability
 * Priority: env var > store settings > key availability fallback
 */
export function determineStripeKey(
  stripeConfig: StripeConfig,
  storeSettings: StoreSettings
): StripeKeyResult {
  const liveKey = stripeConfig.publishableKeyLive;
  const testKey = stripeConfig.publishableKeyTest;
  const envMode = process.env.NEXT_PUBLIC_STRIPE_LIVE_MODE;

  // Determine test mode with priority: env var > store settings > key availability
  let shouldUseTestMode = false;
  let reason: StripeKeyResult['reason'] = 'store_settings';

  if (envMode) {
    // Environment variable overrides everything
    shouldUseTestMode = envMode === "test";
    reason = 'env_override';
  } else {
    // Use store settings if env var not defined
    shouldUseTestMode = storeSettings.paymentMode === PaymentMode.Test;
  }

  // Determine final key - fallback to test key if live key unavailable
  let stripeKey: string;
  let isUsingTestKey: boolean;

  if (shouldUseTestMode || !liveKey) {
    stripeKey = testKey!;
    isUsingTestKey = true;
    if (!shouldUseTestMode && !liveKey) {
      reason = 'live_key_unavailable';
    }
  } else {
    stripeKey = liveKey;
    isUsingTestKey = false;
  }

  if (!stripeKey) {
    throw new Error(
      "Missing Stripe keys - both test and live keys are unavailable"
    );
  }

  return {
    stripeKey,
    isUsingTestKey,
    reason
  };
} 
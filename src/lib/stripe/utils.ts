import { PaymentMode } from "@/lib/headkit/generated";

/**
 * Backend configuration from GraphQL (Stripe Connect mode)
 */
export interface BackendStripeConfig {
  publishableKeyTest: string;
  publishableKeyLive?: string | null;
  accountId: string;
}

/**
 * Result of Stripe key determination
 */
export interface StripeKeyResult {
  publishableKey: string;
  accountId?: string;
  isUsingTestKey: boolean;
  mode: 'env_custom_key' | 'backend_connect' | 'env_override_connect';
}

/**
 * Options for determining Stripe configuration
 */
export interface DetermineStripeKeyOptions {
  // Backend config (Stripe Connect mode)
  backendConfig?: BackendStripeConfig;
  // Payment mode from store settings (TEST or LIVE)
  paymentMode?: PaymentMode;
}

/**
 * Determines Stripe configuration with support for two modes:
 * 1. Custom Keys (Simple Mode): Uses environment variables only
 * 2. Stripe Connect (Platform Mode): Uses backend config with accountId
 * 
 * Priority:
 * 1. Environment variables (highest priority) - Custom key mode
 * 2. Backend GraphQL config - Stripe Connect mode
 * 3. Error if neither available
 * 
 * @param options - Configuration options
 * @returns Stripe configuration with publishable key and optional accountId
 */
export function determineStripeKey(
  options: DetermineStripeKeyOptions = {}
): StripeKeyResult {
  const { backendConfig, paymentMode } = options;

  // Priority 1: Check environment variables (custom key mode)
  const envLiveKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE;
  const envTestKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST;
  const envMode = process.env.NEXT_PUBLIC_STRIPE_LIVE_MODE;

  // If environment variables are set, use custom key mode
  if (envTestKey || envLiveKey) {
    // Determine which key to use based on env mode
    let shouldUseTestKey = true;
    
    if (envMode !== undefined) {
      shouldUseTestKey = envMode === "test";
    }

    // Select the appropriate key
    let publishableKey: string;
    if (shouldUseTestKey || !envLiveKey) {
      if (!envTestKey) {
        throw new Error(
          "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST is required when using custom key mode"
        );
      }
      publishableKey = envTestKey;
    } else {
      publishableKey = envLiveKey;
    }

    return {
      publishableKey,
      accountId: undefined, // No accountId in custom key mode
      isUsingTestKey: publishableKey.startsWith('pk_test_'),
      mode: 'env_custom_key',
    };
  }

  // Priority 2: Use backend config (Stripe Connect mode)
  if (backendConfig) {
    const { publishableKeyTest, publishableKeyLive, accountId } = backendConfig;

    // Determine which key to use based on payment mode
    let shouldUseTestKey = true;
    
    if (paymentMode !== undefined) {
      shouldUseTestKey = paymentMode === PaymentMode.Test;
    }

    // Select the appropriate key
    let publishableKey: string;
    if (shouldUseTestKey || !publishableKeyLive) {
      if (!publishableKeyTest) {
        throw new Error(
          "Backend Stripe configuration is missing publishableKeyTest"
        );
      }
      publishableKey = publishableKeyTest;
    } else {
      publishableKey = publishableKeyLive;
    }

    return {
      publishableKey,
      accountId, // Include accountId for Stripe Connect
      isUsingTestKey: publishableKey.startsWith('pk_test_'),
      mode: 'backend_connect',
    };
  }

  // No configuration available
  throw new Error(
    "No Stripe configuration available. Either set environment variables " +
    "(NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST/LIVE) or provide backend config."
  );
} 
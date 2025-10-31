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
    // Important: Backend only sends publishableKeyLive for PAID plans
    // FREE plans will only receive publishableKeyTest, ensuring they always use test mode
    let publishableKey: string;
    if (shouldUseTestKey || !publishableKeyLive) {
      // Use test key if:
      // 1. Store settings say test mode, OR
      // 2. Backend didn't send live key (FREE plan or no live key configured)
      if (!publishableKeyTest) {
        throw new Error(
          "Backend Stripe configuration is missing publishableKeyTest"
        );
      }
      publishableKey = publishableKeyTest;
    } else {
      publishableKey = publishableKeyLive;
    }

    const result = {
      publishableKey,
      accountId, // Include accountId for Stripe Connect
      isUsingTestKey: publishableKey.startsWith('pk_test_'),
      mode: 'backend_connect' as const,
    };

    // Debug logging for mode determination
    if (process.env.NODE_ENV === 'development') {
      console.log('[Stripe Mode Determination]', {
        source: 'backend_connect',
        paymentMode: paymentMode,
        hasLiveKey: !!publishableKeyLive,
        selectedMode: result.isUsingTestKey ? 'test' : 'live',
        reason: !publishableKeyLive ? 'no_live_key_from_backend' : (shouldUseTestKey ? 'store_settings_test' : 'store_settings_live'),
      });
    }

    return result;
  }

  // No configuration available
  throw new Error(
    "No Stripe configuration available. Either set environment variables " +
    "(NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST/LIVE) or provide backend config."
  );
} 
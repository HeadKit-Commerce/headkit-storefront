"use client";

import { createContext, useContext, useMemo } from 'react';
import { Stripe, loadStripe } from '@stripe/stripe-js';
import { 
  determineStripeKey, 
  BackendStripeConfig,
  type DetermineStripeKeyOptions 
} from '@/lib/stripe/utils';
import { PaymentMode } from '@/lib/headkit/generated';

interface StripeContextType {
  publishableKey: string | null;
  accountId: string | null;
  isLiveMode: boolean;
  error: Error | null;
  loadStripe: () => Promise<Stripe | null>;
}

const StripeContext = createContext<StripeContextType>({
  publishableKey: null,
  accountId: null,
  isLiveMode: false,
  error: null,
  loadStripe: async () => null,
});

export const useStripeConfig = () => useContext(StripeContext);

// Cache for the stripe instance to avoid loading multiple times
let stripePromise: Promise<Stripe | null> | null = null;

interface StripeProviderProps {
  children: React.ReactNode;
  /**
   * Backend configuration for Stripe Connect mode
   * If not provided, will fall back to environment variables
   */
  backendConfig?: BackendStripeConfig;
  /**
   * Payment mode from store settings (TEST or LIVE)
   */
  paymentMode?: PaymentMode;
}

export function StripeProvider({ 
  children, 
  backendConfig,
  paymentMode 
}: StripeProviderProps) {
  
  const contextValue = useMemo(() => {
    try {
      // Determine Stripe configuration (supports both custom keys and Connect)
      const options: DetermineStripeKeyOptions = {
        backendConfig,
        paymentMode,
      };
      
      const config = determineStripeKey(options);
      
      return {
        publishableKey: config.publishableKey,
        accountId: config.accountId || null,
        isLiveMode: !config.isUsingTestKey,
        error: null,
        loadStripe: async () => {
          if (!config.publishableKey) {
            return null;
          }
          
          if (!stripePromise) {
            // Load Stripe with optional accountId for Connect mode
            const loadOptions = config.accountId 
              ? { stripeAccount: config.accountId }
              : undefined;
            
            stripePromise = loadStripe(config.publishableKey, loadOptions);
          }
          return stripePromise;
        },
      } satisfies StripeContextType;
    } catch (err) {
      return {
        publishableKey: null,
        accountId: null,
        isLiveMode: false,
        error: err instanceof Error ? err : new Error('Failed to determine Stripe configuration'),
        loadStripe: async () => null,
      };
    }
  }, [backendConfig, paymentMode]);

  return (
    <StripeContext.Provider value={contextValue}>
      {children}
    </StripeContext.Provider>
  );
} 
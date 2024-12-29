"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { Stripe, loadStripe } from '@stripe/stripe-js';
import { useAppContext } from './app-context';

interface StripeContextType {
  stripe: Promise<Stripe | null> | null;
  isLoading: boolean;
  error: Error | null;
}

const StripeContext = createContext<StripeContextType>({
  stripe: null,
  isLoading: true,
  error: null,
});

export const useStripe = () => useContext(StripeContext);

export function StripeProvider({ children }: { children: React.ReactNode }) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { stripeConfig } = useAppContext();

  useEffect(() => {
    if (stripeConfig?.publishableKey && stripeConfig?.accountId) {
      try {
        const promise = loadStripe(stripeConfig.publishableKey, {
          stripeAccount: stripeConfig.accountId,
        });
        setStripePromise(promise);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load Stripe'));
      } finally {
        setIsLoading(false);
      }
    }
  }, [stripeConfig]);

  return (
    <StripeContext.Provider 
      value={{ 
        stripe: stripePromise, 
        isLoading,
        error
      }}
    >
      {children}
    </StripeContext.Provider>
  );
} 
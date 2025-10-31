import React, { Suspense } from "react";
import { StripeProvider } from "@/contexts/stripe-context";
import { CheckoutPageContent } from "./checkout-page-content";
import { getStripeConfig, getStoreSettings } from "@/lib/headkit/queries";
import { BackendStripeConfig } from "@/lib/stripe/utils";
import { PaymentMode } from "@/lib/headkit/generated";

export default async function Page() {
  // Fetch Stripe configuration from backend (only on checkout page)
  let backendConfig: BackendStripeConfig | undefined;
  let paymentMode: PaymentMode | undefined;

  try {
    const [stripeConfigResponse, storeSettingsResponse] = await Promise.all([
      getStripeConfig(),
      getStoreSettings(),
    ]);

    const stripeConfig = stripeConfigResponse.data?.stripeConfig;
    const storeSettings = storeSettingsResponse.data?.storeSettings;

    if (stripeConfig && storeSettings) {
      backendConfig = {
        publishableKeyTest: stripeConfig.publishableKeyTest,
        publishableKeyLive: stripeConfig.publishableKeyLive,
        accountId: stripeConfig.accountId,
      };
      paymentMode = storeSettings.paymentMode;
    }
  } catch (error) {
    console.error("Error fetching Stripe config:", error);
    // Will fall back to environment variables in StripeProvider
  }

  return (
    <StripeProvider backendConfig={backendConfig} paymentMode={paymentMode}>
      <Suspense
        fallback={
          <div className="min-h-[700px] py-10 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Loading...</p>
            </div>
          </div>
        }
      >
        <CheckoutPageContent />
      </Suspense>
    </StripeProvider>
  );
}

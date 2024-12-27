"use client";

import { ExpressCheckoutElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { ClickResolveDetails, StripeExpressCheckoutElementConfirmEvent } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/components/context/app-context";
import { useState } from "react";
import { AlertBox } from "@/components/alert-box/alert-box";
import { getFloatVal } from "@/lib/utils";
import { addToCart, createPaymentIntent, updateCustomer, updateShippingMethod, checkout } from "@/lib/headkit/actions";
import { CheckoutInput, CountriesEnum } from "@/lib/headkit/generated";
import { removeSingleCheckoutSession } from "@/lib/headkit/actions/auth";
import { v7 as uuidv7 } from "uuid";

interface ExpressCheckoutButtonProps {
  productId?: number;
  variationId?: number;
  price?: number;
  productName?: string;
  singleCheckout: boolean;
}

interface CartNode {
  total: string;
  product: {
    node: {
      name: string;
    };
  };
}

interface CartType {
  contents?: {
    nodes?: CartNode[];
  };
  needsShippingAddress?: boolean;
  total?: string;
}


export function ExpressCheckoutButton({
  productId,
  variationId,
  price,
  productName,
  singleCheckout,
}: ExpressCheckoutButtonProps) {
  const router = useRouter();
  const { initCurrency, cartData: cartDataContext, isGlobalDisabled, setIsGlobalDisabled } = useAppContext();
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const cartData = singleCheckout ? null : cartDataContext as CartType;

  const onConfirm = async (event: StripeExpressCheckoutElementConfirmEvent) => {
    if (!stripe || !elements) return;

    setErrorMessage(null);
    setIsLoading(true);
    setIsGlobalDisabled(true);

    try {
      const { error: submitError } = await elements.submit();
      console.log("submitError", submitError);

      if (submitError) {
        throw new Error(submitError.message);
      }

      const { data: paymentIntent } = await createPaymentIntent({
        amount: singleCheckout
          ? Math.round((price ?? 0) * 100)
          : Math.round(getFloatVal(cartData?.total ?? "0") * 100),
        currency: initCurrency.toLowerCase(),
      });
      console.log("paymentIntent", paymentIntent);

      const result = await stripe.confirmPayment({
        clientSecret: paymentIntent.createPaymentIntent.clientSecret,
        elements,
        confirmParams: {
          return_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/checkout/success`,
          expand: ["payment_method"],
        },
        redirect: "if_required",
      });

      console.log("result", result);

      if (result?.error) {
        throw new Error(result.error.message);
      }

      const checkoutData: {
        singleCheckout: boolean;
        input: CheckoutInput
      } = {
        singleCheckout,
        input: {
          clientMutationId: uuidv7(),
          paymentMethod: "stripe",
          isPaid: true,
          transactionId: result.paymentIntent.id,
          billing: {
            firstName: event.billingDetails?.name?.split(" ")[0],
            lastName: event.billingDetails?.name?.split(" ")[1],
            address1: event.billingDetails?.address?.line1,
            address2: event.billingDetails?.address?.line2,
            city: event.billingDetails?.address?.city,
            state: event.billingDetails?.address?.state,
            postcode: event.billingDetails?.address?.postal_code,
            country: event.billingDetails?.address?.country as CountriesEnum,
            email: event.billingDetails?.email,
            phone: event.billingDetails?.phone,
          },
          shipping: {
            firstName: event.shippingAddress?.name?.split(" ")[0],
            lastName: event.shippingAddress?.name?.split(" ")[1],
            address1: event.shippingAddress?.address?.line1,
            address2: event.shippingAddress?.address?.line2,
            city: event.shippingAddress?.address?.city,
            state: event.shippingAddress?.address?.state,
            postcode: event.shippingAddress?.address?.postal_code,
            country: event.shippingAddress?.address?.country as CountriesEnum,
          },
          metaData: [
            {
              key: "_stripe_intent_id",
              value: result.paymentIntent.id,
            },
            {
              key: "_stripe_charge_captured",
              value: "yes",
            },
            {
              key: "_stripe_payment_method",
              value: JSON.stringify(result.paymentIntent.payment_method),
            },
            ...(singleCheckout ? [{
              key: "_single_checkout", 
              value: "true"
            }] : []),
          ],
        },
      };

      console.log("checkoutData", checkoutData);

      const checkoutResult = await checkout(checkoutData);
      console.log("checkoutResult", checkoutResult);



      // Handle successful payment
      router.push(`/checkout/success/${checkoutResult.data.checkout?.order?.databaseId}`);



    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An error occurred");
      setIsLoading(false);
      setIsGlobalDisabled(false);
      setIsOpen(false);
      await removeSingleCheckoutSession();
    }
  };


  return (
    <div className="relative">
      {(isGlobalDisabled || isLoading) && (
        <div className="absolute inset-0 z-10 cursor-not-allowed" />
      )}

      <ExpressCheckoutElement
        key={singleCheckout ? `${productId}-${variationId}` : "cart-checkout"}
        onConfirm={onConfirm}
        options={{
          buttonType: {
            googlePay: "pay",
          },
          layout: {
            maxColumns: 2,
            overflow: "never",
          },
          buttonHeight: 40,
        }}
        onShippingAddressChange={async (e) => {
          console.log("onShippingAddressChange", singleCheckout, e);
          try {

            const { data: customerData } = await updateCustomer({
              input: {
                shipping: {
                  state: e.address.state,
                  city: e.address.city,
                  country: e.address.country as CountriesEnum,
                  postcode: e.address.postal_code,
                },
              },
              withCustomer: false,
              withCart: true,
              singleCheckout,
            });

            console.log("customerData", customerData);
            const newCartData = customerData?.updateCustomer?.cart;

            const shippingRates =
              newCartData?.availableShippingMethods?.length ?? 0 > 0
                ? newCartData?.availableShippingMethods?.[0]?.rates
                : [];

            elements?.update({
              amount: Math.round(getFloatVal(newCartData?.total ?? "0") * 100),
            });

            e.resolve({
              lineItems: singleCheckout
                ? [{ amount: Math.round(price! * 100), name: productName! }]
                : cartData?.contents?.nodes?.map((node) => ({
                  amount: Math.round(getFloatVal(node?.total) * 100),
                  name: node?.product?.node?.name,
                })),
              shippingRates: newCartData?.needsShippingAddress ? shippingRates?.map((rate) => ({
                id: rate?.id ?? "",
                displayName: rate?.label ?? "",
                amount: Math.round(
                  (getFloatVal(rate?.cost || "0") + getFloatVal(rate?.tax || "0")) * 100
                ),
              })) : undefined,
            });
          } catch (error) {
            console.log("errror", error);
            e.reject();
          }
        }}
        onShippingRateChange={async (e) => {
          console.log("onShippingRateChange", e);
          try {
            const { data: updateCartResult } = await updateShippingMethod({
              shippingMethod: e.shippingRate.id,
              singleCheckout,
            });

            elements?.update({
              amount: Math.round(
                getFloatVal(
                  updateCartResult?.updateShippingMethod?.cart?.total ?? "0"
                ) * 100
              ),
            });
            const shippingRates =
              updateCartResult?.updateShippingMethod?.cart
                ?.availableShippingMethods?.length ?? 0 > 0
                ? updateCartResult?.updateShippingMethod?.cart
                  ?.availableShippingMethods?.[0]?.rates
                : [];

            e.resolve({
              lineItems: singleCheckout
                ? [{ amount: Math.round(price! * 100), name: productName! }]
                : cartData?.contents?.nodes?.map((node) => ({
                  amount: Math.round(getFloatVal(node?.total) * 100),
                  name: node?.product?.node?.name,
                })),
              shippingRates: updateCartResult?.updateShippingMethod?.cart?.needsShippingAddress ? shippingRates?.map((rate) => ({
                id: rate?.id ?? "",
                displayName: rate?.label ?? "",
                amount: Math.round(
                  (getFloatVal(rate?.cost || "0") + getFloatVal(rate?.tax || "0")) * 100
                ),
              })) : undefined,
            });
          } catch (error) {
            console.log("errror", error);
            e.reject();
          }
        }}
        onClick={async (e) => {
          try {
            if (!isOpen) {
              setErrorMessage(null);
              const resolveDetails: ClickResolveDetails = {
                phoneNumberRequired: true,
                shippingAddressRequired: cartData?.needsShippingAddress || singleCheckout,
                billingAddressRequired: true,
                emailRequired: true,
                lineItems: singleCheckout
                  ? [{ amount: Math.round(price! * 100), name: productName! }]
                  : cartData?.contents?.nodes?.map((node) => ({
                    amount: Math.round(getFloatVal(node?.total) * 100),
                    name: node?.product?.node?.name,
                  })),
              };

              if (cartData?.needsShippingAddress || singleCheckout) {
                resolveDetails.shippingRates = [{
                  amount: 0,
                  id: "999",
                  displayName: "Shipping options update once you add your address",
                }];
              }
              e.resolve(resolveDetails);

              //add single item to new cart
              if (singleCheckout) {
                await addToCart({
                  input: {
                    quantity: 1,
                    productId: productId!,
                    variationId: variationId!,
                  },
                  singleCheckout,
                });
              }


              setIsOpen(true);
            }
          } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Something went wrong!");
          }
        }}
        onCancel={async () => {
          console.log("onCancel");
          // clear cookies
          if (singleCheckout) {
            await removeSingleCheckoutSession()
          }
        }}
      />

      {errorMessage && (
        <AlertBox variant="danger" title="Error">
          {errorMessage}
        </AlertBox>
      )}
    </div>
  );
} 
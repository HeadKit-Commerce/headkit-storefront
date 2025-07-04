"use client";

import { useState, useEffect } from "react";
import { ContactFormStep } from "./steps/contact-form-step";
import { DeliveryMethodStep } from "./steps/delivery-method-step";
import { BillingAddressStep } from "./steps/billing-address-step";
import { ShippingOptionsStep } from "./steps/shipping-options-step";
import { PaymentStep } from "./steps/payment-step";
import { AccordionWrapper } from "./accordion-wrapper";
import { DeliveryStepEnum, CheckoutFormStepEnum } from "./utils";
import {
  CheckoutInput,
  CountriesEnum,
  ShippingRate,
} from "@/lib/headkit/generated";
import { Elements } from "@stripe/react-stripe-js";
import { currencyFormatter, getFloatVal } from "@/lib/utils";
import { useAppContext } from "../../contexts/app-context";
import {
  checkout,
  getCustomer,
  getPickupLocations,
} from "@/lib/headkit/actions";
import { v7 as uuidv7 } from "uuid";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpressCheckout } from "../stripe/express-checkout";
import { useStripe } from "@/contexts/stripe-context";
import { useRouter } from "next/navigation";
import { updatePaymentIntentDescription } from "@/lib/stripe/actions";
import Cookies from "js-cookie";

interface FormData {
  email?: string;
  newsletter?: boolean;
  deliveryMethod?: DeliveryStepEnum;
  location?: string;
  billingAddress?: {
    firstName: string;
    lastName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    phone: string;
  };
  shippingAddress?: {
    firstName: string;
    lastName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    phone: string;
  };
  shippingMethod?: string;
  shippingRate?: ShippingRate;
  paymentMethodId?: string;
  customerNote?: string;
  stripePaymentMethod?: string;
}

const CheckoutForm = () => {
  const router = useRouter();
  const { cartData, isLiveMode } = useAppContext();
  
  // Determine if payment is needed based on cart total
  const cartTotal = getFloatVal(cartData?.total ?? "0");
  const needsPayment = cartTotal > 0;
  
  // Get available steps based on whether payment is needed
  const availableSteps = needsPayment 
    ? Object.values(CheckoutFormStepEnum)
    : Object.values(CheckoutFormStepEnum).filter(step => step !== CheckoutFormStepEnum.PAYMENT);
  
  const [currentStep, setCurrentStep] = useState<CheckoutFormStepEnum>(
    CheckoutFormStepEnum.CONTACT
  );
  const [formData, setFormData] = useState<FormData>({
    email: "",
    newsletter: false,
    deliveryMethod: undefined,
    location: "",
    billingAddress: {
      firstName: "",
      lastName: "",
      line1: "",
      line2: "",
      city: "",
      postalCode: "",
      state: "",
      country: "",
      phone: "",
    },
    shippingAddress: {
      firstName: "",
      lastName: "",
      line1: "",
      line2: "",
      city: "",
      postalCode: "",
      state: "",
      country: "",
      phone: "",
    },
    shippingMethod: "",
    paymentMethodId: "",
    customerNote: "",
    stripePaymentMethod: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [pickupLocations, setPickupLocations] = useState<Array<{
    address: string;
    city: string;
    country: string;
    countryCode: string;
    details: string;
    enabled: boolean;
    name: string;
    postcode: string;
    shippingMethodId: string;
    state: string;
    stateCode: string;
  }>>([]);
  const [isLoadingPickupLocations, setIsLoadingPickupLocations] = useState(true);

  const { stripe } = useStripe();

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const { data } = await getCustomer({
          withAddress: true,
          withOrders: false
        });

        

        const customer = data?.customer;

        // if cartData?.chosenShippingMethods?.[0] starts with "pickup_location" then set deliveryMethod to DeliveryStepEnum.CLICK_AND_COLLECT, and set location to the pickup location
        const isPickupLocation = cartData?.chosenShippingMethods?.[0]?.startsWith("pickup_location");

        setFormData((prev) => ({
          ...prev,
          ...(isPickupLocation
            ? {
              location: cartData?.chosenShippingMethods?.[0] ?? "",
            }
            : {
              shippingMethod: cartData?.chosenShippingMethods?.[0] ?? "",
            }
          ),
          ...(customer ? {
            email: customer?.email ?? customer?.billing?.email ?? customer?.shipping?.email ?? "",
            billingAddress: {
              firstName: customer?.billing?.firstName ?? "",
              lastName: customer?.billing?.lastName ?? "",
              line1: customer?.billing?.address1 ?? "",
              line2: customer?.billing?.address2 ?? "",
              city: customer?.billing?.city ?? "",
              state: customer?.billing?.state ?? "",
              country: customer?.billing?.country ?? "",
              postalCode: customer?.billing?.postcode ?? "",
              phone: customer?.billing?.phone ?? "",
            },
            shippingAddress: {
              firstName: customer?.shipping?.firstName ?? "",
              lastName: customer?.shipping?.lastName ?? "",
              line1: customer?.shipping?.address1 ?? "",
              line2: customer?.shipping?.address2 ?? "",
              city: customer?.shipping?.city ?? "",
              state: customer?.shipping?.state ?? "",
              country: customer?.shipping?.country ?? "",
              postalCode: customer?.shipping?.postcode ?? "",
              phone: customer?.shipping?.phone ?? "",
            }
          } : {})
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomer();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadPickupLocations = async () => {
      try {
        setIsLoadingPickupLocations(true);
        const locations = await getPickupLocations();
        const filteredLocations = locations?.data?.pickupLocations?.nodes
          ?.filter((location) => location?.enabled)
          .map((location) => {
            return {
              name: location?.name ?? "",
              address: location?.address ?? "",
              city: location?.city ?? "",
              country: location?.country ?? "",
              countryCode: location?.countryCode ?? "",
              details: location?.details ?? "",
              enabled: location?.enabled ?? false,
              postcode: location?.postcode ?? "",
              shippingMethodId: location?.shippingMethodId ?? "",
              state: location?.state ?? "",
              stateCode: location?.stateCode ?? "",
            };
          }) ?? [];

        setPickupLocations(filteredLocations);
      } finally {
        setIsLoadingPickupLocations(false);
      }
    };
    loadPickupLocations();
  }, []);

  useEffect(() => {
    // If no pickup locations, force shipping to home and set initial location
    if (pickupLocations.length === 0) {
      setFormData(prev => ({
        ...prev,
        deliveryMethod: DeliveryStepEnum.SHIPPING_TO_HOME
      }));
    } else if (pickupLocations.length === 1) {
      // If only one location, automatically select it
      setFormData(prev => ({
        ...prev,
        location: pickupLocations[0].shippingMethodId
      }));
    }
  }, [pickupLocations]);

  const isStepCompleted = (step: CheckoutFormStepEnum) => {
    switch (step) {
      case CheckoutFormStepEnum.CONTACT:
        return !!formData.email;
      case CheckoutFormStepEnum.DELIVERY_METHOD:
        return !!formData.deliveryMethod;
              case CheckoutFormStepEnum.ADDRESS:
        return formData.deliveryMethod === DeliveryStepEnum.CLICK_AND_COLLECT
          ? !!formData.billingAddress?.line1
          : !!formData.shippingAddress?.line1;
      case CheckoutFormStepEnum.PAYMENT:
        return !!formData.paymentMethodId;
      default:
        return false;
    }
  };

  const handleStepNavigation = (step: CheckoutFormStepEnum) => {
    const stepIndex = availableSteps.indexOf(step);
    const currentStepIndex = availableSteps.indexOf(currentStep);

    if (isStepCompleted(step) || stepIndex === currentStepIndex + 1) {
      setCurrentStep(step);
    }
  };

  const handleNextStep = async (
    step: CheckoutFormStepEnum,
    data: Partial<FormData>
  ) => {
    const updatedFormData = { ...formData, ...data };
    setFormData(updatedFormData);
    
    const nextStepIndex = availableSteps.indexOf(step) + 1;
    if (nextStepIndex < availableSteps.length) {
      setCurrentStep(availableSteps[nextStepIndex]);
    } else if (!needsPayment && step === CheckoutFormStepEnum.ADDRESS) {
      // If no payment is needed and we're on the last step (ADDRESS), auto-submit the order
      await handleFreeOrderSubmit(updatedFormData);
    }
  };

  const getBriefValue = (step: CheckoutFormStepEnum) => {
    if (step === CheckoutFormStepEnum.CONTACT) {
      return formData.email;
    } else if (step === CheckoutFormStepEnum.DELIVERY_METHOD) {
      // if formData.deliveryMethod is click and collect, show formData.deliveryMethod and formData.location
      if (formData.deliveryMethod === DeliveryStepEnum.CLICK_AND_COLLECT) {
        const address = pickupLocations.find(location => location.shippingMethodId === formData.location);
        return `
          <span>
            <span>${formData.deliveryMethod}</span>
        <div class="flex flex-col">
          <span>${address?.address}</span>
          <span>${address?.city}, ${address?.state} ${address?.postcode} ${address?.country}</span>
        </div>
          </span>`;
      }
      // if formData.deliveryMethod is shipping to home, show formData.deliveryMethod and formData.shippingMethod
      if (formData.deliveryMethod === DeliveryStepEnum.SHIPPING_TO_HOME) {
        const address = formData.shippingAddress

        if (!address?.line1) return undefined;
        return `
          <span>
            <span>${formData.deliveryMethod}</span>
          <div class="flex flex-col">
          <span>${address.line1}</span>
          ${address.line2 ? `<span>${address.line2}</span>` : ''}
          <span>${address.city}, ${address.state} ${address.postalCode} ${address.country}</span>
        </div>
          </span>`;
      }

    } else if (step === CheckoutFormStepEnum.ADDRESS) {
      // if deliveryMethod is shipping to home, show shipping method from shippingRates
      if (formData.deliveryMethod === DeliveryStepEnum.SHIPPING_TO_HOME) {
        const shippingRate = cartData?.availableShippingMethods
          ?.flatMap(shipping => shipping?.rates?.filter(rate =>
            rate?.methodId !== "local_pickup" &&
            rate?.methodId !== "pickup_location"
          ) ?? [])
          .find(rate => rate?.id === formData.shippingMethod);
        return `
          <span>
            <span>${shippingRate?.label} / ${shippingRate?.cost ? currencyFormatter({ price: getFloatVal(shippingRate?.cost || "0") }) : 'Free'}</span>
          </span>
        `;
      }

      const address = formData.billingAddress

      if (!address?.line1) return undefined;

      return `
        <div class="flex flex-col">
          <span>${address.line1}</span>
          ${address.line2 ? `<span>${address.line2}</span>` : ''}
          <span>${address.city}, ${address.state} ${address.postalCode} ${address.country}</span>
        </div>
        </div>
      `;
    } else if (step === CheckoutFormStepEnum.PAYMENT) {
      return formData.paymentMethodId;
    }
    return undefined;
  };

  const handleFreeOrderSubmit = async (updatedFormData: FormData) => {
    // Submit order without payment for free orders
    return await handlePaymentSubmit({
      paymentMethod: "free_order",
      paymentStatus: "processing"
    }, updatedFormData);
  };

  const handlePaymentSubmit = async (data: {
    paymentMethod: string;
    transactionId?: string;
    paymentIntentId?: string;
    stripePaymentMethod?: string;
    paymentStatus?: "failed" | "processing" | "pending";
  }, overrideFormData?: FormData): Promise<{ success: boolean; error?: string }> => {


    const currentFormData = overrideFormData || formData;
    const checkoutData: { input: CheckoutInput } = {
      input: {
        clientMutationId: uuidv7(),
        paymentMethod: data.paymentMethod,
        transactionId: data?.transactionId,
        isPaid: data.paymentStatus === "processing",
        billing: currentFormData.billingAddress?.line1
          ? {
              firstName: currentFormData.billingAddress.firstName,
              lastName: currentFormData.billingAddress.lastName,
              address1: currentFormData.billingAddress.line1,
              address2: currentFormData.billingAddress.line2,
              city: currentFormData.billingAddress.city,
              state: currentFormData.billingAddress.state,
              postcode: currentFormData.billingAddress.postalCode,
              country: currentFormData.billingAddress.country as CountriesEnum,
              email: currentFormData.email,
              phone: currentFormData.billingAddress.phone,
            }
          : {
              firstName: currentFormData.shippingAddress?.firstName || "",
              lastName: currentFormData.shippingAddress?.lastName || "",
              address1: currentFormData.shippingAddress?.line1 || "",
              address2: currentFormData.shippingAddress?.line2,
              city: currentFormData.shippingAddress?.city || "",
              state: currentFormData.shippingAddress?.state || "",
              postcode: currentFormData.shippingAddress?.postalCode || "",
              country:
                (currentFormData.shippingAddress?.country as CountriesEnum) || "",
              email: currentFormData.email,
              phone: currentFormData.shippingAddress?.phone || "",
            },
        shipping: {
          firstName: currentFormData.shippingAddress?.firstName,
          lastName: currentFormData.shippingAddress?.lastName,
          address1: currentFormData.shippingAddress?.line1,
          address2: currentFormData.shippingAddress?.line2,
          city: currentFormData.shippingAddress?.city,
          state: currentFormData.shippingAddress?.state,
          postcode: currentFormData.shippingAddress?.postalCode,
          country: currentFormData.shippingAddress?.country as CountriesEnum,
          email: currentFormData.email,
          phone: currentFormData.shippingAddress?.phone,
        },
        metaData:
          data.paymentMethod === "headkit-payments"
            ? [
                {
                  key: "_stripe_intent_id",
                  value: data?.paymentIntentId ?? "",
                },
                {
                  key: "_stripe_charge_captured",
                  value: "yes",
                },
                {
                  key: "_stripe_payment_method",
                  value: data?.stripePaymentMethod ?? "",
                },
                {
                  key: "_headkit_payments_status",
                  value: data?.paymentStatus ?? "pending",
                },
                {
                  key: "_headkit_payment_mode",
                  value: isLiveMode ? "live" : "test",
                },
              ]
            : [],
      },
    };

    // save in cookies
    Cookies.set('checkoutData', JSON.stringify(checkoutData.input), { expires: 1 });

    try {
      const response = await checkout(checkoutData);

      const orderId = response.data?.checkout?.order?.databaseId;

      if (!orderId) {
        console.error("No order ID received from checkout");
        return { success: false, error: "No order ID received from checkout" };
      }

      // Update payment intent description and redirect to success page
      const shouldProcessPayment =
        (data.paymentStatus === "processing" &&
          data.paymentMethod === "headkit-payments") ||
        data.paymentMethod !== "headkit-payments";

      if (shouldProcessPayment && data.paymentIntentId) {
        try {
          await updatePaymentIntentDescription({
            paymentIntent: data.paymentIntentId,
            orderId: orderId.toString(),
          });
        } catch (updateError) {
          console.error("Update error:", updateError);
          // Don't throw here, allow checkout to continue
        }
      }

      // Only redirect to success page when payment is completed or for non-stripe payments
      const shouldRedirect =
        (data.paymentStatus === "processing" &&
          data.paymentMethod === "headkit-payments") ||
        data.paymentMethod !== "headkit-payments";

      if (shouldRedirect) {
        router.replace(`/checkout/success/${orderId}`);
      }

      return { success: true };
    } catch (error) {
      console.error("Checkout failed:", error);
      return { success: false, error: error instanceof Error ? error.message : "Checkout failed" };
    }
  };

  const LoadingSkeleton = () => (
    <div>
      {[1, 2, 3, 4].map((index) => (
        <div
          key={index}
          className="relative mb-2 px-5 py-5 md:px-10 md:py-5 rounded-md bg-white border"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-start gap-2">
              <Skeleton className="h-8 w-8 rounded-xl" />
              <Skeleton className="h-8 w-32 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <>
        <div className="mb-4">
          <Skeleton className="h-6 w-32" />
        </div>
        <LoadingSkeleton />
      </>
    );
  }

  const FormContent = () => (
    <div>
      {availableSteps.map((step, index) => (
        <AccordionWrapper
          key={step}
          order={index + 1}
          title={step === CheckoutFormStepEnum.ADDRESS
            ? (formData.deliveryMethod === DeliveryStepEnum.CLICK_AND_COLLECT
              ? 'Billing'
              : 'Shipping Options')
            : step}
          isActive={currentStep === step}
          isCompleted={isStepCompleted(step)}
          clickable={isStepCompleted(step) ||
            availableSteps.indexOf(step) <=
            availableSteps.indexOf(currentStep)}
          handleAccordionClick={() => handleStepNavigation(step)}
          briefValue={getBriefValue(step)}
        >
          {step === CheckoutFormStepEnum.CONTACT && (
            <ContactFormStep
              enableStripe={!!stripe}
              onNext={(data) =>
                handleNextStep(CheckoutFormStepEnum.CONTACT, data)
              }
              defaultValues={{ email: formData.email, newsletter: formData.newsletter }}
              buttonLabel="Continue To Delivery"
            />
          )}
          {step === CheckoutFormStepEnum.DELIVERY_METHOD && (
            <DeliveryMethodStep
              enableStripe={!!stripe}
              onNext={(data) =>
                handleNextStep(CheckoutFormStepEnum.DELIVERY_METHOD, data)
              }
              defaultValues={{
                deliveryMethod: formData.deliveryMethod,
                location: formData.location,
                shippingAddress: formData.shippingAddress,
              }}
              onChange={({ deliveryMethod }) => {
                setFormData((prev) => ({ ...prev, deliveryMethod }));
              }}
              buttonLabel={`Continue To ${formData.deliveryMethod === DeliveryStepEnum.CLICK_AND_COLLECT ? 'Billing' : 'Shipping Options'}`}
              pickupLocations={pickupLocations}
              isLoading={isLoadingPickupLocations}
            />
          )}
          {step === CheckoutFormStepEnum.ADDRESS && (
            <>
              {formData.deliveryMethod ===
                DeliveryStepEnum.CLICK_AND_COLLECT ? (
                <BillingAddressStep
                  enableStripe={!!stripe}
                  onNext={(data) =>
                    handleNextStep(CheckoutFormStepEnum.ADDRESS, data)
                  }
                  defaultValues={{
                    billingAddress: formData.billingAddress ?? {
                      firstName: "",
                      lastName: "",
                      line1: "",
                      line2: "",
                      city: "",
                      state: "",
                      country: "",
                      postalCode: "",
                      phone: "",
                    },
                  }}
                  buttonLabel={needsPayment ? "Continue To Payment" : "Complete Order"}
                />
              ) : (
                <ShippingOptionsStep
                  onNext={(data) =>
                    handleNextStep(CheckoutFormStepEnum.ADDRESS, data)
                  }
                  buttonLabel={needsPayment ? "Continue To Payment" : "Complete Order"}
                />
              )}
            </>
          )}
          {step === CheckoutFormStepEnum.PAYMENT && (
            <PaymentStep
              enableStripe={!!stripe}
              onSubmit={handlePaymentSubmit}
              buttonLabel={`Pay ${currencyFormatter({ price: getFloatVal(cartData?.total || "0") })}`}
            />
          )}
        </AccordionWrapper>
      ))}
    </div>
  );

  return (
    <>
      {!!stripe ? (
        <Elements
          stripe={stripe}
          options={{
            mode: "payment",
            payment_method_types: cartData?.needsShippingAddress ? [] : ["card", "link"],
            amount:
              getFloatVal(cartData?.total ?? "0") > 0
                ? Math.round(getFloatVal(cartData?.total ?? "0") * 100)
                : 9900,
            currency: "aud",
            fonts: [
              {
                cssSrc:
                  "https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,100..900&display=swap",
              },
            ],
            appearance: {
              theme: "flat",
              variables: {
                borderRadius: "6px",
                focusBoxShadow: "none",
                colorPrimary: "#9572C0",
                colorBackground: "#FFFFFF",
                colorText: "#23102E",
                colorDanger: "#A81059",
                fontFamily: "urbanist, sans-serif",
                colorTextPlaceholder: "#76766B",
              },
              rules: {
                ".Input": {
                  padding: "11px 10px",
                  outline: "1px solid #9572C0",
                },
                ".Input:focus": {
                  outline: "2px solid #7F54B3",
                  backgroundColor: "#F9FFEB",
                  fontWeight: "500",
                },
                ".Input.Input--invalid": {
                  outline: "2px solid #E01577",
                },
              },
            },
          }}
        >
          <div className="mb-4">
            <ExpressCheckout
              singleCheckout={false}
              disabled={false}
              price={getFloatVal(cartData?.total || "0")}
            />
          </div>
          <FormContent />
        </Elements>
      ) : (
        <FormContent />
      )}
    </>
  );
};

export { CheckoutForm };

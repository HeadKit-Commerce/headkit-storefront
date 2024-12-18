"use client";

import { useState, useMemo, useEffect } from "react";
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
  StripeConfig,
} from "@/lib/headkit/generated";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { getFloatVal } from "@/lib/utils";
import { useAppContext } from "../context/app-context";
import { checkout, getCustomer } from "@/lib/headkit/actions";
import { v7 as uuidv7 } from "uuid";
import { useRouter } from "next/navigation";

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

interface Props {
  stripeConfig: StripeConfig | null;
}

const getStripeEnabled = (config: StripeConfig | null) => !!(
  config?.publishableKey && config?.accountId
);

const getStripePromise = (config: StripeConfig | null) => {
  const enabled = getStripeEnabled(config);
  return enabled
    ? loadStripe(config!.publishableKey, {
      stripeAccount: config!.accountId,
    })
    : null;
};

const CheckoutForm = ({ stripeConfig }: Props) => {
  const router = useRouter();
  const { cartData } = useAppContext();
  const [currentStep, setCurrentStep] = useState<CheckoutFormStepEnum>(
    CheckoutFormStepEnum.CONTACT
  );
  const [formData, setFormData] = useState<FormData>({
    email: "",
    newsletter: false,
    deliveryMethod: DeliveryStepEnum.CLICK_AND_COLLECT,
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
  const [stripeEnabled, setStripeEnabled] = useState(true);

  const enableStripe = useMemo(
    () => stripeEnabled && getStripeEnabled(stripeConfig),
    [stripeEnabled, stripeConfig]
  );
  const stripePromise = useMemo(() => getStripePromise(stripeConfig), [stripeConfig]);

  useEffect(() => {
    const fetchCustomer = async () => {
      const { data: { customer } } = await getCustomer({
        withAddress: true,
        withOrders: false
      });

      console.log("customer", customer);

      setFormData((prev) => ({
        ...prev,
        location: cartData?.chosenShippingMethods?.[0] ?? "",
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
    };

    fetchCustomer();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const stepIndex = Object.values(CheckoutFormStepEnum).indexOf(step);
    const currentStepIndex = Object.values(CheckoutFormStepEnum).indexOf(currentStep);

    if (isStepCompleted(step) || stepIndex === currentStepIndex + 1) {
      setCurrentStep(step);
    }
  };

  const handleNextStep = (
    step: CheckoutFormStepEnum,
    data: Partial<FormData>
  ) => {
    setFormData((prev) => ({ ...prev, ...data }));
    const steps = Object.values(CheckoutFormStepEnum);
    const nextStepIndex = steps.indexOf(step) + 1;
    if (nextStepIndex < steps.length) {
      setCurrentStep(steps[nextStepIndex]);
    }
  };

  const getBriefValue = (step: CheckoutFormStepEnum) => {
    if (step === CheckoutFormStepEnum.CONTACT) {
      return formData.email;
    } else if (step === CheckoutFormStepEnum.DELIVERY_METHOD) {
      return formData.deliveryMethod;
    } else if (step === CheckoutFormStepEnum.ADDRESS) {
      const address = formData.deliveryMethod === DeliveryStepEnum.CLICK_AND_COLLECT
        ? formData.billingAddress
        : formData.shippingAddress;
      
      if (!address?.line1) return undefined;

      return [
        `${address.firstName} ${address.lastName}`,
        address.line1,
        address.line2,
        `${address.city}, ${address.state} ${address.postalCode}`,
        address.country,
        address.phone
      ].filter(Boolean).join(', ');
    } else if (step === CheckoutFormStepEnum.PAYMENT) {
      return formData.paymentMethodId;
    }
    return undefined;
  };

  const handlePaymentSubmit = async (data: {
    paymentMethod: string;
    transactionId?: string;
    paymentIntentId?: string;
    stripePaymentMethod?: string;
  }) => {
    const checkoutData: { input: CheckoutInput } = {
      input: {
        clientMutationId: uuidv7(),
        paymentMethod: data.paymentMethod,
        transactionId: data?.transactionId,
        isPaid: data.paymentMethod === "stripe" && !!data.paymentIntentId,
        billing: {
          firstName: formData.billingAddress?.firstName,
          lastName: formData.billingAddress?.lastName,
          address1: formData.billingAddress?.line1,
          address2: formData.billingAddress?.line2,
          city: formData.billingAddress?.city,
          state: formData.billingAddress?.state,
          postcode: formData.billingAddress?.postalCode,
          country: formData.billingAddress?.country as CountriesEnum,
          email: formData.email,
          phone: formData.billingAddress?.phone,
        },
        shipping: {
          firstName: formData.shippingAddress?.firstName,
          lastName: formData.shippingAddress?.lastName,
          address1: formData.shippingAddress?.line1,
          address2: formData.shippingAddress?.line2,
          city: formData.shippingAddress?.city,
          state: formData.shippingAddress?.state,
          postcode: formData.shippingAddress?.postalCode,
          country: formData.shippingAddress?.country as CountriesEnum,
          email: formData.email,
          phone: formData.shippingAddress?.phone,
        },
        metaData:
          data.paymentMethod === "stripe"
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
            ]
            : [],
      },
    };

    console.log("Payment Completed:", checkoutData);
    // Add your checkout action here
    const response = await checkout(checkoutData);
    console.log("data", response.data);
    console.log("error", response.errors);

    router.replace(
      `/checkout/success/${response.data.checkout?.order?.databaseId}`
    );
  };

  // log when formData changes
  useEffect(() => {
    console.log("formData", formData);
  }, [formData]);

  const FormContent = () => (
    <div>
      {Object.values(CheckoutFormStepEnum).map((step, index) => (
        <AccordionWrapper
          key={step}
          order={index + 1}
          title={step === CheckoutFormStepEnum.ADDRESS
            ? (formData.deliveryMethod === DeliveryStepEnum.CLICK_AND_COLLECT
              ? 'Billing Address'
              : 'Shipping Method')
            : step}
          isActive={currentStep === step}
          isCompleted={isStepCompleted(step)}
          clickable={isStepCompleted(step) ||
            Object.values(CheckoutFormStepEnum).indexOf(step) <=
            Object.values(CheckoutFormStepEnum).indexOf(currentStep)}
          handleAccordionClick={() => handleStepNavigation(step)}
          briefValue={getBriefValue(step)}
        >
          {step === CheckoutFormStepEnum.CONTACT && (
            <ContactFormStep
              enableStripe={enableStripe}
              onNext={(data) =>
                handleNextStep(CheckoutFormStepEnum.CONTACT, data)
              }
              defaultValues={{ email: formData.email, newsletter: formData.newsletter }}
              buttonLabel="Next"
            />
          )}
          {step === CheckoutFormStepEnum.DELIVERY_METHOD && (
            <DeliveryMethodStep
              enableStripe={enableStripe}
              onNext={(data) =>
                handleNextStep(CheckoutFormStepEnum.DELIVERY_METHOD, data)
              }
              defaultValues={{
                deliveryMethod: formData.deliveryMethod,
                location: formData.location,
                shippingAddress: formData.shippingAddress,
              }}
              buttonLabel="Next"
            />
          )}
          {step === CheckoutFormStepEnum.ADDRESS && (
            <>
              {formData.deliveryMethod ===
                DeliveryStepEnum.CLICK_AND_COLLECT ? (
                <BillingAddressStep
                  enableStripe={enableStripe}
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
                  buttonLabel="Next"
                />
              ) : (
                <ShippingOptionsStep
                  onNext={(data) =>
                    handleNextStep(CheckoutFormStepEnum.ADDRESS, data)
                  }
                  buttonLabel="Next"
                />
              )}
            </>
          )}
          {step === CheckoutFormStepEnum.PAYMENT && (
            <PaymentStep
              enableStripe={enableStripe}
              onSubmit={handlePaymentSubmit}
              buttonLabel="Pay Now"
            />
          )}
        </AccordionWrapper>
      ))}
    </div>
  );

  return (
    <>
      <div className="mb-4 flex items-center gap-2">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={stripeEnabled}
            onChange={(e) => setStripeEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
        </label>
        <span className="text-sm font-medium text-gray-900">
          {stripeEnabled ? 'Stripe Enabled' : 'Stripe Disabled'}
        </span>
      </div>

      {enableStripe ? (
        <Elements
          stripe={stripePromise}
          options={{
            mode: "payment",
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
          <FormContent />
        </Elements>
      ) : (
        <FormContent />
      )}
    </>
  );
};

export { CheckoutForm };

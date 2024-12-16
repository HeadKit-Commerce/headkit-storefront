"use client";

import { useState } from "react";
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
import { checkout } from "@/lib/headkit/actions";
import { v7 as uuidv7 } from "uuid";
import { useRouter } from "next/navigation";

interface FormData {
  firstName: string;
  lastName: string;
  email?: string;
  newsletter?: boolean;
  deliveryMethod?: DeliveryStepEnum;
  location?: string;
  address?: {
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
    firstName: "",
    lastName: "",
    address: {
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

  const enableStripe = !!(
    stripeConfig?.publishableKey && stripeConfig?.accountId
  );

  const stripePromise = enableStripe
    ? loadStripe(stripeConfig.publishableKey, {
        stripeAccount: stripeConfig.accountId,
      })
    : null;

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
      return formData.address?.line1;
    } else if (step === CheckoutFormStepEnum.PAYMENT) {
      return formData.paymentMethodId;
    }
    return undefined;
  };

  const handlePaymentSubmit = async (data: {
    paymentMethod: string;
    transactionId: string;
    paymentIntentId?: string;
    stripePaymentMethod?: string;
  }) => {
    const checkoutData: { input: CheckoutInput } = {
      input: {
        clientMutationId: uuidv7(),
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
        isPaid: true,
        billing: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address1: formData.address?.line1,
          address2: formData.address?.line2,
          city: formData.address?.city,
          state: formData.address?.state,
          postcode: formData.address?.postalCode,
          country: formData.address?.country as CountriesEnum,
          email: formData.email,
          phone: formData.address?.phone,
        },
        shipping: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address1: formData.address?.line1,
          address2: formData.address?.line2,
          city: formData.address?.city,
          state: formData.address?.state,
          postcode: formData.address?.postalCode,
          country: formData.address?.country as CountriesEnum,
          email: formData.email,
          phone: formData.address?.phone,
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

  const FormContent = () => (
    <div>
      {Object.values(CheckoutFormStepEnum).map((step, index) => (
        <AccordionWrapper
          key={step}
          order={index + 1}
          title={step}
          isActive={currentStep === step}
          isCompleted={
            Object.values(CheckoutFormStepEnum).indexOf(step) <
            Object.values(CheckoutFormStepEnum).indexOf(currentStep)
          }
          clickable={
            Object.values(CheckoutFormStepEnum).indexOf(step) <
            Object.values(CheckoutFormStepEnum).indexOf(currentStep)
          }
          handleAccordionClick={() => setCurrentStep(step)}
          briefValue={getBriefValue(step)}
        >
          {step === CheckoutFormStepEnum.CONTACT && (
            <ContactFormStep
              enableStripe={enableStripe}
              onNext={(data) =>
                handleNextStep(CheckoutFormStepEnum.CONTACT, data)
              }
              defaultValues={{ email: formData.email }}
              buttonLabel="Next"
            />
          )}
          {step === CheckoutFormStepEnum.DELIVERY_METHOD && (
            <DeliveryMethodStep
              enableStripe={enableStripe}
              onSelect={(data) =>
                handleNextStep(CheckoutFormStepEnum.DELIVERY_METHOD, data)
              }
              defaultValues={{
                deliveryMethod: formData.deliveryMethod,
                location: formData.location,
                address: formData.address,
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
                  defaultValues={formData.address}
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

  return enableStripe ? (
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
  );
};

export { CheckoutForm };

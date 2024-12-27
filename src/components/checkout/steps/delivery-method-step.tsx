import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DeliveryStepEnum } from "../utils";
import { AddressElement } from "@stripe/react-stripe-js";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  getPickupLocations,
  updateShippingMethod,
  updateCustomer,
} from "@/lib/headkit/actions";
import { CountriesEnum } from "@/lib/headkit/generated";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const deliverySchema = z.object({
  deliveryMethod: z.enum([
    DeliveryStepEnum.CLICK_AND_COLLECT,
    DeliveryStepEnum.SHIPPING_TO_HOME,
  ]).optional(),
  location: z.string().optional(),
  shippingAddress: z.object({
    firstName: z.string().min(1, "First Name is required"),
    lastName: z.string().min(1, "Last Name is required"),
    line1: z.string().min(1, "Address Line 1 is required"),
    line2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
    postalCode: z.string().min(1, "Postal Code is required"),
    phone: z.string().min(1, "Phone is required"),
  }).optional(),
}).superRefine((data, ctx) => {
  if (!data.deliveryMethod) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please select a delivery method",
    });
  }
  if (data.deliveryMethod === DeliveryStepEnum.CLICK_AND_COLLECT && !data.location) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Pickup location is required for Click & Collect",
    });
  }
  // make sure shippingAddress is required if deliveryMethod is SHIPPING_TO_HOME
  if (data.deliveryMethod === DeliveryStepEnum.SHIPPING_TO_HOME && !data.shippingAddress) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Shipping address is required for Ship to Home",
    });
  }
});

interface DeliveryMethodStepProps {
  onChange: (data: z.infer<typeof deliverySchema>) => void;
  onNext: (data: z.infer<typeof deliverySchema>) => void;
  defaultValues?: Partial<z.infer<typeof deliverySchema>>;
  buttonLabel?: string;
  enableStripe?: boolean;
}

const DeliveryMethodStep: React.FC<DeliveryMethodStepProps> = ({
  onChange,
  onNext,
  defaultValues,
  buttonLabel = "Next",
  enableStripe = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const form = useForm<z.infer<typeof deliverySchema>>({
    resolver: zodResolver(deliverySchema),
    defaultValues,
  });

  const deliveryMethod = form.watch("deliveryMethod");

  useEffect(() => {
    if (deliveryMethod === DeliveryStepEnum.CLICK_AND_COLLECT) {
      form.setValue("shippingAddress", undefined);
    } else {
      form.setValue("location", undefined);
    }
  }, [deliveryMethod, form]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "deliveryMethod") {
        onChange({
          deliveryMethod: value.deliveryMethod,
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onChange]);

  const onSubmit = async (data: z.infer<typeof deliverySchema>) => {
    try {
      setIsSubmitting(true);

      // Update shipping method
      const shippingMethodResult = await updateShippingMethod({
        shippingMethod:
          data.deliveryMethod === DeliveryStepEnum.CLICK_AND_COLLECT
            ? data.location ?? ""
            : "",
      });
      if (shippingMethodResult?.errors) {
        console.error(shippingMethodResult?.errors);
        return;
      }

      // Update customer shipping address if shipping to home
      if (data.deliveryMethod === DeliveryStepEnum.SHIPPING_TO_HOME && data.shippingAddress) {
        const customerResult = await updateCustomer({
          input: {
            shipping: {
              firstName: data.shippingAddress.firstName,
              lastName: data.shippingAddress.lastName,
              address1: data.shippingAddress.line1,
              address2: data.shippingAddress.line2 || "",
              city: data.shippingAddress.city,
              state: data.shippingAddress.state,
              postcode: data.shippingAddress.postalCode,
              country: data.shippingAddress.country as CountriesEnum,
              phone: data.shippingAddress.phone,
            }
          },
          withCart: true
        });

        if (customerResult?.errors) {
          console.error(customerResult?.errors);
          return;
        }
      }

      onNext(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [pickupLocations, setPickupLocations] = useState<
    {
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
    }[]
  >([]);

  useEffect(() => {
    const loadPickupLocations = async () => {
      try {
        setIsLoading(true);
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

        // If no pickup locations, force shipping to home and set initial location
        if (filteredLocations.length === 0) {
          form.setValue("deliveryMethod", DeliveryStepEnum.SHIPPING_TO_HOME, { shouldValidate: true });
        } else if (filteredLocations.length === 1) {
          // If only one location, automatically select it
          form.setValue("location", filteredLocations[0].shippingMethodId, { shouldValidate: true });
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadPickupLocations();
  }, [form]);

  if (isLoading) {
    return <div className="text-center min-h-[200px] flex items-center justify-center bg-white/50"> <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {pickupLocations.length > 0 && (
          <FormField
            name="deliveryMethod"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>How would you like to receive your order?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid md:grid-cols-2 gap-4"
                  >
                    {pickupLocations.length > 0 && (
                      <FormLabel htmlFor="click-collect" className={cn(
                        "flex items-center space-x-2 cursor-pointer h-[40px] px-[16px] border rounded-[6px]",
                        field.value === DeliveryStepEnum.CLICK_AND_COLLECT && "border-purple-500"
                      )}>
                        <RadioGroupItem
                          value={DeliveryStepEnum.CLICK_AND_COLLECT}
                          id="click-collect"
                        />
                        <span className="font-normal">Free Click & Collect</span>
                      </FormLabel>
                    )}
                    <FormLabel htmlFor="ship-home" className={cn(
                      "flex items-center space-x-2 cursor-pointer h-[40px] px-[16px] border rounded-[6px]",
                      field.value === DeliveryStepEnum.SHIPPING_TO_HOME && "border-purple-500"
                    )}>
                      <RadioGroupItem
                        value={DeliveryStepEnum.SHIPPING_TO_HOME}
                        id="ship-home"
                      />
                      <span className="font-normal">Ship to Home</span>
                    </FormLabel>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {form.watch("deliveryMethod") === DeliveryStepEnum.CLICK_AND_COLLECT && (
          <FormField
            name="location"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select your store to collect from</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col gap-3"
                  >
                    {pickupLocations.map((location) => (
                      <div
                        key={location.shippingMethodId}
                        className="flex items-center space-x-2 cursor-pointer w-fit"
                      >
                        <RadioGroupItem
                          value={location.shippingMethodId}
                          id={location.shippingMethodId}
                        />
                        <FormLabel
                          htmlFor={location.shippingMethodId}
                          className="font-normal"
                        >
                          <div>
                            <div className="font-medium">{location.name}</div>
                            <div className="text-sm text-gray-500">
                              {location.address}, {location.city}{" "}
                              {location.postcode}
                            </div>
                          </div>
                        </FormLabel>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {form.watch("deliveryMethod") === DeliveryStepEnum.SHIPPING_TO_HOME && (
          enableStripe ? (
            <AddressElement
              key={form.watch("deliveryMethod")}
              options={{
                mode: "shipping",
                allowedCountries: ["AU", "TH"],
                fields: {
                  phone: "always",
                },
                validation: {
                  phone: {
                    required: "always",
                  },
                },
                display: {
                  name: "split",
                },
                defaultValues: {
                  firstName: form.getValues("shippingAddress.firstName") || "",
                  lastName: form.getValues("shippingAddress.lastName") || "",
                  address: {
                    line1: form.getValues("shippingAddress.line1") || "",
                    line2: form.getValues("shippingAddress.line2") || "",
                    city: form.getValues("shippingAddress.city") || "",
                    state: form.getValues("shippingAddress.state") || "",
                    country: form.getValues("shippingAddress.country") || "",
                    postal_code: form.getValues("shippingAddress.postalCode") || "",
                  },
                  phone: form.getValues("shippingAddress.phone") || "",
                },
              }}
              onChange={(event) => {
                if (event.complete) {
                  const { address, phone, firstName, lastName } = event.value;
                  // Set and validate each field individually
                  form.setValue("shippingAddress.firstName", firstName || "", { shouldValidate: true });
                  form.setValue("shippingAddress.lastName", lastName || "", { shouldValidate: true });
                  form.setValue("shippingAddress.line1", address.line1 || "", { shouldValidate: true });
                  form.setValue("shippingAddress.line2", address.line2 || "", { shouldValidate: true });
                  form.setValue("shippingAddress.city", address.city || "", { shouldValidate: true });
                  form.setValue("shippingAddress.postalCode", address.postal_code || "", { shouldValidate: true });
                  form.setValue("shippingAddress.state", address.state || "", { shouldValidate: true });
                  form.setValue("shippingAddress.country", address.country || "", { shouldValidate: true });
                  form.setValue("shippingAddress.phone", phone || "", { shouldValidate: true });
                }
              }}
            />
          ) : (
            // Fallback address form fields
            <>
              <FormField
                name="shippingAddress.firstName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <input type="text" placeholder="First Name" className="border rounded-md p-2 w-full" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="shippingAddress.lastName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <input type="text" placeholder="Last Name" className="border rounded-md p-2 w-full" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="shippingAddress.line1"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <input
                        type="text"
                        placeholder="Address Line 1"
                        className="border rounded-md p-2 w-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="shippingAddress.line2"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2</FormLabel>
                    <FormControl>
                      <input
                        type="text"
                        placeholder="Address Line 2"
                        className="border rounded-md p-2 w-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="shippingAddress.city"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <input
                        type="text"
                        placeholder="City"
                        className="border rounded-md p-2 w-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="shippingAddress.state"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <input
                        type="text"
                        placeholder="State"
                        className="border rounded-md p-2 w-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="shippingAddress.country"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <input
                        type="text"
                        placeholder="Country"
                        className="border rounded-md p-2 w-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="shippingAddress.postalCode"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <input
                        type="text"
                        placeholder="Postal Code"
                        className="border rounded-md p-2 w-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="shippingAddress.phone"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <input type="text" placeholder="Phone" className="border rounded-md p-2 w-full" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={!form.formState.isValid || isSubmitting}
          loading={isSubmitting}
          rightIcon="arrowRight"
        >
          {buttonLabel}
        </Button>
      </form>
    </Form>
  );
};

export { DeliveryMethodStep }; 

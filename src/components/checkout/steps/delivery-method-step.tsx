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
} from "@/lib/headkit/actions";

const deliverySchema = z.object({
  deliveryMethod: z.enum([
    DeliveryStepEnum.CLICK_AND_COLLECT,
    DeliveryStepEnum.SHIPPING_TO_HOME,
  ]),
  location: z.string().optional(),
  shippingAddress: z.union([
    z.undefined(),
    z.object({
      firstName: z.string().min(1, "First Name is required"),
      lastName: z.string().min(1, "Last Name is required"),
      line1: z.string().min(1, "Address Line 1 is required"),
      line2: z.string().optional(),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      country: z.string().min(1, "Country is required"),
      postalCode: z.string().min(1, "Postal Code is required"),
      phone: z.string().min(1, "Phone is required"),
    }),
  ]),
});

interface DeliveryMethodStepProps {
  onNext: (data: z.infer<typeof deliverySchema>) => void;
  defaultValues?: Partial<z.infer<typeof deliverySchema>>;
  buttonLabel?: string;
  enableStripe?: boolean;
}

const DeliveryMethodStep: React.FC<DeliveryMethodStepProps> = ({
  onNext,
  defaultValues = { deliveryMethod: DeliveryStepEnum.CLICK_AND_COLLECT },
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
    }
    form.trigger();
  }, [deliveryMethod, form]);

  const onSubmit = async (data: z.infer<typeof deliverySchema>) => {
    try {
      setIsSubmitting(true);
      const result = await updateShippingMethod({
        shippingMethod:
          data.deliveryMethod === DeliveryStepEnum.CLICK_AND_COLLECT
            ? data.location ?? ""
            : "",
      });
      if (result?.errors) {
        console.error(result?.errors);
        return;
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
        
        if (filteredLocations.length === 0) {
          form.setValue("deliveryMethod", DeliveryStepEnum.SHIPPING_TO_HOME);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadPickupLocations();
  }, [form]);

  if (isLoading) {
    return <div className="text-center min-h-[200px] flex items-center justify-center">Loading delivery options...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          name="deliveryMethod"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery Method</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex gap-6"
                >
                  {pickupLocations.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={DeliveryStepEnum.CLICK_AND_COLLECT}
                        id="click-collect"
                      />
                      <FormLabel htmlFor="click-collect" className="font-normal">
                        Free Click & Collect
                      </FormLabel>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={DeliveryStepEnum.SHIPPING_TO_HOME}
                      id="ship-home"
                    />
                    <FormLabel htmlFor="ship-home" className="font-normal">
                      Ship to Home
                    </FormLabel>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("deliveryMethod") === DeliveryStepEnum.CLICK_AND_COLLECT ? (
          <FormField
            name="location"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pickup Location</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col gap-3"
                  >
                    {pickupLocations.map((location) => (
                      <div
                        key={location.shippingMethodId}
                        className="flex items-center space-x-2"
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
        ) : // SHIPPING_TO_HOME
        enableStripe ? (
          <AddressElement
            key={form.watch("deliveryMethod")}
            options={{
              mode: "shipping",
              allowedCountries: ["AU"],
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
            }}
            onChange={(event) => {
              if (event.complete) {
                const { address, phone } = event.value;
                form.setValue("shippingAddress.line1", address.line1 || "");
                form.setValue("shippingAddress.line2", address.line2 || "");
                form.setValue("shippingAddress.city", address.city || "");
                form.setValue("shippingAddress.postalCode", address.postal_code || "");
                form.setValue("shippingAddress.state", address.state || "");
                form.setValue("shippingAddress.country", address.country || "");
                form.setValue("shippingAddress.phone", phone || "");
              }
            }}
          />
        ) : (
          // Fallback address form fields
          <>
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
        )}
        <Button
          type="submit"
          className="w-full"
          disabled={!form.formState.isValid || isSubmitting}
          loading={isSubmitting}
        >
          {buttonLabel}
        </Button>
      </form>
    </Form>
  );
};

export { DeliveryMethodStep }; 

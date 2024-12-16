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
  address: z
    .object({
      line1: z.string().min(1, "Address Line 1 is required"),
      line2: z.string().optional(),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      country: z.string().min(1, "Country is required"),
      postalCode: z.string().min(1, "Postal Code is required"),
      phone: z.string().min(1, "Phone is required"),
    })
    .optional(),
});

interface DeliveryMethodStepProps {
  onSelect: (data: z.infer<typeof deliverySchema>) => void;
  defaultValues?: Partial<z.infer<typeof deliverySchema>>;
  buttonLabel?: string;
  enableStripe?: boolean;
}

const DeliveryMethodStep: React.FC<DeliveryMethodStepProps> = ({
  onSelect,
  defaultValues = { deliveryMethod: DeliveryStepEnum.CLICK_AND_COLLECT },
  buttonLabel = "Next",
  enableStripe = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof deliverySchema>>({
    resolver: zodResolver(deliverySchema),
    defaultValues,
  });

  const deliveryMethod = form.watch("deliveryMethod");

  useEffect(() => {
    if (deliveryMethod === DeliveryStepEnum.CLICK_AND_COLLECT) {
      form.setValue("address", undefined);
    }
  }, [deliveryMethod, form]);

  const onSubmit = async (data: z.infer<typeof deliverySchema>) => {
    try {
      console.log("data", data);
      setIsSubmitting(true);
      const result = await updateShippingMethod({
        shippingMethod:
          data.deliveryMethod === DeliveryStepEnum.CLICK_AND_COLLECT
            ? data.location ?? ""
            : "",
      });
      console.log("result", result);
      if (result?.errors) {
        console.error(result?.errors);
        return;
      }
      onSelect(data);
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
      const locations = await getPickupLocations();
      setPickupLocations(
        locations?.data?.pickupLocations?.nodes
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
          }) ?? []
      );
    };
    loadPickupLocations();
  }, []);

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
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={DeliveryStepEnum.CLICK_AND_COLLECT}
                      id="click-collect"
                    />
                    <FormLabel htmlFor="click-collect" className="font-normal">
                      Free Click & Collect
                    </FormLabel>
                  </div>
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
                const { address } = event.value;
                form.setValue("address.line1", address.line1 || "");
                form.setValue("address.line2", address.line2 || "");
                form.setValue("address.city", address.city || "");
                form.setValue("address.postalCode", address.postal_code || "");
                form.setValue("address.state", address.state || "");
                form.setValue("address.country", address.country || "");
              }
            }}
          />
        ) : (
          // Fallback address form fields
          <>
            <FormField
              name="address.line1"
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
              name="address.line2"
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
              name="address.city"
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
              name="address.state"
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
              name="address.country"
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
              name="address.postalCode"
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

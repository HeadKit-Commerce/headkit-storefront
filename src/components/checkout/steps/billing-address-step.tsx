import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddressElement } from "@stripe/react-stripe-js";
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

const addressSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  address: z.object({
    line1: z.string().min(1, "Address Line 1 is required"),
    line2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
    postalCode: z.string().min(1, "Postal Code is required"),
    phone: z.string().min(1, "Phone is required"),
  }),
});

interface BillingAddressStepProps {
  enableStripe: boolean;
  onNext: (data: { address: z.infer<typeof addressSchema>["address"] }) => void;
  defaultValues?: z.infer<typeof addressSchema>["address"];
  buttonLabel?: string;
}

const BillingAddressStep: React.FC<BillingAddressStepProps> = ({
  enableStripe,
  onNext,
  defaultValues = {
    line1: "",
    line2: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  },
  buttonLabel = "Next",
}) => {
  const form = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: { address: defaultValues },
  });

  const onSubmit = (data: z.infer<typeof addressSchema>) => {
    console.log("data", data);
    onNext(data);
  };

  if (enableStripe) {
    return (
      <div>
        <AddressElement
          options={{
            mode: "billing",
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
            if (event.complete && event.value) {
              console.log("event", event);
              form.setValue("firstName", event.value.firstName ?? "");
              form.setValue("lastName", event.value.lastName ?? "");
              form.setValue("address", {
                line1: event.value.address.line1,
                line2: event.value.address.line2 ?? undefined,
                city: event.value.address.city,
                state: event.value.address.state,
                country: event.value.address.country,
                postalCode: event.value.address.postal_code,
                phone: event.value.phone ?? "",
              });
              form.trigger();
            }
          }}
        />
        <Button
          type="submit"
          className="w-full mt-4"
          disabled={!form.formState.isValid}
          onClick={form.handleSubmit(onSubmit)}
        >
          {buttonLabel}
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <FormLabel>Address Line 2 (Optional)</FormLabel>
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
        <div className="grid grid-cols-2 gap-4">
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
        </div>
        <div className="grid grid-cols-2 gap-4">
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
          <FormField
            name="address.phone"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <input
                    type="text"
                    placeholder="Phone"
                    className="border rounded-md p-2 w-full"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full">
          {buttonLabel}
        </Button>
      </form>
    </Form>
  );
};

export { BillingAddressStep };

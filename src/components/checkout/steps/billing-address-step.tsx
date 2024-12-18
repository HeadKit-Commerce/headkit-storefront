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
  billingAddress: z.object({
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
});

interface BillingAddressStepProps {
  enableStripe: boolean;
  onNext: (data: z.infer<typeof addressSchema>) => void;
  defaultValues?: z.infer<typeof addressSchema>;
  buttonLabel?: string;
}

const BillingAddressStep: React.FC<BillingAddressStepProps> = ({
  enableStripe,
  onNext,
  defaultValues = {
    billingAddress: {
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
  },
  buttonLabel = "Next",
}) => {
  const form = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues,
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
          }}
          onChange={(event) => {
            if (event.complete && event.value) {
              console.log("event", event);
              form.setValue("billingAddress.firstName", event.value.firstName ?? "");
              form.setValue("billingAddress.lastName", event.value.lastName ?? "");
              form.setValue("billingAddress.line1", event.value.address.line1);
              form.setValue("billingAddress.line2", event.value.address.line2 ?? undefined);
              form.setValue("billingAddress.city", event.value.address.city);
              form.setValue("billingAddress.state", event.value.address.state);
              form.setValue("billingAddress.country", event.value.address.country);
              form.setValue("billingAddress.postalCode", event.value.address.postal_code);
              form.setValue("billingAddress.phone", event.value.phone ?? "");
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
          name="billingAddress.firstName"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <input
                  type="text"
                  placeholder="First Name"
                  className="border rounded-md p-2 w-full"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="billingAddress.lastName"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <input
                  type="text"
                  placeholder="Last Name"
                  className="border rounded-md p-2 w-full"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <FormField
          name="billingAddress.line1"
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
          name="billingAddress.line2"
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
            name="billingAddress.city"
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
            name="billingAddress.state"
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
            name="billingAddress.country"
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
            name="billingAddress.postalCode"
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
            name="billingAddress.phone"
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

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinkAuthenticationElement } from "@stripe/react-stripe-js";
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
import { Checkbox } from "@/components/ui/checkbox";
import { updateCustomer } from "@/lib/headkit/actions";

const contactSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  newsletter: z.boolean().optional().default(false),
});

interface ContactFormStepProps {
  enableStripe: boolean;
  onNext: (data: { email: string; newsletter: boolean }) => void;
  buttonLabel?: string;
  defaultValues?: { email?: string; newsletter?: boolean };
}

const ContactFormStep: React.FC<ContactFormStepProps> = ({
  enableStripe,
  onNext,
  defaultValues = { email: "", newsletter: false },
  buttonLabel = "Next",
}) => {
  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues,
  });

  const onSubmit = async (data: z.infer<typeof contactSchema>) => {
    await updateCustomer({
      input: {
        email: data.email,
      },
    });
    onNext(data);
  };

  if (enableStripe) {
    return (
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <LinkAuthenticationElement
          onChange={(event) => {
            form.setValue("email", event.value.email);
            form.trigger("email");
          }}
        />
        <div className="flex items-center space-x-2">
          <Checkbox
            id="newsletter-stripe"
            checked={form.watch("newsletter")}
            onCheckedChange={(checked) => {
              form.setValue("newsletter", checked as boolean);
              form.trigger("newsletter");
            }}
          />
          <label
            htmlFor="newsletter-stripe"
            className="text-sm text-gray-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Email me with the latest news, products and special offers.
          </label>
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={!form.formState.isValid}
          onClick={async (e) => {
            e.preventDefault();
            const { email, newsletter } = form.getValues();
            if (email) {
              onNext({ email, newsletter });
            }
          }}
        >
          {buttonLabel}
        </Button>
      </form>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          name="email"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <input
                  type="email"
                  placeholder="Email"
                  className="border rounded-md p-2 w-full"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newsletter"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Email me with the latest news, products and special offers.
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={!form.formState.isValid}
        >
          {buttonLabel}
        </Button>
      </form>
    </Form>
  );
};

export { ContactFormStep };

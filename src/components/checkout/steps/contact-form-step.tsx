"use client";

import { useState } from "react";
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
import { SignInForm } from "@/components/auth/sign-in-form";
import { useAuth } from "@/contexts/auth-context";

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
  const [showSignIn, setShowSignIn] = useState(false);
  const { isAuthenticated, user, signOut } = useAuth();

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      ...defaultValues,
      email: user?.email || defaultValues.email,
    },
  });

  const handleSubmit = async (data: z.infer<typeof contactSchema>) => {
            await updateCustomer({
      input: {
        email: data.email,
        billing: {
          email: data.email,
        },
      },
    });

    
    onNext(data);
  };

  if (showSignIn && !isAuthenticated) {
    return (
      <div className="space-y-4 -mt-[52px]">
        <div className="flex justify-end text-sm">
          <div>
            Checkout as{" "}
            <Button
              variant="link"
              onClick={() => setShowSignIn(false)}
              className="p-0 text-sm"
            >
              Guest
            </Button>
          </div>
        </div>
        <SignInForm
          onSuccess={() => {
            setShowSignIn(false);
            if (user?.email) {
              form.setValue("email", user.email);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {isAuthenticated ? (
          <div className="flex justify-between items-center w-full text-sm">
            <div>Welcome back {user?.firstName || user?.email}!</div>
            <div className="-mt-[88px]">
              Not you?{" "}
              <Button
                variant="link"
                onClick={() => {
                  signOut(false);
                  setShowSignIn(false);
                }}
                className="p-0 text-sm"
              >
                Sign Out
              </Button>
            </div>
          </div>
        ) : (
          <div className="-mt-[52px] text-sm">
            Have an account?{" "}
            <Button
              variant="link"
              onClick={() => setShowSignIn(true)}
              className="p-0 text-sm"
            >
              Sign In
            </Button>
          </div>
        )}
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {enableStripe ? (
            <LinkAuthenticationElement
              options={{
                defaultValues: {
                  email: user?.email || defaultValues.email || "",
                },
              }}
              onChange={(event) => {
                form.setValue("email", event.value.email);
                form.trigger("email");
              }}
            />
          ) : (
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
          )}

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
            disabled={!form.formState.isValid || form.formState.isSubmitting}
            loading={form.formState.isSubmitting}
            rightIcon="arrowRight"
          >
            {buttonLabel}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export { ContactFormStep, type ContactFormStepProps };

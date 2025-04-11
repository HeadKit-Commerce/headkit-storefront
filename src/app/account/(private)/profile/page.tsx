"use client";

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
import { useState, useEffect } from "react";
import { getCustomer, updateCustomer } from "@/lib/headkit/actions";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
});

export default function Page() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        const response = await getCustomer({});
        const customer = response.data?.customer;
        
        if (customer) {
          form.reset({
            firstName: customer.firstName || "",
            lastName: customer.lastName || "",
            email: customer.email || "",
          });
        }
      } catch (error) {
        console.error("Error loading customer data:", error);
        setError("Failed to load your profile information");
      } finally {
        setLoading(false);
      }
    };

    loadCustomerData();
  }, [form]);

  const handleSubmit = async (data: z.infer<typeof profileSchema>) => {
    try {
      setError(null);
      setSuccess(false);

      const response = await updateCustomer({
        input: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        },
      });

      if (response.data?.updateCustomer?.customer) {
        setSuccess(true);
      } else {
        setError("Failed to update profile information. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred. Please try again later.");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        {success && (
          <div className="mb-4 p-4 text-green-700 bg-green-50 border border-green-200 rounded-lg">
            Profile information updated successfully.
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                name="firstName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <input
                        type="text"
                        placeholder="Enter your first name"
                        className="w-full px-4 py-2 border rounded-md focus:outline-hidden focus:ring-2 focus:ring-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="lastName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <input
                        type="text"
                        placeholder="Enter your last name"
                        className="w-full px-4 py-2 border rounded-md focus:outline-hidden focus:ring-2 focus:ring-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-4 py-2 border rounded-md focus:outline-hidden focus:ring-2 focus:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={!form.formState.isValid || form.formState.isSubmitting}
              loading={form.formState.isSubmitting}
            >
              Update Profile
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
} 
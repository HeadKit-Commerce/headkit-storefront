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
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { login } from "@/lib/headkit/actions";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

interface SignInFormProps {
  onSuccess?: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({
  onSuccess,
}) => {
  const [error, setError] = useState<string | null>(null);
  const { setAuthToken, setUser } = useAuth();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (data: z.infer<typeof loginSchema>) => {
    try {
      setError(null);
      const response = await login({
        email: data.email,
        password: data.password,
      });

      if (response.data?.login?.authToken) {
        const token = response.data.login.authToken;
        setAuthToken(token);

        setUser({
          id: Number(response.data.login.user?.id),
          email: response.data.login.user?.email ?? "",
          firstName: response.data.login.user?.firstName ?? "",
          lastName: response.data.login.user?.lastName ?? "",
        });

        // Add a small delay to ensure cookie is set
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
        }, 100);
      } else {
        setError("Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Invalid email or password");
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
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
                    autoComplete="username"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="password"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full px-4 py-2 border rounded-md focus:outline-hidden focus:ring-2 focus:ring-primary"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-between items-center">
            <Link
              href="/account/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot Password?
            </Link>
            <Button
              type="submit"
              disabled={!form.formState.isValid || form.formState.isSubmitting}
              loading={form.formState.isSubmitting}
            >
              Sign In
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}; 
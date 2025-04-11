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
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login, registerUser } from "@/lib/headkit/actions";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Page() {
  const [error, setError] = useState<string | null>(null);
  const { setAuthToken } = useAuth();
  const router = useRouter();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
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

        // Add a small delay to ensure cookie is set before redirect
        setTimeout(() => {
          router.push('/account/profile');
        }, 100);
      } else {
        setError("Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Invalid email or password");
    }
  };

  const handleRegister = async (data: z.infer<typeof registerSchema>) => {
    try {
      setError(null);
      const response = await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });

      console.log(response);

      if (response.data?.registerUser?.user?.jwtAuthToken) {
        setAuthToken(response.data.registerUser.user.jwtAuthToken);

        setTimeout(() => {
          router.push("/account/profile");
        }, 100);
      } else {
        setError("Failed to create account. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Failed to create account. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Sign In */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Sign In</h2>
          {error && (
            <div className="mb-4 p-4 text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <FormField
                name="email"
                control={loginForm.control}
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
                control={loginForm.control}
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
                  disabled={!loginForm.formState.isValid || loginForm.formState.isSubmitting}
                  loading={loginForm.formState.isSubmitting}
                >
                  Sign In
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Sign Up */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Create Account</h2>
          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  name="firstName"
                  control={registerForm.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <input
                          type="text"
                          placeholder="First name"
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
                  control={registerForm.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <input
                          type="text"
                          placeholder="Last name"
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
                control={registerForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full px-4 py-2 border rounded-md focus:outline-hidden focus:ring-2 focus:ring-primary"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="password"
                control={registerForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <input
                        type="password"
                        placeholder="Create a password"
                        className="w-full px-4 py-2 border rounded-md focus:outline-hidden focus:ring-2 focus:ring-primary"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="confirmPassword"
                control={registerForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <input
                        type="password"
                        placeholder="Confirm your password"
                        className="w-full px-4 py-2 border rounded-md focus:outline-hidden focus:ring-2 focus:ring-primary"
                        autoComplete="new-password"
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
                disabled={!registerForm.formState.isValid || registerForm.formState.isSubmitting}
                loading={registerForm.formState.isSubmitting}
              >
                Create Account
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
} 
import { z } from "zod";

// =============================================
// TYPES
// =============================================

export type Customer = {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  // Add other user fields as needed
};

export type AuthTokens = {
  authToken: string;
  refreshToken?: string;
};

export type AuthResponse = {
  success: boolean;
  error?: string;
  redirect?: string;
};

// =============================================
// COOKIE UTILITIES
// =============================================

/**
 * Returns secure cookie options for authentication tokens
 * Centralizes cookie configuration used across multiple files
 */
export const getSecureCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
});

// =============================================
// USER DATA TRANSFORMATION
// =============================================

/**
 * Transforms customer data from GraphQL response to Customer type
 * Centralizes the user data transformation logic used across multiple components
 */
export const transformCustomerData = (customer: unknown): Customer => {
  if (!customer || typeof customer !== 'object') {
    throw new Error("Customer data is required");
  }

  const customerObj = customer as Record<string, unknown>;

  return {
    id: Number(customerObj.id),
    email: (customerObj.email as string) ?? "",
    firstName: (customerObj.firstName as string) ?? "",
    lastName: (customerObj.lastName as string) ?? "",
  };
};

/**
 * Transforms login response user data to Customer type
 * Handles the specific structure returned by login mutations
 */
export const transformLoginUserData = (user: unknown): Customer => {
  if (!user || typeof user !== 'object') {
    throw new Error("User data is required");
  }

  const userObj = user as Record<string, unknown>;

  return {
    id: Number(userObj.id),
    email: (userObj.email as string) ?? "",
    firstName: (userObj.firstName as string) ?? "",
    lastName: (userObj.lastName as string) ?? "",
  };
};

// =============================================
// AUTHENTICATION STATE HELPERS
// =============================================

/**
 * Sets authenticated user state consistently across components
 */
export const setAuthenticatedUser = (
  setIsAuthenticated: (val: boolean) => void,
  setUser: (user: Customer | null) => void,
  customer: unknown
) => {
  try {
    const userData = transformCustomerData(customer);
    setIsAuthenticated(true);
    setUser(userData);
  } catch (error) {
    console.error("Error setting authenticated user:", error);
    clearAuthenticatedUser(setIsAuthenticated, setUser);
  }
};

/**
 * Clears authenticated user state consistently across components
 */
export const clearAuthenticatedUser = (
  setIsAuthenticated: (val: boolean) => void,
  setUser: (user: Customer | null) => void
) => {
  setIsAuthenticated(false);
  setUser(null);
};

// =============================================
// FORM VALIDATION SCHEMAS
// =============================================

export const authSchemas = {
  login: z.object({
    email: z.string().min(1, "Email is required").email("Invalid email"),
    password: z.string().min(1, "Password is required"),
  }),

  register: z
    .object({
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
      email: z.string().min(1, "Email is required").email("Invalid email"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
      confirmPassword: z.string(),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }),

  resetPassword: z
    .object({
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
      confirmPassword: z.string(),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }),
};

export type LoginFormData = z.infer<typeof authSchemas.login>;
export type RegisterFormData = z.infer<typeof authSchemas.register>;
export type ResetPasswordFormData = z.infer<typeof authSchemas.resetPassword>;

// =============================================
// ERROR HANDLING
// =============================================

/**
 * Standardized error logging for cookie operations
 */
export const logCookieError = (action: string, error: unknown) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      `Could not ${action} (likely during static generation):`,
      (error as Error).message || error
    );
  }
};

/**
 * Standardized error handling for authentication operations
 */
export const handleAuthError = (error: unknown, operation: string): AuthResponse => {
  console.error(`${operation} error:`, error);
  
  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
    };
  }
  
  return {
    success: false,
    error: `${operation} failed. Please try again.`,
  };
};


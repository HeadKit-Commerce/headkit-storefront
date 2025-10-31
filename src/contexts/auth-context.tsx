"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getWoocommerceAuthToken } from "@/lib/headkit/actions";
import { getCustomer } from "@/lib/headkit/queries-dynamic";
import { handleAuthToken, removeAuthToken } from "@/lib/headkit/actions/auth";

// Add type for user data
type Customer = {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  // Add other user fields as needed
};

type AuthContextType = {
  isAuthenticated: boolean;
  setAuthToken: (token: string) => void;
  signOut: (redirect?: boolean) => void;
  user: Customer | null;
  setUser: (user: Customer | null) => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setAuthToken: () => { },
  signOut: () => { },
  user: null,
  setUser: () => { },
  isLoading: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<Customer | null>(null);  // Add user state
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getWoocommerceAuthToken();

        if (token) {
          const response = await getCustomer({});
          if (response.data?.customer) {
            setIsAuthenticated(true);
            setUser({
              id: Number(response.data.customer.id),
              email: response.data.customer.email ?? "",
              firstName: response.data.customer.firstName ?? "",
              lastName: response.data.customer.lastName ?? "",
            });  // Store user data
          } else {
            await removeAuthToken();
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const setAuthToken = async (token: string) => {
    try {
      await handleAuthToken(token);
      setIsAuthenticated(true);
      // Force a router refresh to ensure middleware picks up the new cookie
      router.refresh();
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  };

  const signOut = async (redirect: boolean = true) => {
    await removeAuthToken();
    setIsAuthenticated(false);
    setUser(null);  // Clear user data
    if (redirect) {
      router.push("/account");
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthToken, signOut, user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 
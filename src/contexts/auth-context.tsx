"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCustomer, getWoocommerceAuthToken } from "@/lib/headkit/actions";
import { handleAuthToken, removeAuthToken } from "@/lib/headkit/actions/auth";

type AuthContextType = {
  isAuthenticated: boolean;
  setAuthToken: (token: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setAuthToken: () => {},
  signOut: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getWoocommerceAuthToken();
        
        if (token) {
          const response = await getCustomer({});
          if (response.data?.customer) {
            setIsAuthenticated(true);
          } else {
            await removeAuthToken();
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
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

  const signOut = async () => {
    await removeAuthToken();
    setIsAuthenticated(false);
    router.push("/account");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthToken, signOut }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 
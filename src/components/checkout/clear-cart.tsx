"use client";

import { useEffect } from "react";
import { useAppContext } from "@/contexts/app-context";
import { emptyCart } from "@/lib/headkit/actions";

interface ClearCartProps {
  singleCheckout?: boolean;
}

export function ClearCart({ singleCheckout }: ClearCartProps) {
  const { setCartData } = useAppContext();

  useEffect(() => {
    const clearCartData = async () => {
      try {
        // Empty cart in backend
        if (!singleCheckout) {
          // Clear cart data from context
          setCartData(null);
          await emptyCart();
        }
      } catch (error) {
        console.error("Error clearing cart:", error);
      }
    };

    clearCartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

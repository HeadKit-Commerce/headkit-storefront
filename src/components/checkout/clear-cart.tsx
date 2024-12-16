"use client";

import { useEffect } from "react";
import { useAppContext } from "@/components/context/app-context";

export function ClearCart() {
  const { setCartData } = useAppContext();

  useEffect(() => {
    setCartData(null);
  }, [setCartData]);

  return null;
}

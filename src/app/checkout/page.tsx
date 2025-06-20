"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { useAppContext } from "@/contexts/app-context";
import { getFloatVal, cn } from "@/lib/utils";
import { Cart } from "@/components/checkout/cart";
import { currencyFormatter } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

// Separate component for handling search params
function CheckoutErrorHandler({
  onError,
}: {
  onError: (error: string) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      switch (error) {
        case "payment_failed":
          onError("Payment failed. Please try again.");
          break;
        case "checkout_failed":
          onError(
            "There was an issue processing your order. Please try again."
          );
          break;
        case "stripe_error":
          onError(
            "There was an issue with the payment processor. Please try again."
          );
          break;
        default:
          onError("An error occurred. Please try again.");
      }
    }
  }, [searchParams, onError]);

  return null;
}

export default function Page() {
  const { cartData, toggleCartDrawer } = useAppContext();
  const [showCart, setShowCart] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    toggleCartDrawer(false);
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[700px] py-10">
      <Suspense fallback={null}>
        <CheckoutErrorHandler onError={setErrorMessage} />
      </Suspense>
      {errorMessage && (
        <div className="text-red-500 text-center mb-4">{errorMessage}</div>
      )}
      {cartData && getFloatVal(cartData?.total || "0") > 0 ? (
        <div className="px-[20px] md:px-[40px] mx-auto grid grid-cols-12 gap-[20px]">
          <div className="order-2 md:order-1 col-span-12 md:col-span-6">
            {cartData?.contents?.nodes?.length && <CheckoutForm />}
          </div>
          <div className="order-1 md:order-2 col-span-12 md:col-start-7 md:col-span-6 lg:col-start-8 lg:col-span-5">
            <div className="px-[20px] py-[17px] md:py-0 border-y-[1px] border-[#d6d6d6] md:border-0">
              <div
                className="md:hidden flex justify-between"
                onClick={() => setShowCart(!showCart)}
              >
                <span className="font-medium">
                  {cartData?.contents?.nodes?.length}{" "}
                  {cartData?.contents?.nodes?.length &&
                  cartData?.contents?.nodes?.length > 1
                    ? "items"
                    : "item"}
                </span>
                <span className="font-medium flex items-center">
                  {currencyFormatter({
                    price:
                      getFloatVal(cartData?.subtotal || "0") +
                      getFloatVal(cartData?.subtotalTax || "0"),
                  })}
                  <Icon.chevronDown
                    className={cn(
                      "mt-[2px] ml-[10px] h-[24px] w-[12px] bg-contain",
                      { "rotate-180": showCart }
                    )}
                  />
                </span>
              </div>
              <div
                className={cn("hidden md:block transition-all", {
                  "block! mt-[20px]": showCart,
                })}
              >
                <Cart showDisplayShipping={true} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-[20px] md:px-32 pb-[30px] md:py-[60px] text-center">
          <div className="w-[500px] max-w-full mx-auto">
            <p className="mb-4 font-bold leading-10 ">
              No products in your cart!
            </p>
            <p className="mb-10">
              Browse our selection to find something you love.
            </p>
            <Link href="/">
              <Button
                fullWidth
                suppressHydrationWarning
                onClick={() => toggleCartDrawer(false)}
              >
                Start shopping
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}


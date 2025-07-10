"use client";

import React, { useEffect, useState, Suspense, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { useAppContext } from "@/contexts/app-context";
import { getFloatVal, cn } from "@/lib/utils";
import { Cart } from "@/components/checkout/cart";
import { currencyFormatter } from "@/lib/utils";
import { rebuildCartFromKlaviyo, getCart } from "@/lib/headkit/actions";
import { Cart as CartType } from "@/lib/headkit/generated";

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

function CheckoutContent() {
  const { cartData, toggleCartDrawer, setCartData } = useAppContext();
  const [showCart, setShowCart] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRebuildingCart, setIsRebuildingCart] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasProcessedRebuild = useRef(false);

  useEffect(() => {
    const handleCartRebuild = async () => {
      const rebuildCartData = searchParams.get("wck_rebuild_cart");

      if (rebuildCartData && !hasProcessedRebuild.current) {
        hasProcessedRebuild.current = true;
        setIsRebuildingCart(true);
        
        try {
          // Call the rebuild cart action
          const response = await rebuildCartFromKlaviyo({
            input: {
              cartData: rebuildCartData,
            },
          });
          
          if (response.data?.rebuildCartFromKlaviyo?.success) {
            // Wait a moment to let any background processes complete
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // PRIORITY 1: Use cart data from rebuild response (direct cart object)
            if (response.data.rebuildCartFromKlaviyo.cart && (response.data.rebuildCartFromKlaviyo.cart.contents?.nodes?.length ?? 0) > 0) {
              setCartData(response.data.rebuildCartFromKlaviyo.cart as CartType);
            } 
            // PRIORITY 2: If rebuild response has cart but no items, still use it (might be empty cart)
            else if (response.data.rebuildCartFromKlaviyo.cart) {
              setCartData(response.data.rebuildCartFromKlaviyo.cart as CartType);
            } 
            // PRIORITY 3: Fallback to getCart only if no cart object in response
            else {
              // Fallback: manually refresh cart data with getCart
              const cartResponse = await getCart();
              
              if (cartResponse.data?.cart) {
                setCartData(cartResponse.data.cart as CartType);
              } else {
                setErrorMessage("Cart was rebuilt but couldn't be retrieved. Please refresh the page.");
              }
            }
            
            // Remove query parameters from URL
            router.replace('/checkout', { scroll: false });
          } else {
            setErrorMessage("Failed to rebuild cart from Klaviyo data.");
          }
        } catch {
          setErrorMessage("An error occurred while rebuilding your cart.");
        } finally {
          setIsRebuildingCart(false);
        }
      }
    };

    handleCartRebuild();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Load cart data on initial mount if not already available
  useEffect(() => {
    const loadCartData = async () => {
      if (!cartData) {
        try {
          const cartResponse = await getCart();
          
          if (cartResponse.data?.cart) {
            setCartData(cartResponse.data.cart as CartType);
          }
        } catch {
          // Handle error silently
        }
      }
    };

    loadCartData();
  }, [cartData, setCartData]);

  useEffect(() => {
    toggleCartDrawer(false);
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show loading while rebuilding cart
  if (isRebuildingCart) {
    return (
      <div className="min-h-[700px] py-10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Restoring your cart...</p>
        </div>
      </div>
    );
  }

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

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-[700px] py-10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}


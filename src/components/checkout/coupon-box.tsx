"use client";

import { useCallback, useState } from "react";
import { useAppContext } from "@/contexts/app-context";
import { Cart } from "@/lib/headkit/generated";
import { currencyFormatter, getFloatVal } from "@/lib/utils";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { AlertBox } from "@/components/alert-box/alert-box";
import {
  applyCoupon,
  removeCoupons,
  applyGiftCard,
  removeGiftCard,
} from "@/lib/headkit/actions";
import { getCart } from "@/lib/headkit/queries-dynamic";

const isValidGiftCardFormat = (code: string) => {
  const regex = /^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/;
  return regex.test(code);
};

const couponSchema = z.object({
  code: z.string().nonempty("Code is required"),
});

type CouponFormValues = z.infer<typeof couponSchema>;

interface ApiError extends Error {
  response?: {
    errors?: Array<{ message: string }>;
  };
}

export const CouponBox = ({ cart }: { cart: Cart }) => {
  const { setCartData } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
  });

  const applyCouponOrGiftCard = useCallback<SubmitHandler<CouponFormValues>>(
    async ({ code }) => {
      setErrorMessage("");
      setIsLoading(true);

      try {
        if (isValidGiftCardFormat(code)) {
          // Apply Gift Card Logic
          const { data: giftCardResult } = await applyGiftCard({ code });
          if (giftCardResult?.applyGiftCard?.result === "success") {
            // Manually fetch cart after successful gift card application
            const updatedCart = await getCart();
            if (updatedCart?.data?.cart) {
              setCartData(updatedCart.data.cart as Cart);
            }
          } else {
            throw new Error(
              giftCardResult?.applyGiftCard?.message ||
                "Failed to apply gift card"
            );
          }
        } else {
          // Apply Coupon Logic
          const { data: couponResult } = await applyCoupon({ code });
          if (couponResult?.applyCoupon?.cart) {
            setCartData(couponResult.applyCoupon.cart as Cart);
          } else {
            throw new Error("Failed to apply coupon");
          }
        }
        reset(); // Clear the input field after successful application
      } catch (error: unknown) {
        const err = error as ApiError;
        setErrorMessage(
          err.response?.errors?.[0]?.message ||
          err.message ||
          "An error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [setCartData, reset]
  );

  const removeCoupon = useCallback(
    async (code: string) => {
      try {
        const { data: result } = await removeCoupons({ code });
        if (result?.removeCoupons?.cart) {
          setCartData(result.removeCoupons.cart as Cart);
        }
      } catch (error: unknown) {
        const err = error as ApiError;
        setErrorMessage(
          err.response?.errors?.[0]?.message || "An error occurred"
        );
      }
    },
    [setCartData]
  );

  const removeGiftCardHandler = useCallback(
    async (id: string) => {
      try {
        // Call the remove gift card API
        await removeGiftCard({ id });
        // Manually fetch cart after removal
        const updatedCart = await getCart();
        if (updatedCart?.data?.cart) {
          setCartData(updatedCart.data.cart as Cart);
        }
      } catch (error: unknown) {
        const err = error as ApiError;
        setErrorMessage(
          err.response?.errors?.[0]?.message ||
            err.message ||
            "An error occurred"
        );
      }
    },
    [setCartData]
  );

  return (
    <div>
      {(cart?.appliedCoupons?.length ?? 0) > 0 && (
        <div>
          {cart?.appliedCoupons?.map((coupon, i) => (
            <div
              key={i}
              className="flex text-lg font-medium  py-2"
            >
              <p className="flex-1">Coupon: {coupon?.code}</p>
              <p>
                -
                {currencyFormatter({
                  currency: "AUD",
                  price: cart?.displayPricesIncludeTax
                    ? getFloatVal(coupon?.discountAmount ?? "0") +
                    getFloatVal(coupon?.discountTax ?? "0")
                    : getFloatVal(coupon?.discountAmount ?? "0"),
                })}
              </p>
              <p
                className="underline font-medium ml-1 cursor-pointer"
                onClick={() => removeCoupon(coupon?.code ?? "")}
              >
                [remove]
              </p>
            </div>
          ))}
        </div>
      )}
      {(cart?.appliedGiftCards?.length ?? 0) > 0 && (
        <div>
          {cart?.appliedGiftCards?.map((giftCard) => 
            giftCard ? (
              <div key={giftCard.code} className="flex text-lg font-medium  py-2">
                <p className="flex-1">Gift Card: {giftCard.code}</p>
                <p>-${getFloatVal(giftCard?.amount ?? "0").toFixed(2)}</p>
                <p
                  className="underline font-medium ml-1 cursor-pointer"
                  onClick={() => removeGiftCardHandler(giftCard?.id ?? "")}
                >
                  [remove]
                </p>
              </div>
            ) : null
          )}
        </div>
      )}
      <form onSubmit={handleSubmit(applyCouponOrGiftCard)}>
        <div className="flex gap-3 items-start">
          <div className="flex-1">
            <input
              {...register("code")}
              type="text"
              placeholder="Coupon Code or Gift Card"
              className="w-full p-2 border rounded"
            />
            {errors.code && (
              <p className="text-red-500 text-sm">{errors.code.message}</p>
            )}
          </div>
          <Button
            variant={"secondary"}
            disabled={isLoading}
            loading={isLoading}
            loadingText="Applying..."
            className="max-w-[170px]"
            type="submit"
          >
            Apply
          </Button>
        </div>
      </form>
      {errorMessage && (
        <AlertBox variant="danger" title="Error">
          {errorMessage}
        </AlertBox>
      )}
    </div>
  );
};

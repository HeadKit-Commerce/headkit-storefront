"use client";
import {
  Cart,
  StockStatusEnum,
} from "@/lib/headkit/generated";
import { Button } from "@/components/ui/button";
import { forwardRef, useState } from "react";
import { useAppContext } from "@/contexts/app-context";
import { addToCart } from "@/lib/headkit/actions";

interface AddToCartProps {
  productId: number | null;
  quantity: number;
  stockStatus: StockStatusEnum;
  brand?: string;
  productExtraData?: string;
  disabled?: boolean;
}

interface ApiError {
  response?: {
    errors?: { message?: string }[];
  };
}

const AddToCart = forwardRef<HTMLButtonElement, AddToCartProps>(
  ({ productId, quantity, stockStatus, productExtraData, disabled }, ref) => {
    const { setCartData, toggleCartDrawer, isGlobalDisabled } = useAppContext();
    const [buttonLoading, setButtonLoading] = useState<boolean>(false);
    const [error, setError] = useState("");

    return (
      <>
        <Button
          ref={ref}
          variant={"primary"}
          fullWidth
          suppressHydrationWarning
          onClick={async () => {
            try {
              setError("");
              setButtonLoading(true);
              
              console.log("🛍️ Adding to cart with server action...");
              
              // Use server action instead of client-side mutation
              const response = await addToCart({
                input: {
                  productId: productId as number,
                  quantity: quantity,
                  extraData: productExtraData ?? "",
                },
              });
              
              console.log("✅ Add to cart successful:", response);
              
              setCartData(response?.data?.addToCart?.cart as Cart);
              toggleCartDrawer();
            } catch (error) {
              console.error("❌ Add to cart failed:", error);
              setError(JSON.stringify(error));
            }
            setButtonLoading(false);
          }}
          disabled={
            disabled ||
            productId === null ||
            stockStatus === StockStatusEnum.OutOfStock ||
            buttonLoading ||
            isGlobalDisabled
          }
          rightIcon="shoppingBag"
          loading={buttonLoading}
          loadingText="Adding..."
        >
          {productId === null
            ? "Select Options"
            : stockStatus === StockStatusEnum.OutOfStock
            ? "Out Of Stock"
            : "Add to Bag"}
        </Button>
        {error ? (
          <div
            className="mt-2 text-red-500"
            dangerouslySetInnerHTML={{
              __html: ((error ? JSON.parse(error) as ApiError : null)?.response?.errors?.[0]?.message
                ?.replace(/<a\s[^>]*>.*?<\/a>/g, "")
                ?.trim() || "") as string
            }}
          ></div>
        ) : null}
      </>
    );
  }
);

AddToCart.displayName = "AddToCart";
export { AddToCart };

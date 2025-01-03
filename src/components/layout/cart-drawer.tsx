"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAppContext } from "../../contexts/app-context";
import { Icon } from "../icon";
import { useEffect } from "react";
import { getCart as getCartAction } from "@/lib/headkit/actions";
import { Button } from "../ui/button";
import Link from "next/link";
import { CartItem } from "./cart-item";
import { currencyFormatter, getFloatVal } from "@/lib/utils";
import { Cart, CartItemFragment } from "@/lib/headkit/generated";
import { ExpressCheckout } from "@/components/stripe/express-checkout";
import { PaymentMethodMessaging } from "@/components/stripe/payment-messaging";

const CartDrawer = () => {
  const { cartDrawer, toggleCartDrawer, setCartData, cartData } = useAppContext();

  useEffect(() => {
    const getCart = async () => {
      try {
        const cart = await getCartAction();
        if (cart) {
          setCartData(cart.data.cart as Cart);
        }
      } catch (error) {
        console.error(error);
      }
    };
    getCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  return (
    <Sheet onOpenChange={toggleCartDrawer} open={cartDrawer}>
      <SheetTrigger asChild>
        <Button variant={"ghost"} className="pr-0 relative">
          {(cartData?.contents?.nodes?.length ?? 0) > 0 && (
            <div className="absolute right-0 top-[10px] z-10 h-[14px] w-[14px] rounded-full bg-purple-500 text-center text-[12px] font-medium leading-4 text-white">
              {cartData?.contents?.nodes?.length}
            </div>
          )}
          <Icon.shoppingBag className="h-6 w-6 stroke-purple-800 hover:stroke-pink-500 stroke-2" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="mt-3 text-left">Your Bag</SheetTitle>
          <SheetDescription hidden />
        </SheetHeader>

        <div className="flex-1 relative">
          {(cartData?.contents?.nodes?.length ?? 0) > 0 ? (
            <div className="absolute inset-0 space-y-5 py-10 overflow-y-auto scrollbar-hide">
              {cartData?.contents?.nodes?.map((product, i) => (
                <CartItem
                  key={i}
                  cartItem={product as unknown as CartItemFragment}
                  priceIncludeTax={!!cartData?.displayPricesIncludeTax}
                  type={"cart"}
                  updateable={true}
                />
              ))}
            </div>
          ) : (
            <>
              <p className="mb-4">No products in your cart! </p>
              <p className="mb-10 font-medium">
                Have a look around our selection products to get ready for your
                next adventure.
              </p>
              <Link href={"/shop"}>
                <Button
                  fullWidth
                  suppressHydrationWarning
                  onClick={() => toggleCartDrawer()}
                >
                  Start shopping
                </Button>
              </Link>
            </>
          )}
        </div>

        <SheetFooter>
          {(cartData?.contents?.nodes?.length ?? 0) > 0 && (
            <div className="w-full flex flex-col gap-2 mt-auto bg-white">
              <PaymentMethodMessaging
                price={getFloatVal(cartData?.contentsTotal || "0")}
                disabled={false}
              />
              <div className="flex font-medium gap-1">
                <p className="flex-1 flex items-end">
                  Shipping and tax calculated at checkout
                </p>
                <p className="flex items-end text-xl">
                  {currencyFormatter({
                    price: getFloatVal(cartData?.contentsTotal || "0"),
                    currency: "AUD",
                    lang: "en-AU",
                  })}
                </p>
              </div>
              <ExpressCheckout
                singleCheckout={false}
                disabled={false}
                price={getFloatVal(cartData?.total || "0")}
              />
              <Link href="/checkout">
                <Button
                  fullWidth
                  suppressHydrationWarning
                  onClick={() => toggleCartDrawer(false)}
                  className="mt-3"
                >
                  Checkout
                </Button>
              </Link>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export { CartDrawer };

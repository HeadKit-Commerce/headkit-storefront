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
import { useAppContext } from "../context/app-context";
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
            <div className="absolute -right-2 top-0 z-10 h-[14px] w-[14px] rounded-full bg-purple-500 text-center text-[12px] font-medium leading-4 text-white">
              {cartData?.contents?.nodes?.length}
            </div>
          )}
          <Icon.shoppingBag className="h-6 w-6 stroke-purple-800 hover:stroke-pink-500 stroke-2" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader hidden>
          <SheetTitle hidden />
          <SheetDescription hidden />
        </SheetHeader>
        <div>
          {(cartData?.contents?.nodes?.length ?? 0) > 0 ? (
            <div className="mt-5 space-y-5">
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

        <SheetFooter className="absolute bottom-0 left-0 w-full container">
          {(cartData?.contents?.nodes?.length ?? 0) > 0 && (
            <div className="pt-[20px] w-full pb-[30px] md:py-[40px] bg-white md:bg-inherit">
              <>
                <PaymentMethodMessaging
                  price={getFloatVal(cartData?.contentsTotal || "0")}
                  disabled={false}
                />
                <div className="mt-5 flex text-lg font-medium">
                  <p className="leading-[32px] flex-1 flex items-end text-[15px]">
                    Shipping and tax calculated at checkout
                  </p>
                  <p className="leading-[32px] pb-[2px] flex items-end text-[20px]">
                    {currencyFormatter({
                      price: getFloatVal(cartData?.contentsTotal || "0"),
                      currency: "AUD",
                    })}
                  </p>
                </div>
                <div className="mt-5">
                  <ExpressCheckout
                    singleCheckout={false}
                    disabled={false}
                    price={getFloatVal(cartData?.total || "0")}
                  />
                </div>
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
              </>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export { CartDrawer };

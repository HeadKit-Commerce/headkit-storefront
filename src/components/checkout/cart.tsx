"use client";

import { useAppContext } from "@/contexts/app-context";
import { CouponBox } from "@/components/checkout/coupon-box";
import { getFloatVal } from "@/lib/utils";
import { CartItem } from "@/components/layout/cart-item";
import { CartItemFragment } from "@/lib/headkit/generated";
import { PaymentMethodMessaging } from "../stripe/payment-messaging";
import { currencyFormatter } from "@/lib/utils";
interface Props {
  showDisplayShipping?: boolean;
}

const Cart = ({ showDisplayShipping }: Props) => {
  const { cartData } = useAppContext();

  const calculateShipping = () => {
    if (!showDisplayShipping) {
      return (
        <span className="font-normal text-base ">
          Calculated at next step
        </span>
      );
    }

    const shippingCost =
      getFloatVal(cartData?.shippingTotal ?? "0") +
      getFloatVal(cartData?.shippingTax ?? "0");

    return shippingCost === 0
      ? "Free"
      : currencyFormatter({ price: shippingCost });
  };

  const calculateTotal = () => {
    const total = getFloatVal(cartData?.total ?? "0");
    const shippingCost =
      getFloatVal(cartData?.shippingTotal ?? "0") +
      getFloatVal(cartData?.shippingTax ?? "0");

    return showDisplayShipping
      ? currencyFormatter({ price: total })
      : currencyFormatter({ price: total - shippingCost });
  };

  const taxDescription = () => {
    if (!cartData?.displayPricesIncludeTax || !cartData?.totalTax) return null;

    const taxAmount = showDisplayShipping
      ? getFloatVal(cartData?.totalTax ?? "0")
      : getFloatVal(cartData?.totalTax ?? "0") -
      getFloatVal(cartData?.shippingTax ?? "0");

    return `Includes ${currencyFormatter({ price: taxAmount })} in Tax`;
  };

  return (
    <div>
      <div className="space-y-[20px]">
        {cartData?.contents?.nodes?.map((product, i) => (
          <CartItem
            key={i}
            cartItem={product as unknown as CartItemFragment}
            priceIncludeTax={cartData?.displayPricesIncludeTax || true}
            type="cart"
          />
        ))}
      </div>

      <div className="mt-[32px] mb-[20px]">
        <CouponBox cart={cartData!} />
      </div>

      <div className="flex justify-between font-medium  ">
        <p>Subtotal</p>
        <p>
          {currencyFormatter({
            price: cartData?.displayPricesIncludeTax
              ? getFloatVal(cartData?.contentsTotal ?? "0")
              : getFloatVal(cartData?.subtotal ?? "0"),
          })}
        </p>
      </div>

      <div className="flex justify-between font-medium   mt-[8px]">
        <p>Shipping</p>
        <p>{calculateShipping()}</p>
      </div>

      {!cartData?.displayPricesIncludeTax && (
        <div className="flex justify-between font-medium   mt-[8px]">
          <p>Tax</p>
          <p>
            {currencyFormatter({
              price: getFloatVal(cartData?.totalTax ?? "0"),
            })}
          </p>
        </div>
      )}

      <div className="flex justify-between text-xl mt-[20px]">
        <div>
          <p className="font-medium  ">Total</p>
          <p className="text-[13px]  -mt-2">{taxDescription()}</p>
        </div>
        <div className="text-right font-medium  ">
          <p>{calculateTotal()}</p>
        </div>
      </div>

      <div className="mt-5">
        <PaymentMethodMessaging
          price={getFloatVal(cartData?.contentsTotal || "0")}
          disabled={false}
        />
      </div>
    </div>
  );
};

export { Cart };

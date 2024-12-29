"use client";

import { Cart, CartItemFragment } from "@/lib/headkit/generated";
import Image from "next/image";
import { useState, useTransition } from "react";
import Link from "next/link";
import { cn, getFloatVal } from "@/lib/utils";
import { useAppContext } from "@/contexts/app-context";
import { Icon } from "../icon";
import { removeCartItem, updateCartItem } from "@/lib/headkit/actions";

interface Props {
  type: "cart" | "order";
  cartItem?: CartItemFragment;
  orderData?: {
    quantity: number;
    image: {
      src: string;
      alt: string;
    };
    name: string;
  };
  updateable?: boolean;
  removeable?: boolean;
  priceIncludeTax?: boolean;
}

const CartItem = ({
  type,
  cartItem,
  orderData,
  updateable = false,
  removeable = true,
  priceIncludeTax = false,
}: Props) => {
  const { toggleCartDrawer, setCartData, currencyFormatter, isGlobalDisabled } =
    useAppContext();

  const [loading, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(cartItem?.quantity || 1);

  const updateItem = async (id: string, quantity: number) => {
    const { data } = await updateCartItem({
      input: {
        items: [{ key: id, quantity }],
      },
    });
    return data;
  };

  const handleRemoveItem = async () => {
    if (!cartItem?.key) return;

    startTransition(async () => {
      const { data } = await removeCartItem({
        cartInput: { keys: [cartItem?.key] },
      });
      setCartData(data?.removeItemsFromCart?.cart as Cart);
    });
  };

  const renderProductImage = (
    imageUrl: string,
    altText: string,
    link: string
  ) => (
    <Link href={link} onClick={() => toggleCartDrawer(false)}>
      <div className="relative h-[100px] w-[100px] overflow-hidden rounded-[3px]">
        <Image
          src={imageUrl}
          fill
          className="absolute left-0 top-0 h-full w-full object-cover"
          alt={altText}
          quality={50}
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
    </Link>
  );

  const renderPrice = (price: number, quantity: number, onSale: boolean) => (
    <>
      {onSale && (
        <p className="font-medium text-[#343A40] line-through">
          {currencyFormatter({ price: getFloatVal(price.toString()) * quantity })}
        </p>
      )}
      <p
        className={cn(
          "font-medium text-[#343A40]",
          onSale && "text-hall-ochre-900"
        )}
      >
        {priceIncludeTax
          ? currencyFormatter({
            price:
              getFloatVal(cartItem?.subtotal || "0") +
              getFloatVal(cartItem?.subtotalTax || "0"),
          })
          : currencyFormatter({
            price: getFloatVal(cartItem?.subtotal || "0"),
          })}
      </p>
    </>
  );

  const renderQuantityControls = () => (
    <div className="mt-0.5 flex items-center">
      <button
        className={cn(
          "flex h-[26px] w-[26px] items-center justify-center rounded-l-[3px] bg-purple-500",
          (loading || isGlobalDisabled) && "cursor-not-allowed opacity-40"
        )}
        onClick={async () => {
          if (quantity === 1) {
            await handleRemoveItem();
          } else {
            const updatedQuantity = quantity - 1;
            setQuantity(updatedQuantity);
            startTransition(async () => {
              const response = await updateItem(
                cartItem?.key as string,
                updatedQuantity
              );
              setCartData(response?.updateItemQuantities?.cart as Cart);
            });
          }
        }}
        disabled={loading || isGlobalDisabled}
      >
        <Icon.minus color="white" />
      </button>
      <span className="flex h-[26px] w-[26px] items-center justify-center border-b border-t border-gray-500 bg-white pt-[2px] font-medium text-purple-800">
        {quantity}
      </span>
      <button
        className={cn(
          "flex h-[26px] w-[26px] items-center justify-center rounded-r-[3px] bg-purple-500 hover:bg-pink-500",
          loading || isGlobalDisabled
        )}
        onClick={async () => {
          const updatedQuantity = quantity + 1;
          setQuantity(updatedQuantity);

          startTransition(async () => {
            const response = await updateItem(
              cartItem?.key as string,
              updatedQuantity
            );
            setCartData(response?.updateItemQuantities?.cart as Cart);
          });
        }}
        disabled={loading || isGlobalDisabled}
      >
        <Icon.plus color="white" />
      </button>
    </div>
  );

  if (type === "cart" && cartItem) {
    return (
      <div className="flex gap-3">
        {renderProductImage(
          cartItem?.variation?.node?.image?.sourceUrl ||
          cartItem?.product?.node?.image?.sourceUrl ||
          "/assets/fallback-image.webp",
          cartItem?.product?.node?.name || "",
          cartItem?.product?.node?.uri || ""
        )}
        <div className="flex flex-1 flex-col justify-between px-2 md:px-5">
          <Link
            href={cartItem.product?.node?.uri || "#"}
            onClick={() => toggleCartDrawer(false)}
          >
            <p className="font-semibold capitalize text-[#343A40]">
              {cartItem?.product?.node?.name}
            </p>
            <div className="flex leading-[24px] flex-wrap">
              {cartItem.variation?.attributes?.map((attr, index) => (
                <p
                  key={attr?.name}
                  className="text-[15px] font-medium capitalize text-[#343A40]"
                >
                  {index > 0 ? <span className="px-1">/</span> : ""} {attr?.value}
                </p>
              ))}
            </div>

          </Link>
          {updateable ? renderQuantityControls() : <div className="mt-0.5 flex">
            <p className="font-medium text-[#343A40]">x{quantity}</p>
          </div>}
        </div>
        <div className="flex flex-col items-end justify-between">
          {renderPrice(
            getFloatVal(cartItem?.variation?.node?.regularPrice || "0"),
            quantity,
            !!cartItem?.variation?.node?.onSale
          )}
          {removeable && (
            <button
              onClick={handleRemoveItem}
              className={cn(
                "cursor-pointer rounded-sm bg-pink-500 p-1",
                loading && "cursor-not-allowed opacity-40"
              )}
              disabled={loading}
            >
              <Icon.close className="h-3 w-3 bg-transparent stroke-white" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (type === "order" && orderData) {
    return (
      <div className="flex">
        {renderProductImage(
          orderData?.image.src || "/assets/fallback-image.webp",
          orderData?.name,
          "#"
        )}
        <div className="flex flex-1 flex-col justify-between px-[20px] pt-[12px]">
          <p className="font-semibold capitalize text-[#343A40]">
            {orderData?.name}
          </p>
          <div className="mt-0.5 flex">
            <p className="font-medium text-[#343A40]">x{orderData?.quantity}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export { CartItem };

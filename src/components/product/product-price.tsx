"use client";

import { useAppContext } from "@/contexts/app-context";
import { cn, currencyFormatter, getFloatVal } from "@/lib/utils";

interface Props {
  price: string;
  regularPrice?: string;
  onSale?: boolean;
  dark?: boolean;
  size?: "default" | "big";
}
const ProductPrice = ({
  price,
  regularPrice,
  onSale,
  dark = false,
  size = "default",
}: Props) => {
  const { initCurrency, initLang } = useAppContext();
  const splitPrice = price?.split("-");
  const minPrice = splitPrice?.[0]?.trim();
  const maxPrice = splitPrice?.[1]?.trim() ?? null;
  return (
    <div className="flex gap-3">
      <p
        className={cn(
          "leading-4",
          onSale && "line-through",
          dark ? "text-white" : "text-black",
          {
            "text-base": size === "default",
            "text-lg": size === "big",
          }
        )}
      >
        {maxPrice
          ? `${currencyFormatter({
              price: getFloatVal(minPrice),
              currency: initCurrency,
              lang: initLang,
            })} - ${currencyFormatter({
              price: getFloatVal(maxPrice),
              currency: initCurrency,
              lang: initLang,
            })}`
          : currencyFormatter({
              price: getFloatVal(regularPrice ?? "0"),
              currency: initCurrency,
              lang: initLang,
            })}
      </p>
      {onSale && (
        <p
          className={cn("leading-4 text-pink-500", {
            "text-base": size === "default",
            "text-lg": size === "big",
          })}
        >
          {currencyFormatter({
            price: getFloatVal(minPrice),
            currency: initCurrency,
            lang: initLang,
          })}
        </p>
      )}
    </div>
  );
};

export { ProductPrice };

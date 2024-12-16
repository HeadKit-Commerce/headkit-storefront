"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  GlobalProductAttribute,
  ProductAttribute,
  ProductContentFullWithGroupFragment,
  ProductTypesEnum,
  ProductVariation,
  ProductVariationContentFragment,
  SimpleProduct,
  VariableProduct,
  VariationAttribute,
} from "@/lib/headkit/generated";
import { cn } from "@/lib/utils";
import { FeaturedImage } from "@/components/product/featured-image";
import { ProductPrice } from "@/components/product/product-price";
import { BadgeList } from "@/components/product/badge-list";
import { VariantSwatch } from "@/components/product/product-variations/variant-swatch";

interface ListItemProps {
  product: ProductContentFullWithGroupFragment;
  className?: string;
  dark?: boolean;
  mobileCol?: boolean;
}

export const ProductCard = ({
  product,
  className,
  dark = false,
  mobileCol = false,
}: ListItemProps) => {
  const [colourSelected, setColourSelected] = useState<string | null>(null);
  const [imageSelected, setImageSelected] = useState<string>(
    product?.image?.sourceUrl || ""
  );
  const [uri, setUri] = useState<string>("");

  useEffect(() => {
    if (!product) return;

    setUri(product.uri || "");

    if (product.type === ProductTypesEnum.Variable) {
      const variableProduct = product as VariableProduct;

      if (
        variableProduct.attributes?.nodes?.length === 1 &&
        variableProduct.attributes?.nodes[0]?.name !== "pa_colour"
      ) {
        setImageSelected(
          variableProduct.variations?.nodes[0]?.image?.sourceUrl || ""
        );
      } else {
        const defaultColour = variableProduct.attributes?.nodes?.find(
          (attribute: GlobalProductAttribute) => attribute?.slug === "pa_colour"
        ) as ProductAttribute | undefined;
        setColourSelected(defaultColour?.fullOptions?.[0]?.slug || null);
      }
    } else {
      setImageSelected(product.image?.sourceUrl || "");
    }
  }, [product]);

  useEffect(() => {
    if (!product || product.type !== ProductTypesEnum.Variable) return;

    const variableProduct = product as VariableProduct;

    const selectedVariation = variableProduct.variations?.nodes?.find(
      (variation: ProductVariationContentFragment) =>
        variation?.attributes?.nodes?.some(
          (attribute) => colourSelected === attribute?.value
        )
    );

    if (selectedVariation) {
      const params = selectedVariation.attributes?.nodes
        ?.filter((param: VariationAttribute) => param?.name !== "pa_size")
        ?.map(
          (param) =>
            `${encodeURIComponent(param?.name || "")}=${encodeURIComponent(
              param?.value || ""
            )}`
        )
        ?.join("&");

      setUri(`${product.uri}?${params}`);
      setImageSelected(selectedVariation.image?.sourceUrl || "");
    }
  }, [colourSelected, product]);

  const isProductNew = (
    product: ProductContentFullWithGroupFragment
  ): boolean => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    if (product?.type === ProductTypesEnum.Variable) {
      const variableProduct = product as VariableProduct;
      return (
        variableProduct.variations?.nodes?.some(
          (variation: ProductVariation) => {
            const variationDate = new Date(variation?.date || "");
            return variationDate >= lastMonth;
          }
        ) || false
      );
    } else {
      const simpleProduct = product as SimpleProduct;
      const productDate = new Date(simpleProduct?.date || "");
      return productDate >= lastMonth;
    }
  };

  if (!product) return null;

  return (
    <div className={cn("relative w-full", className)}>
      <div className="absolute left-1 top-1 z-10">
        <BadgeList
          isSale={product?.onSale || false}
          isNewIn={isProductNew(product)}
        />
      </div>
      <Link href={uri} aria-label="Featured Image">
        <FeaturedImage
          sourceUrl={imageSelected}
          alt={product?.name || "Product"}
        />
      </Link>
      <div className="pt-3">
        <div className={cn("flex justify-between", mobileCol && "flex-col")}>
          <div>
            <Link href={uri}>
              <h3 className={cn("font-semibold", dark && "text-white")}>
                {product?.name}
              </h3>
            </Link>
            <div className="flex items-center gap-2">
              {product.type === ProductTypesEnum.Variable &&
                (product as VariableProduct).attributes?.nodes?.map(
                  (attribute: GlobalProductAttribute) =>
                    attribute?.slug === "pa_colour" &&
                    attribute.fullOptions?.map((option, i) => (
                      <Link href={uri} key={i}>
                        <VariantSwatch
                          isUnavailable={false}
                          label={option?.name || ""}
                          value={option?.slug || ""}
                          onClick={() => setColourSelected(option?.slug || null)}
                          onMouseEnter={() => setColourSelected(option?.slug || null)}
                          selectedOptionValue={colourSelected || ""}
                          color1={option?.hk_swatch_colour || ""}
                          color2={option?.hk_swatch_colour_2 || ""}
                          size="small"
                        />
                      </Link>
                    ))
                )}
            </div>
          </div>

          <div className="flex justify-between">
            <ProductPrice
              price={product?.price || ""}
              regularPrice={product?.regularPrice || ""}
              onSale={product?.onSale || false}
              dark={dark}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

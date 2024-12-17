"use client";

import {
  GlobalProductAttribute,
  ProductVariationContentFragment,
  StockStatusEnum,
  VariableProduct,
} from "@/lib/headkit/generated";
import { useEffect, useState } from "react";
import { ProductPrice } from "@/components/product/product-price";
import { VariantSelector } from "./variant-selector";
import { AvailabilityStatus } from "../availability-status";
import { getVariationImages } from "@/lib/headkit/utils/get-variation-images";

interface Attribute {
  name: string;
  value: string;
  label: string;
}

interface ExtendedProductVariation extends ProductVariationContentFragment {
  attributeKeyValue: {
    [key: string]: Attribute;
  };
}

interface Props {
  parentProduct: VariableProduct;
  setVariableImage: (images: { src: string; alt: string }[]) => void;
  onSetProduct?: (product: ProductVariationContentFragment) => void;
}

export const ProductVariations = ({
  parentProduct,
  setVariableImage,
  onSetProduct,
}: Props) => {
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: string]: string;
  }>({});
  const [product, setProduct] = useState<ProductVariationContentFragment>();
  const [variations, setVariations] = useState<ExtendedProductVariation[]>([]);
  const [attributes, setAttributes] = useState<Array<GlobalProductAttribute>>([]);

  useEffect(() => {
    if (parentProduct) {
      const processedAttributes = parentProduct?.attributes?.nodes ?? [];
      const processedVariations = addAttributeKeyValue(
        parentProduct?.variations?.nodes ?? []
      );

      setAttributes(processedAttributes);
      setVariations(processedVariations);
    }
  }, [parentProduct]);

  useEffect(() => {
    const matchedProduct = findProductByAttributes(variations, selectedOptions);
    setProduct(matchedProduct);

    if (matchedProduct) {
      setVariableImage(getVariationImages(matchedProduct));
    }

    if (onSetProduct && matchedProduct) {
      onSetProduct(matchedProduct);
    }

    // Update the query params in the URL
    const params = new URLSearchParams();
    Object.entries(selectedOptions).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    window.history.replaceState(null, "", `?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOptions, variations]);

  const findProductByAttributes = (
    products: ExtendedProductVariation[],
    attributes: { [key: string]: string }
  ): ProductVariationContentFragment | undefined => {
    return products.find((product) =>
      Object.entries(product.attributeKeyValue).every(
        ([key, attr]) => attributes[key] === attr.value
      )
    );
  };

  const addAttributeKeyValue = (
    products: ProductVariationContentFragment[]
  ): ExtendedProductVariation[] => {
    return products.map((product) => ({
      ...product,
      attributeKeyValue: product?.attributes?.nodes?.reduce<{ [key: string]: Attribute }>(
        (acc, node) => {
          if (node?.name) {
            acc[node.name] = {
              name: node?.name ?? '',
              label: node?.label ?? '',
              value: node?.value ?? '',
            };
          }
          return acc;
        },
        {}
      ) ?? {},
    }));
  };

  return (
    <div>
      <div className="space-y-5">
        <VariantSelector
          attributes={attributes}
          variations={variations}
          onChange={(updatedOptions) => {
            if (Object.keys(updatedOptions).length > 0) {
              setSelectedOptions(updatedOptions);
            }
          }} // Update selected options on change
        />
      </div>

      {product && (
        <div className="mt-6">
          <AvailabilityStatus
            stockQuantity={product.stockQuantity ?? null}
            stockStatus={product.stockStatus ?? StockStatusEnum.InStock}
          />
        </div>
      )}

      <div className="mt-4">
        {product ? (
          <>
            <p>{product.description}</p>
            <ProductPrice
              price={product.price ?? ""}
              regularPrice={product.regularPrice ?? ""}
              onSale={product.onSale ?? false}
              size="big"
            />
          </>
        ) : (
          <ProductPrice
            price={parentProduct.price ?? ""}
            regularPrice={parentProduct.regularPrice ?? ""}
            onSale={parentProduct.onSale ?? false}
            size="big"
          />
        )}
      </div>
    </div>
  );
};

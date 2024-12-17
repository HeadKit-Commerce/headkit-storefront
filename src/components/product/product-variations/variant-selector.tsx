"use client";

import {
  GlobalProductAttribute,
  LocalProductAttribute,
  ProductAttributeTypesEnum,
  ProductVariationContentFragment,
  StockStatusEnum,
} from "@/lib/headkit/generated";
import { useEffect, useState } from "react";
import { VariantButton } from "./variant-button";
import { VariantSwatch } from "./variant-swatch";
import { cn } from "@/lib/utils";
import { customSizeSort } from "@/lib/headkit/utils/custom-size-sort";

interface Attribute {
  name: string;
  value: string;
  label: string;
}

interface ExtendedProductVariation extends ProductVariationContentFragment {
  attributeKeyValue: {
    [key in string]: Attribute;
  };
}

interface Props {
  attributes: Array<GlobalProductAttribute | LocalProductAttribute>;
  onChange: (selectedOptions: { [key: string]: string }) => void;
  variations: ExtendedProductVariation[];
}

export const VariantSelector = ({
  attributes,
  onChange,
  variations,
}: Props) => {
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: string]: string;
  }>({});
  const [filteredAttributes, setFilteredAttributes] = useState(attributes);

  useEffect(() => {
    const globalAttributes = attributes?.filter(
      (attr) => attr.scope === ProductAttributeTypesEnum.Global
    );
    const localAttributes = attributes?.filter(
      (attr) => attr.scope === ProductAttributeTypesEnum.Local
    );

    // Sort GLOBAL attributes: prioritize color first, then size (sorted)
    const sortedGlobalAttributes = globalAttributes?.sort((a, b) => {
      if (a.name === "pa_colour") return -1;
      if (b.name === "pa_colour") return 1;
      if (a.name === "pa_size" && b.name === "pa_size") return 0;
      return 0;
    });

    // Sort size attribute if it exists
    const sizeAttribute = sortedGlobalAttributes?.find(
      (attr) => attr.name === "pa_size"
    );
    if (sizeAttribute) {
      sizeAttribute.fullOptions =
        sizeAttribute.fullOptions?.toSorted(customSizeSort);
    }

    setFilteredAttributes([...sortedGlobalAttributes, ...localAttributes]);
  }, [attributes]);

  useEffect(() => {
    if (!filteredAttributes.length) return; // Wait for filteredAttributes to be ready

    const params = new URLSearchParams(window.location.search);
    const urlOptions: { [key: string]: string } = {};
    params.forEach((value, key) => {
      urlOptions[key] = value;
    });

    if (Object.keys(urlOptions).length > 0) {
      setSelectedOptions(urlOptions);
    } else {
      // Instead of finding a single default variant, build options attribute by attribute
      const defaultOptions: { [key: string]: string } = {};
      
      filteredAttributes.forEach((attribute) => {
        // Find all variations that match our current selected options
        const compatibleVariations = variations.filter((variant) => {
          return Object.entries(defaultOptions).every(([key, value]) => 
            variant.attributeKeyValue[key]?.value === value
          );
        });

        // Find first available option for this attribute
        const availableOption = attribute.fullOptions?.find((option) => {
          return compatibleVariations.some((variant) => 
            variant.attributeKeyValue[attribute.name ?? ""]?.value === option?.slug &&
            variant.stockStatus === "IN_STOCK"
          );
        });

        if (availableOption?.slug) {
          defaultOptions[attribute.name ?? ""] = availableOption.slug;
        }
      });

      if (Object.keys(defaultOptions).length > 0) {
        setSelectedOptions(defaultOptions);
      }
    }
  }, [variations, filteredAttributes]);

  useEffect(() => {
    onChange(selectedOptions);
  }, [selectedOptions, onChange]);

  const handleOptionSelect = (attributeName: string, optionValue: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [attributeName]: optionValue,
    }));
  };

  const filterOptions = (
    attribute: GlobalProductAttribute | LocalProductAttribute
  ) => {
    if (attribute.name === "pa_size" && selectedOptions["pa_colour"]) {
      const selectedColor = selectedOptions["pa_colour"];
      const validSizes = variations
        .filter(
          (variation) =>
            variation.attributeKeyValue["pa_colour"]?.value === selectedColor
        )
        .map((variation) => variation.attributeKeyValue["pa_size"]?.value);

      return attribute?.fullOptions?.filter((option) =>
        validSizes?.includes(option?.slug ?? "")
      );
    }

    return attribute.fullOptions;
  };

  const checkIsUnavailable = (attributeName: string, value: string) => {
    return variations.some((variation) => {
      return (
        variation.stockStatus === StockStatusEnum.OutOfStock &&
        variation?.attributes?.nodes.every((attr) => {
          return attr.name === attributeName
            ? value.toLowerCase() === attr?.value?.toLowerCase()
            : selectedOptions[attr?.name ?? ""]?.toLowerCase() ===
                attr?.value?.toLowerCase();
        })
      );
    });
  };

  return (
    <div>
      {filteredAttributes?.map((attribute) => (
        <div key={attribute.name} className="mb-4">
          <div className={cn("mb-1 flex items-center gap-2")}>
            <div className="font-semibold text-purple-800">
              {attribute.label}
            </div>
            <div className="text-gray-700 capitalize">
              {selectedOptions[attribute?.name ?? ""]}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {filterOptions(attribute)?.map((option, i) => {
              const isUnavailable = checkIsUnavailable(
                attribute.name ?? "",
                option?.slug ?? ""
              );

              if (attribute.name === "pa_colour") {
                return (
                  <VariantSwatch
                    key={i}
                    isUnavailable={isUnavailable}
                    label={option?.name ?? ""}
                    value={option?.slug ?? ""}
                    onClick={() =>
                      handleOptionSelect(
                        attribute.name ?? "",
                        option?.slug ?? ""
                      )
                    }
                    selectedOptionValue={selectedOptions[attribute.name ?? ""]}
                    color1={option?.hk_swatch_colour ?? ""}
                    color2={option?.hk_swatch_colour_2 ?? undefined}
                  />
                );
              } else {
                return (
                  <VariantButton
                    key={i}
                    isUnavailable={isUnavailable}
                    label={option?.name ?? ""}
                    value={option?.slug ?? ""}
                    onClick={() =>
                      handleOptionSelect(
                        attribute.name ?? "",
                        option?.slug ?? ""
                      )
                    }
                    selectedOptionValue={selectedOptions[attribute.name ?? ""]}
                  />
                );
              }
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

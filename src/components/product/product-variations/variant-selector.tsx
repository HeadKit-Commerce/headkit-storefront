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
import { customSizeSort } from "@/lib/headkit/utils/custom-size-sort";
import { useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();

  useEffect(() => {
    const globalAttributes = attributes?.filter(
      (attr) => attr.scope === ProductAttributeTypesEnum.Global
    );
    const localAttributes = attributes?.filter(
      (attr) => attr.scope === ProductAttributeTypesEnum.Local
    ).map(attr => ({
      ...attr,
      name: attr.name?.toLowerCase()
    }));

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

    const urlOptions: { [key: string]: string } = {};
    searchParams.forEach((value, key) => {
      urlOptions[key] = value;
    });

    if (Object.keys(urlOptions).length > 0) {
      // Find missing required attributes
      const missingAttributes = filteredAttributes.filter(
        (attr) => !urlOptions[attr.name ?? ""]
      );

      // For each missing attribute, find a valid option based on current selections
      missingAttributes.forEach((attribute) => {
        if (!attribute.name || !attribute.fullOptions?.length) return;

        // Find variations that match our current URL options
        const compatibleVariations = variations.filter((variant) =>
          Object.entries(urlOptions).every(
            ([key, value]) => variant.attributeKeyValue[key]?.value === value
          )
        );

        // First try to find an in-stock option
        let availableOption = attribute.fullOptions.find((option) => {
          return compatibleVariations.some(
            (variant) =>
              variant.attributeKeyValue[attribute.name ?? ""]?.value === option?.slug &&
              variant.stockStatus === StockStatusEnum.InStock
          );
        });

        // If no in-stock options found, fall back to any available option
        if (!availableOption) {
          availableOption = attribute.fullOptions.find((option) => {
            return compatibleVariations.some(
              (variant) =>
                variant.attributeKeyValue[attribute.name ?? ""]?.value === option?.slug
            );
          });
        }

        // If still no option found, use the first option from fullOptions
        if (!availableOption) {
          availableOption = attribute.fullOptions[0];
        }

        if (availableOption?.slug) {
          urlOptions[attribute.name] = availableOption.slug;
        }
      });

      setSelectedOptions(urlOptions);
    } else {
      // Build options attribute by attribute
      const defaultOptions: { [key: string]: string } = {};

      filteredAttributes.forEach((attribute) => {
        if (!attribute.name || !attribute.fullOptions?.length) return;

        // Find all variations that match our current selected options
        const compatibleVariations = variations.filter((variant) => {
          return Object.entries(defaultOptions).every(([key, value]) =>
            variant.attributeKeyValue[key]?.value === value
          );
        });

        // First try to find an in-stock option
        let availableOption = attribute.fullOptions.find((option) => {
          return compatibleVariations.some((variant) =>
            variant.attributeKeyValue[attribute.name ?? ""]?.value === option?.slug &&
            variant.stockStatus === StockStatusEnum.InStock
          );
        });

        // If no in-stock options found, fall back to any available option
        if (!availableOption) {
          availableOption = attribute.fullOptions.find((option) => {
            return compatibleVariations.some((variant) =>
              variant.attributeKeyValue[attribute.name ?? ""]?.value === option?.slug
            );
          });
        }

        // If still no option found, use the first option from fullOptions
        if (!availableOption) {
          availableOption = attribute.fullOptions[0];
        }

        if (availableOption?.slug) {
          defaultOptions[attribute.name] = availableOption.slug;
        }
      });

      setSelectedOptions(defaultOptions);
    }
  }, [variations, filteredAttributes, searchParams]);

  useEffect(() => {
    onChange(selectedOptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOptions]);

  const handleOptionSelect = (attributeName: string, optionValue: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [attributeName]: optionValue,
    }));
  };

  const filterOptions = (
    attribute: GlobalProductAttribute | LocalProductAttribute
  ): Array<{ name: string; slug: string; hk_swatch_colour?: string; hk_swatch_colour_2?: string }> => {
    // Handle size filtering when color is selected
    if (attribute.name === "pa_size" && selectedOptions["pa_colour"]) {
      const selectedColor = selectedOptions["pa_colour"];
      const validSizes = variations
        .filter(
          (variation) =>
            variation.attributeKeyValue["pa_colour"]?.value === selectedColor
        )
        .map((variation) => variation.attributeKeyValue["pa_size"]?.value);

      return (attribute?.fullOptions?.filter((option) =>
        validSizes?.includes(option?.slug ?? "")
      ).map(option => ({
        name: option?.name ?? "",
        slug: option?.slug ?? "",
        hk_swatch_colour: option?.hk_swatch_colour ?? "",
        hk_swatch_colour_2: option?.hk_swatch_colour_2 ?? undefined
      })) ?? []);
    }

    // Handle Value attribute
    if (attribute.name?.toLowerCase() === "value") {
      if (!attribute.fullOptions || attribute.fullOptions.length === 0) {
        return (attribute.options?.map(option => ({
          name: option ?? "",
          slug: option ?? "",
        })) ?? []);
      }
    }

    return (attribute.fullOptions?.map(option => ({
      name: option?.name ?? "",
      slug: option?.slug ?? "",
      hk_swatch_colour: option?.hk_swatch_colour ?? "",
      hk_swatch_colour_2: option?.hk_swatch_colour_2 ?? undefined
    })) ?? []);
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
        <div key={attribute.name} className="mb-5">
          <div className="mb-2 flex items-center gap-2">
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

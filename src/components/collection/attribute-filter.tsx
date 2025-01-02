"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormItem } from "@/components/ui/form";
import { useCollection } from "./collection-context";
import { VariantSwatch } from "@/components/product/product-variations/variant-swatch";
import { GetProductFiltersQuery } from "@/lib/headkit/generated";
import { FilterValues } from "./types";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

interface AttributeFilterProps {
  attribute: NonNullable<NonNullable<GetProductFiltersQuery["productFilters"]>["attributes"]>[0] & {
    slug: string;
  };
}

export const AttributeFilter = ({ attribute }: AttributeFilterProps) => {
  const { setFilterValues, filterValues } = useCollection();

  return (
    <div className="grid grid-cols-2 gap-4">
      {attribute.choices?.map((option, index) => {
        if (!option?.slug || !option.name) return null;

        const currentValues = filterValues.attributes[attribute.slug] || [];
        const isSelected = currentValues.includes(option.slug);

        const handleChange = (checked: boolean) => {
          const newValue = checked
            ? [...currentValues, option.slug]
            : currentValues.filter((slug) => slug !== option.slug);

          const newAttributes: Record<string, string[]> = {};
          
          Object.entries(filterValues.attributes).forEach(([key, values]) => {
            const validValues = (values || []).filter((value): value is string => 
              typeof value === 'string' && value !== null && value !== undefined && value !== ''
            );
            newAttributes[key] = validValues;
          });
          
          newAttributes[attribute.slug] = newValue.filter((value): value is string => 
            typeof value === 'string' && value !== null && value !== undefined && value !== ''
          );

          const newFilterValues: FilterValues = {
            categories: filterValues.categories,
            brands: filterValues.brands,
            attributes: newAttributes,
            instock: filterValues.instock,
            sort: filterValues.sort,
            page: filterValues.page,
          };

          setFilterValues(newFilterValues);
        };

        const colors = Array.isArray(option.options) 
          ? option.options.filter((color): color is string => 
              typeof color === 'string' && color !== null && color !== undefined && color !== ''
            )
          : [];

        return (
          <FormItem key={index}>
            <FormControl>
              {attribute.slug === 'pa_colour' ? (
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={handleChange}
                    hidden
                  />
                  <VariantSwatch
                    color1={colors[0] || ""}
                    color2={colors[1]}
                    label={option.name}
                    value={option.slug}
                    selectedOptionValue={isSelected ? option.slug : undefined}
                    size="small"
                  />
                  <span className={cn("cursor-pointer", isSelected ? "font-bold" : "")}>
                    {option.name}
                  </span>
                </label>
              ) : (
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={handleChange}
                    hidden
                  />
                  {isSelected && <Icon.check className="w-4 h-4 stroke-pink-500" />}
                  <span className={cn("cursor-pointer", isSelected ? "font-bold" : "")}>
                    {option.name}
                  </span>
                </label>
              )}
            </FormControl>
          </FormItem>
        );
      })}
    </div>
  );
}; 
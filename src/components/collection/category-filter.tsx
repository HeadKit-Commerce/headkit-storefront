"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { useCollection } from "./collection-context";
import { useFormContext } from "react-hook-form";
import { FilterValues } from "./types";

interface CategoryFilterProps {
  categories: {
    slug: string;
    name: string;
  }[];
}

export const CategoryFilter = ({ categories }: CategoryFilterProps) => {
  const { setFilterValues, filterValues } = useCollection();
  const form = useFormContext<FilterValues>();

  return (
    <div className="grid grid-cols-2 gap-4">
      {categories.map((category, index) => (
        <FormField
          key={index}
          control={form.control}
          name="categories"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={field.value.includes(category.slug)}
                    onCheckedChange={(checked) => {
                      const newValue = checked
                        ? [...field.value, category.slug]
                        : field.value.filter((slug) => slug !== category.slug);
                      field.onChange(newValue);
                      setFilterValues({
                        ...filterValues,
                        categories: newValue,
                      });
                    }}
                  />
                  <span className="text-sm cursor-pointer">
                    {category.name}
                  </span>
                </label>
              </FormControl>
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}; 
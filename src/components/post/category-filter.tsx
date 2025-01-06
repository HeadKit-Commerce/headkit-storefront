"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { usePost } from "./post-context";
import { useFormContext } from "react-hook-form";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

interface Props {
  categories: Array<{
    name: string;
    slug: string;
  }>;
}

interface FilterValues {
  categories: string[];
  sort?: string;
}

export const CategoryFilter = ({ categories }: Props) => {
  const { setFilterValues, filterValues } = usePost();
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
                    hidden
                  />
                  {field.value.includes(category.slug) && <Icon.check className="w-4 h-4 stroke-lime-800" />}
                  <span className={cn("cursor-pointer", field.value.includes(category.slug) ? "font-bold" : "")}>
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
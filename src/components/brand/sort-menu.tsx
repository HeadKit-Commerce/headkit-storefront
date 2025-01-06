"use client";

import { cn } from "@/lib/utils";
import {
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";
import { useBrand } from "./brand-context";
import { SortKey, SortKeyLabels, SortKeyType } from "./utils";
import { useFormContext } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import { Icon } from "@/components/icon";

interface FilterValues {
  sort?: string;
}

export const SortMenu = () => {
  const { setFilterValues, filterValues } = useBrand();
  const form = useFormContext<FilterValues>();

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="cursor-pointer">Sort</NavigationMenuTrigger>
      <NavigationMenuContent>
        <FormField
          control={form.control}
          name="sort"
          render={({ field }) => (
            <div className="p-4 flex flex-col gap-2 items-end">
              {Object.entries(SortKey).map(([key]) => {
                const sortKey = key as SortKeyType;
                return (
                  <div
                    key={sortKey}
                    className={cn(
                      "cursor-pointer p-2 hover:text-purple-500 flex items-center w-fit gap-x-2",
                      field.value === sortKey && "font-bold"
                    )}
                    onClick={() => {
                      field.onChange(sortKey);
                      setFilterValues({
                        ...filterValues,
                        sort: sortKey,
                      });
                    }}
                  >
                    {field.value === sortKey && <Icon.check className="w-4 h-4 stroke-lime-800" />}
                    {SortKeyLabels[sortKey]}
                  </div>
                );
              })}
            </div>
          )}
        />
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}; 
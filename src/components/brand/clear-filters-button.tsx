"use client";

import { NavigationMenuItem } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { useBrand } from "./brand-context";

export const ClearFiltersButton = () => {
  const { filterValues, setFilterValues } = useBrand();

  const hasFilters = filterValues.sort !== undefined;

  if (!hasFilters) return null;

  const clearFilters = () => {
    setFilterValues({
      sort: undefined,
    });
  };

  return (
    <NavigationMenuItem>
      <Button
        variant="ghost"
        className="px-4 hover:text-purple-500 underline cursor-pointer text-sm"
        onClick={clearFilters}
      >
        Clear Filters
      </Button>
    </NavigationMenuItem>
  );
}; 
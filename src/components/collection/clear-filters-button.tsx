"use client";

import { NavigationMenuItem } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { useCollection } from "./collection-context";

export const ClearFiltersButton = () => {
  const { filterValues, clearFilters } = useCollection();

  const hasFilters = 
    filterValues.categories.length > 0 ||
    filterValues.brands.length > 0 ||
    Object.values(filterValues.attributes).some(arr => arr.length > 0) ||
    filterValues.instock ||
    filterValues.sort;

  if (!hasFilters) return null;

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
"use client";

import { NavigationMenuItem } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { usePost } from "./post-context";

export const ClearFiltersButton = () => {
  const { filterValues, setFilterValues } = usePost();

  const hasFilters = 
    filterValues.categories.length > 0 ||
    filterValues.sort !== undefined;

  if (!hasFilters) return null;

  const clearFilters = () => {
    setFilterValues({
      categories: [],
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
import { UseFormReturn } from "react-hook-form";
import { NavigationMenuItem } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { FilterValues } from "./types";

interface Props {
  form: UseFormReturn<FilterValues>;
  onClear: () => void;
}

export const ClearFiltersButton = ({ form, onClear }: Props) => {
  const hasFilters = 
    (form.watch("categories")?.length ?? 0) > 0 ||
    (form.watch("brands")?.length ?? 0) > 0 ||
    Object.values(form.watch("attributes") ?? {}).some(arr => (arr?.length ?? 0) > 0) ||
    form.watch("instock") ||
    form.watch("sort");

  if (!hasFilters) return null;

  return (
    <NavigationMenuItem>
      <Button
        variant="ghost"
        className="px-4 hover:text-purple-500 hover:underline cursor-pointer"
        onClick={onClear}
      >
        Clear Filters
      </Button>
    </NavigationMenuItem>
  );
}; 
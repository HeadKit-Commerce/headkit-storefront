import { UseFormReturn } from "react-hook-form";
import { FormControl, FormItem } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterValues } from "./types";

interface Props {
  form: UseFormReturn<FilterValues>;
  categories: Array<{ slug?: string | null; name?: string | null; }>;
}

export const CategoryFilter = ({ form, categories }: Props) => {
  return (
    <FormItem className="grid grid-cols-2 gap-4">
      {categories.map((category, index) => (
        <FormControl key={index}>
          <label className="flex items-center space-x-2">
            <Checkbox
              checked={form.watch("categories")?.includes(category?.slug || "")}
              onCheckedChange={(checked) => {
                const value = category?.slug || "";
                const currentValues = form.getValues("categories") || [];
                const newValue = checked
                  ? [...currentValues, value]
                  : currentValues.filter((v) => v !== value);
                form.setValue("categories", newValue);
              }}
            />
            <span className="text-sm cursor-pointer">
              {category?.name}
            </span>
          </label>
        </FormControl>
      ))}
    </FormItem>
  );
}; 
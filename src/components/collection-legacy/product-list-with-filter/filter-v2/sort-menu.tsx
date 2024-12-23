import { UseFormReturn } from "react-hook-form";
import {
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";
import { FormControl, FormItem } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { SortKey } from "../../utils";
import { FilterValues } from "./types";

interface Props {
  form: UseFormReturn<FilterValues>;
}

export const SortMenu = ({ form }: Props) => {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="cursor-pointer">Sort</NavigationMenuTrigger>
      <NavigationMenuContent>
        <FormItem className="p-4 text-right">
          {Object.entries(SortKey).map(([key, value]) => (
            <FormControl key={key}>
              <div
                className={cn(
                  "cursor-pointer p-2 hover:text-purple-500",
                  form.watch("sort") === key && "font-bold"
                )}
                onClick={() => form.setValue("sort", key)}
              >
                {value}
              </div>
            </FormControl>
          ))}
        </FormItem>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}; 
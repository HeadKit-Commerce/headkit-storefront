"use client";

import { cn } from "@/lib/utils";
import {
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";

interface Props {
  label: string;
  count?: number;
  children: React.ReactNode;
}

export const FilterMenuItem = ({
  label,
  count = 0,
  children,
}: Props) => {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>
        <div className={cn("relative cursor-pointer whitespace-nowrap", {
          "font-bold": count > 0,
        })}>
          <span>{label}</span>
          {count > 0 && (
            <div className="absolute right-[-12px] top-[-2px] h-[14px] w-[14px] rounded-full bg-purple-500 text-center text-[10px] font-medium text-white">
              {count}
            </div>
          )}
        </div>
      </NavigationMenuTrigger>
      <NavigationMenuContent className="bg-white p-4">
        {children}
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}; 
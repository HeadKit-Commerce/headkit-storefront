"use client";

import { useEffect, useState } from "react";
import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useBrand } from "./brand-context";
import { SortMenu } from "./sort-menu";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Transition } from "@headlessui/react";
import { ClearFiltersButton } from "./clear-filters-button";

interface FilterValues {
  sort?: string;
}

export const Filter = () => {
  const { loading, filterValues } = useBrand();
  const [menuOpen, setMenuOpen] = useState(false);

  const form = useForm<FilterValues>({
    defaultValues: filterValues,
  });

  // Update form values when filterValues change
  useEffect(() => {
    form.reset(filterValues);
  }, [filterValues, form]);

  // Cleanup menu overlay when component unmounts
  useEffect(() => {
    return () => {
      setMenuOpen(false);
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className={cn("w-full sticky top-20 z-10", menuOpen ? "bg-white" : "bg-white/80 hover:bg-white backdrop-blur-xs")}>
        <div className={cn("w-full transition-opacity", {
          "opacity-50 pointer-events-none": loading,
        })}>
          <Form {...form}>
            <div className="relative">
              <NavigationMenu
                onValueChange={(value) => setMenuOpen(!!value)}
                className="z-10 w-full flex justify-between items-center relative"
              >
                <Transition show={menuOpen}>
                  <div className="absolute top-full left-0 w-full h-screen bg-black/50 backdrop-blur-xs transition duration-300 ease-in-out data-closed:opacity-0 data-leave:opacity-0" />
                </Transition>

                <div className="flex w-full items-center justify-end overflow-x-auto px-5 md:px-10 py-5 scrollbar-hide">
                  <NavigationMenuList className="flex items-center gap-2 -mr-4">
                    <ClearFiltersButton />
                    <SortMenu />
                  </NavigationMenuList>
                </div>
              </NavigationMenu>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}; 
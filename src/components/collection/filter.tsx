"use client";

import { useEffect, useState } from "react";
import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useCollection } from "./collection-context";
import { FilterMenuItem } from "./filter-menu-item";
import { CategoryFilter } from "./category-filter";
import { AttributeFilter } from "./attribute-filter";
import { ClearFiltersButton } from "./clear-filters-button";
import { SortMenu } from "./sort-menu";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { FilterValues } from "./types";
import { GetProductFiltersQuery } from "@/lib/headkit/generated";
import { Switch } from "@/components/ui/switch";
import { Transition } from "@headlessui/react";

type ProductFilterAttribute = NonNullable<NonNullable<GetProductFiltersQuery["productFilters"]>["attributes"]>[0];

interface CategoryWithRequiredFields {
  slug: string;
  name: string;
}

export const Filter = () => {
  const {
    filterValues,
    productFilter,
    isLoading,
    setFilterValues,
  } = useCollection();

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

  const categories = productFilter?.productFilters?.categories?.filter((category): category is CategoryWithRequiredFields => {
    return category !== null && typeof category?.slug === 'string' && typeof category?.name === 'string';
  }).map(category => ({
    slug: category.slug,
    name: category.name,
  })) || [];

  const handleInstockChange = (checked: boolean) => {
    setFilterValues({
      ...filterValues,
      instock: checked,
      page: 0, // Reset page when filter changes
    });
  };

  return (
    <div className={cn("w-full sticky top-20 z-10", menuOpen ? "bg-white" : "bg-white/80 hover:bg-white backdrop-blur-xs")}>
      <div className={cn("w-full transition-opacity", {
        "opacity-50 pointer-events-none": isLoading,
      })}
      >
        <Form {...form}>
          <div className="relative">
            <NavigationMenu
              onValueChange={(value) => setMenuOpen(!!value)}
              className="z-10 w-full flex justify-between items-center relative"
            >
              <Transition show={menuOpen}>
                <div className="absolute top-full left-0 w-full h-screen bg-black/50 backdrop-blur-xs transition duration-300 ease-in-out data-closed:opacity-0 data-leave:opacity-0" />
              </Transition>

              <div className="flex w-full items-center justify-between overflow-x-auto px-5 md:px-10 py-5 scrollbar-hide">
                <NavigationMenuList className="flex items-center gap-0 -ml-4">
                  {/* Categories Filter */}
                  {categories.length > 0 && (
                    <FilterMenuItem
                      label="Category"
                      count={filterValues.categories.length}
                    >
                      <CategoryFilter categories={categories} />
                    </FilterMenuItem>
                  )}

                  {/* Attributes Filter */}
                  {productFilter?.productFilters?.attributes?.map((attribute: ProductFilterAttribute | null, index: number) => {
                    if (!attribute?.slug) return null;
                    const typedAttribute = attribute as ProductFilterAttribute & { slug: string };
                    return (
                      <FilterMenuItem
                        key={index}
                        label={typedAttribute.label || ''}
                        count={filterValues.attributes[typedAttribute.slug]?.length || 0}
                      >
                        <AttributeFilter attribute={typedAttribute} />
                      </FilterMenuItem>
                    );
                  })}

                  {/* In Stock Filter */}
                  <div className="flex items-center gap-2 px-2">
                    <Switch
                      checked={filterValues.instock}
                      onCheckedChange={handleInstockChange}
                    />
                    <span className={cn("whitespace-nowrap font-semibold", {
                      "font-bold": filterValues.instock,
                    })}>In Stock</span>
                  </div>

                  {/* Clear Filters Button */}
                  <ClearFiltersButton />
                </NavigationMenuList>

                <NavigationMenuList className="flex items-center gap-2 -mr-4">
                  {/* Sort Menu */}
                  <SortMenu />
                </NavigationMenuList>
              </div>
            </NavigationMenu>
          </div>
        </Form>
      </div>
    </div>
  );
}; 
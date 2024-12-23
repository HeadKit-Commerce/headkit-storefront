"use client";

import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Form } from "@/components/ui/form";
import { GetProductFiltersQuery } from "@/lib/headkit/generated";
import { useFilterForm } from "./use-filter-form";
import { FilterMenuItem } from "./filter-menu-item";
import { CategoryFilter } from "./category-filter";
import { AttributeFilter } from "./attribute-filter";
import { ClearFiltersButton } from "./clear-filters-button";
import { SortMenu } from "./sort-menu";
import type { FilterState } from "./types";

interface Props {
  productFilter: GetProductFiltersQuery;
  onChange: (filterState: FilterState) => void;
  initialPage?: number;
}

export const Filter = ({ productFilter, onChange, initialPage = 0 }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { form, handleClearFilters } = useFilterForm(productFilter, {
    onChange,
    initialPage,
  });

  const categories = productFilter?.productFilters?.categories?.filter((category): category is NonNullable<typeof category> & {
    slug: string;
    name: string;
  } => {
    return category !== null && typeof category.slug === 'string' && typeof category.name === 'string';
  }) || [];

  return (
    <Form {...form}>
      <form 
        className="w-full sticky top-20 z-10"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className="w-full bg-white">
          <NavigationMenu
            onValueChange={(value) => setMenuOpen(!!value)}
            className="z-10 w-full flex justify-between items-center relative"
          >
            {menuOpen && <div className="absolute top-full left-0 w-full h-screen bg-black/50" />}
            <div className="flex w-full items-center justify-between overflow-x-auto bg-white px-5 py-5 md:px-10 scrollbar-hide">
              <NavigationMenuList>
                {/* Categories Filter */}
                {categories.length > 0 && (
                  <FilterMenuItem
                    label="Category"
                    count={form.watch("categories")?.length}
                  >
                    <CategoryFilter 
                      form={form} 
                      categories={categories}
                    />
                  </FilterMenuItem>
                )}

                {/* Attributes Filter */}
                {productFilter?.productFilters?.attributes?.map((attribute, index) => (
                  attribute?.slug && (
                    <FilterMenuItem
                      key={index}
                      label={attribute?.label || ''}
                      count={form.watch(`attributes.${attribute.slug}`)?.length}
                    >
                      <AttributeFilter form={form} attribute={attribute} />
                    </FilterMenuItem>
                  )
                ))}

                {/* Clear Filters Button */}
                <ClearFiltersButton
                  form={form}
                  onClear={handleClearFilters}
                />
              </NavigationMenuList>

              <NavigationMenuList>
                {/* Sort Menu */}
                <SortMenu form={form} />
              </NavigationMenuList>
            </div>
          </NavigationMenu>
        </div>
      </form>
    </Form>
  );
}; 
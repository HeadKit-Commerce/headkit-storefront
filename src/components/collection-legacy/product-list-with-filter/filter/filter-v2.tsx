"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useCallback, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GetProductFiltersQuery } from "@/lib/headkit/generated";
import { SortKey } from "../../utils";
import { VariantSwatch } from "@/components/product/product-variations/variant-swatch";

// Define the filter schema
const filterSchema = z.object({
  categories: z.array(z.string()).optional(),
  brands: z.array(z.string()).optional(),
  attributes: z.record(z.array(z.string())).optional(),
  instock: z.boolean().optional(),
  sort: z.string().optional(),
});

type FilterValues = z.infer<typeof filterSchema>;

interface Props {
  productFilter: GetProductFiltersQuery;
  onChange: (filterState: { [key: string]: string | string[] }) => void;
}

const FilterV2 = ({ productFilter, onChange }: Props) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      categories: [],
      brands: [],
      attributes: {},
      instock: false,
      sort: "",
    },
  });

  // Initialize form with URL params
  useEffect(() => {
    const params: FilterValues = {
      categories: searchParams.get("categories")?.split(",").filter(Boolean) || [],
      brands: searchParams.get("brands")?.split(",").filter(Boolean) || [],
      attributes: {},
      instock: searchParams.get("instock") === "true",
      sort: searchParams.get("sort") || "",
    };

    // Handle attributes
    productFilter?.productFilters?.attributes?.forEach((attr) => {
      if (attr?.slug) {
        const values = searchParams.get(attr.slug)?.split(",").filter(Boolean) || [];
        if (values.length) {
          params.attributes = {
            ...params.attributes,
            [attr.slug]: values,
          };
        }
      }
    });

    form.reset(params);
  }, [searchParams, productFilter, form]);

  // Modify onSubmit to handle form submission correctly
  const handleFilterChange = useCallback((values: FilterValues) => {
    const filterState: { [key: string]: string | string[] } = {};
    const params = new URLSearchParams();

    // Handle categories
    if (values.categories?.length) {
      filterState.categories = values.categories;
      params.set('categories', values.categories.join(','));
    }

    // Handle brands
    if (values.brands?.length) {
      filterState.brands = values.brands;
      params.set('brands', values.brands.join(','));
    }

    // Handle attributes
    if (values.attributes) {
      Object.entries(values.attributes).forEach(([key, value]) => {
        if (value?.length) {
          filterState[key] = value;
          params.set(key, value.join(','));
        }
      });
    }

    // Handle instock
    if (values.instock) {
      filterState.instock = "true";
      params.set('instock', 'true');
    }

    // Handle sort
    if (values.sort) {
      filterState.sort = values.sort;
      params.set('sort', values.sort);
    }

    // Preserve page parameter if it exists
    const pageParam = searchParams.get('page');
    if (pageParam) {
      params.set('page', pageParam);
    }

    // Compare current URL params with new ones (excluding page)
    const currentParams = new URLSearchParams(searchParams);
    const currentFilterState = Array.from(currentParams.entries()).reduce((acc, [key, value]) => {
      if (key !== 'page') {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);

    const newFilterState = Array.from(params.entries()).reduce((acc, [key, value]) => {
      if (key !== 'page') {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);

    const hasChanged = JSON.stringify(currentFilterState) !== JSON.stringify(newFilterState);

    if (hasChanged) {
      // Update URL using replaceState
      window.history.replaceState(
        null,
        '',
        `${pathname}${params.toString() ? `?${params.toString()}` : ''}`
      );

      onChange(filterState);
    }
  }, [pathname, searchParams, onChange]);

  // Update the watch effect to use handleFilterChange
  useEffect(() => {
    const subscription = form.watch((value) => {
      const timeoutId = setTimeout(() => {
        handleFilterChange(value as FilterValues);
      }, 300);

      return () => clearTimeout(timeoutId);
    });

    return () => subscription.unsubscribe();
  }, [form, handleFilterChange]);

  // Update handleClearFilters to prevent infinite loop
  const handleClearFilters = useCallback(() => {
    // Temporarily remove the watch subscription
    const subscription = form.watch(() => {});
    subscription.unsubscribe();

    // Reset form and update URL
    form.reset({
      categories: [],
      brands: [],
      attributes: {},
      instock: false,
      sort: "",
    });

    // Preserve only page parameter
    const pageParam = searchParams.get('page');
    const params = new URLSearchParams();
    if (pageParam) {
      params.set('page', pageParam);
    }

    // Update URL
    window.history.replaceState(
      null,
      '',
      `${pathname}${params.toString() ? `?${params.toString()}` : ''}`
    );
    
    // Trigger onChange directly
    onChange({});

    // Re-setup the watch effect in the next tick
    setTimeout(() => {
      const newSubscription = form.watch((value) => {
        const timeoutId = setTimeout(() => {
          handleFilterChange(value as FilterValues);
        }, 300);
        return () => clearTimeout(timeoutId);
      });
      return () => newSubscription.unsubscribe();
    }, 0);

  }, [form, pathname, onChange, searchParams, handleFilterChange]);

  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleFilterChange(form.getValues());
        }}
        className="w-full sticky top-20 z-10"
      >
        <div className="w-full bg-white">
          <div className="relative">
            <NavigationMenu onValueChange={(value) => {
              setMenuOpen(!!value)
            }} className="z-10 w-full flex justify-between items-center relative">
              {menuOpen && <div className="absolute top-full left-0 w-full h-screen bg-black/50" />}
              <div className="flex w-full items-center justify-between overflow-x-auto bg-white px-5 py-5 md:px-10 scrollbar-hide">
                <NavigationMenuList>
                  {/* Categories Filter */}
                  {productFilter?.productFilters?.categories?.length ? (
                    <NavigationMenuItem>
                      <NavigationMenuTrigger>
                        <div className={cn("relative cursor-pointer whitespace-nowrap", {
                          "font-bold": form.watch("categories")?.length || 0 > 0,
                        })}>
                          <span>Category</span>
                          {form.watch("categories")?.length ? (
                            <div className="absolute right-[-12px] top-[-2px] h-[14px] w-[14px] rounded-full bg-purple-500 text-center text-[10px] font-medium text-white">
                              {form.watch("categories")?.length || 0}
                            </div>
                          ) : null}
                        </div>
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="bg-white p-4">
                        <FormField
                          control={form.control}
                          name="categories"
                          render={({ field }) => (
                            <FormItem className="grid grid-cols-2 gap-4">
                              {productFilter?.productFilters?.categories?.map((category, index) => (
                                <FormControl key={index}>
                                  <label className="flex items-center space-x-2">
                                    <Checkbox
                                      checked={field.value?.includes(category?.slug || "")}
                                      onCheckedChange={(checked) => {
                                        const value = category?.slug || "";
                                        const newValue = checked
                                          ? [...(field.value || []), value]
                                          : field.value?.filter((v) => v !== value) || [];
                                        field.onChange(newValue);
                                      }}
                                    />
                                    <span className="text-sm cursor-pointer">
                                      {category?.name}
                                    </span>
                                  </label>
                                </FormControl>
                              ))}
                            </FormItem>
                          )}
                        />
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ) : null}

                  {/* Color/Attributes Filter */}
                  {productFilter?.productFilters?.attributes?.map((attribute, index) => (
                    <NavigationMenuItem key={index}>
                      <NavigationMenuTrigger>
                        <div className={cn("relative whitespace-nowrap", {
                          "font-bold": form.watch(`attributes.${attribute?.slug}`)?.length || 0 > 0,
                        })}>
                          <span>{attribute?.label}</span>
                          {form.watch(`attributes.${attribute?.slug}`)?.length ? (
                            <div className="absolute right-[-12px] top-[-2px] h-[14px] w-[14px] rounded-full bg-purple-500 text-center text-[10px] font-medium text-white">
                              {form.watch(`attributes.${attribute?.slug}`)?.length || 0}
                            </div>
                          ) : null}
                        </div>
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="bg-white p-4">
                        <FormField
                          control={form.control}
                          name={`attributes.${attribute?.slug}`}
                          render={({ field }) => (
                            <FormItem className="grid grid-cols-2 gap-4">
                              {attribute?.choices?.map((option, index) => (
                                <FormControl key={index}>
                                  <label className="flex items-center space-x-2">
                                    {attribute.slug === 'pa_colour' ? (
                                      <label className="flex items-center space-x-2">
                                        <Checkbox
                                          checked={field.value?.includes(option?.slug || "")}
                                          onCheckedChange={(checked) => {
                                            const value = option?.slug || "";
                                            const newValue = checked
                                              ? [...(field.value || []), value]
                                              : field.value?.filter((v) => v !== value) || [];
                                            field.onChange(newValue);
                                          }}
                                          hidden
                                        />
                                        <VariantSwatch
                                          color1={option?.options?.[0] || ""}
                                          color2={option?.options?.[1] || ""}
                                          label={option?.name || ""}
                                          value={option?.slug || ""}
                                          selectedOptionValue={
                                            field.value?.includes(option?.slug || "")
                                              ? option?.slug || ""
                                              : undefined
                                          }
                                        />
                                      </label>
                                    ) : (
                                      <Checkbox
                                        checked={field.value?.includes(option?.slug || "")}
                                        onCheckedChange={(checked) => {
                                          const value = option?.slug || "";
                                          const newValue = checked
                                            ? [...(field.value || []), value]
                                            : field.value?.filter((v) => v !== value) || [];
                                          field.onChange(newValue);
                                        }}
                                      />
                                    )}
                                    <span className="text-sm cursor-pointer">
                                      {option?.name}
                                    </span>
                                  </label>
                                </FormControl>
                              ))}
                            </FormItem>
                          )}
                        />
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ))}

                  {/* Clear Filters Button */}
                  {((form.watch("categories")?.length ?? 0) > 0 ||
                    (form.watch("brands")?.length ?? 0) > 0 ||
                    Object.values(form.watch("attributes") ?? {}).some(arr => (arr?.length ?? 0) > 0) ||
                    form.watch("instock") ||
                    form.watch("sort")) && (
                      <NavigationMenuItem>
                        <Button
                          variant="ghost"
                          className="px-4 hover:text-purple-500 hover:underline cursor-pointer"
                          onClick={handleClearFilters}
                        >
                          Clear Filters
                        </Button>
                      </NavigationMenuItem>
                    )}
                </NavigationMenuList>

                {/* Sort Menu */}
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="cursor-pointer">Sort</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <FormField
                        control={form.control}
                        name="sort"
                        render={({ field }) => (
                          <FormItem className="p-4 text-right">
                            {Object.entries(SortKey).map(([key, value]) => (
                              <FormControl key={key}>
                                <div
                                  className={cn(
                                    "cursor-pointer p-2 hover:text-purple-500",
                                    field.value === key && "font-bold"
                                  )}
                                  onClick={() => field.onChange(key)}
                                >
                                  {value}
                                </div>
                              </FormControl>
                            ))}
                          </FormItem>
                        )}
                      />
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </div>
            </NavigationMenu>
          </div>
        </div>
      </form>
    </Form>
  );
};

export { FilterV2 }; 
"use client";

import { GetProductFiltersQuery } from "@/lib/headkit/generated";
import { FilterList } from "./filter-list";
import { useEffect, useState } from "react";
import { ToggleFilter } from "./toggle-filter";
import { SortKey } from "../../utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

interface FilterState {
  [key: string]: string | string[];
}

interface Props {
  initialFilterState: FilterState;
  productFilter: GetProductFiltersQuery;
  onChange: (filterState: FilterState) => void;
}

const Filter = ({ productFilter, initialFilterState, onChange }: Props) => {
  const [filterValue, setFilterValue] = useState<FilterState>(initialFilterState);
  const [clearFilterCount, setClearFilterCount] = useState(0);
  const [selectedCounts, setSelectedCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    // Update selected counts
    const counts: Record<string, number> = {};
    Object.entries(filterValue).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        counts[key] = value.filter(Boolean).length;
      } else if (value) {
        counts[key] = 1;
      }
    });
    setSelectedCounts(counts);

    // Update URL and notify parent
    const params = new URLSearchParams();
    Object.entries(filterValue).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        params.set(key, value.join(','));
      } else if (value) {
        params.set(key, value.toString());
      }
    });

    const newUrl = params.toString() 
      ? `?${params.toString()}` 
      : window.location.pathname;
    
    window.history.pushState(null, "", newUrl);
    onChange(filterValue);
  }, [filterValue, onChange]);

  const handleFilterChange = ({ slug, value }: { slug: string; value: string | string[] }) => {
    setFilterValue((prev) => ({
      ...prev,
      [slug]: value,
    }));
  };

  const handleClearFilters = () => {
    setClearFilterCount(prev => prev + 1);
    setFilterValue({});
    window.history.pushState(null, "", window.location.pathname);
    onChange({});
  };

  return (
    <div className="group sticky top-[80px] z-20 h-[60px] w-full">
      <div className="relative h-full w-full">
        <NavigationMenu className="z-10 w-full flex justify-between items-center relative">
          <div className="flex h-full w-full items-center justify-between overflow-x-auto bg-white px-5 py-5 group-hover:bg-white md:px-10 scrollbar-hide">
            <NavigationMenuList>
              {productFilter?.productFilters?.categories?.length ? (
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <div className={cn("relative cursor-default whitespace-nowrap", {
                      "font-bold": selectedCounts['categories'] > 0,
                    })}>
                      <span>Category</span>
                      {selectedCounts['categories'] > 0 && (
                        <div className="absolute right-[-12px] top-[-2px] h-[14px] w-[14px] rounded-full bg-purple-500 text-center text-[10px] font-medium text-white">
                          {selectedCounts['categories']}
                        </div>
                      )}
                    </div>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-white px-5 py-10 md:px-10">
                    <FilterList
                      name={"Category"}
                      slug={"categories"}
                      data={productFilter?.productFilters?.categories.map((item) => ({
                        id: item?.id || "",
                        name: item?.name || "",
                        slug: item?.slug || "",
                      })) || []}
                      onChange={handleFilterChange}
                      multipleSelect
                      className="first:!pl-0"
                      clearFilter={clearFilterCount}
                    />
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : null}

              {productFilter?.productFilters?.attributes?.map((item, i) => (
                <NavigationMenuItem key={i}>
                  <NavigationMenuTrigger>
                    <div className={cn("relative cursor-default whitespace-nowrap", {
                      "font-bold": selectedCounts[item?.slug || ''] > 0,
                    })}>
                      <span>{item?.label || ""}</span>
                      {selectedCounts[item?.slug || ''] > 0 && (
                        <div className="absolute right-[-12px] top-[-2px] h-[14px] w-[14px] rounded-full bg-purple-500 text-center text-[10px] font-medium text-white">
                          {selectedCounts[item?.slug || '']}
                        </div>
                      )}
                    </div>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <FilterList
                      name={item?.label || ""}
                      slug={item?.slug || ""}
                      data={item?.choices?.map((choice) => ({
                        id: choice?.id || "",
                        name: choice?.name || "",
                        slug: choice?.slug || "",
                        options: choice?.options?.filter((opt): opt is string => opt !== null) || [],
                        count: choice?.count || 0,
                      })) || []}
                      onChange={handleFilterChange}
                      multipleSelect
                      className="first:!pl-0"
                      clearFilter={clearFilterCount}
                    />
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}

              {productFilter?.productFilters?.brands && productFilter?.productFilters?.brands?.length > 0 ? (
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <div className={cn("relative cursor-default whitespace-nowrap", {
                      "font-bold": selectedCounts['brands'] > 0,
                    })}>
                      <span>Brand</span>
                      {selectedCounts['brands'] > 0 && (
                        <div className="absolute right-[-12px] top-[-2px] h-[14px] w-[14px] rounded-full bg-purple-500 text-center text-[10px] font-medium text-white">
                          {selectedCounts['brands']}
                        </div>
                      )}
                    </div>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <FilterList
                      name={"Brand"}
                      slug={"brands"}
                      data={productFilter?.productFilters?.brands.map((item) => ({
                        id: item?.id || "",
                        name: item?.name || "",
                        slug: item?.slug || "",
                      })) || []}
                      onChange={handleFilterChange}
                      multipleSelect
                      className="first:!pl-0"
                      clearFilter={clearFilterCount}
                    />
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : null}

              <NavigationMenuItem>
                <ToggleFilter
                  name="In Stock"
                  slug="instock"
                  onChange={handleFilterChange}
                />
              </NavigationMenuItem>

              {filterValue && Object.keys(filterValue).length > 0 && (
                <NavigationMenuItem>
                  <div
                    className="flex h-full cursor-pointer items-center justify-center whitespace-nowrap px-4 py-2 hover:text-purple-500 hover:underline"
                    onClick={handleClearFilters}
                  >
                    Clear Filters
                  </div>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>

            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Sort</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <FilterList
                    name={"Sort"}
                    slug={"sort"}
                    data={Object.entries(SortKey).map(([key, value]) => ({
                      name: value,
                      slug: key,
                    }))}
                    onChange={handleFilterChange}
                    align="right"
                    className="last:!pr-0"
                    clearFilter={clearFilterCount}
                  />
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </div>
        </NavigationMenu>
      </div>
    </div>
  );
};

export { Filter };

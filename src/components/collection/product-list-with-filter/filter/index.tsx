"use client";

import { GetProductFiltersQuery } from "@/lib/headkit/generated";
import { cn } from "@/lib/utils";
import { FilterList } from "./filter-list";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ToggleFilter } from "./toggle-filter";
import { SortKey } from "../../utils";

interface FilterState {
  [key: string]: string | string[];
}

interface Props {
  initialFilterState: FilterState;
  productFilter: GetProductFiltersQuery;
  onChange: (filterState: FilterState) => void;
}

const Filter = ({ productFilter, initialFilterState, onChange }: Props) => {
  const [filterValue, setFilterValue] = useState<FilterState | null>(initialFilterState);
  const [clearFilterCount, setClearFilterCount] = useState(0);
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleFilterChange = (currentFilter: FilterState | null) => {
      try {
        const params = new URLSearchParams(searchParams);

        if (currentFilter) {
          Object.entries(currentFilter).forEach(([key, value]) => {
            if (Array.isArray(value) ? value.length > 0 : value) {
              params.set(key, value.toString());
            } else {
              params.delete(key);
            }
          });
        } else {
          // Keep only search parameter when filters are cleared
          const search = params.get("s");
          params.forEach((_, key) => params.delete(key));
          if (search) params.set("s", search);
        }

        window.history.replaceState(null, "", `?${params.toString()}`);
      } catch (error) {
        console.error("Error updating URL:", error);
      }
    };

    handleFilterChange(filterValue);
    onChange(filterValue ?? {});
  }, [filterValue, searchParams, onChange]);

  return (
    <div className={cn("group sticky top-[80px] z-20 h-[60px] w-full")}>
      <div className="relative h-full w-full">
        <div
          className={cn(
            "flex h-full w-full items-center justify-between overflow-x-auto bg-white/80 px-5 group-hover:bg-white md:px-10"
          )}
        >
          <div className="flex h-full items-center">
            {productFilter?.productFilters?.categories?.length && productFilter?.productFilters?.categories?.length > 0 && (
              <FilterList
                name={"Category"}
                slug={"categories"}
                data={productFilter?.productFilters?.categories.map((item) => ({
                  id: item?.id || "",
                  name: item?.name || "",
                  slug: item?.slug || "",
                })) || []}
                onChange={({ slug, value }) => {
                  setFilterValue((prev) => {
                    return { ...prev, [slug]: value };
                  });
                }}
                multipleSelect
                className="first:!pl-0"
                clearFilter={clearFilterCount}
              />
            )}

            {productFilter?.productFilters?.attributes?.map((item, i) => {
              if (item?.choices?.length && item?.choices?.length > 0) {
                return (
                  <FilterList
                    key={i}
                    name={item?.label || ""}
                    slug={item?.slug || ""}
                    data={item?.choices?.map((choice) => ({
                      id: choice?.id || "",
                      name: choice?.name || "",
                      slug: choice?.slug || "",
                      options: choice?.options?.filter((opt): opt is string => opt !== null) || [],
                      count: choice?.count || 0,
                    })) || []}
                    onChange={({ slug, value }) => {
                      setFilterValue((prev) => {
                        return { ...prev, [slug]: value };
                      });
                    }}
                    multipleSelect
                    className="first:!pl-0"
                    clearFilter={clearFilterCount}
                  />
                );
              } else {
                return null;
              }
            })}

            {productFilter?.productFilters?.brands && productFilter?.productFilters?.brands?.length > 0 && (
              <FilterList
                name={"Brand"}
                slug={"brands"}
                data={productFilter?.productFilters?.brands.map((item) => ({
                  id: item?.id || "",
                  name: item?.name || "",
                  slug: item?.slug || "",
                })) || []}
                onChange={({ slug, value }) => {
                  setFilterValue((prev) => {
                    return { ...prev, [slug]: value };
                  });
                }}
                multipleSelect
                className="first:!pl-0"
                clearFilter={clearFilterCount}
              />
            )}

            <ToggleFilter
              name="In Stock"
              slug="instock"
              onChange={({ slug, value }) => {
                setFilterValue((prev) => {
                  return { ...prev, [slug]: value };
                });
              }}
            />

            {filterValue && Object.keys(filterValue).length > 0 && (
              <div
                className="flex h-full cursor-pointer items-center justify-center whitespace-nowrap px-4 py-2 hover:text-purple-500 hover:underline"
                onClick={() => {
                  setClearFilterCount(clearFilterCount + 1);
                  setFilterValue(null);
                }}
              >
                Clear Filters
              </div>
            )}
          </div>
          <div className="flex h-full items-center">
            <FilterList
              name={"Sort"}
              slug={"sort"}
              data={Object.entries(SortKey).map(([key, value]) => {
                return {
                  name: value,
                  slug: key,
                };
              })}
              onChange={({ slug, value }) => {
                setFilterValue((prev) => {
                  return { ...prev, [slug]: value };
                });
              }}
              align="right"
              className="last:!pr-0"
              clearFilter={clearFilterCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { Filter };

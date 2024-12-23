"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useCallback, useRef } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { GetProductFiltersQuery } from "@/lib/headkit/generated";
import { filterSchema, type FilterValues, type FilterState } from "./types";

const parseUrlParam = (param: string | null): string[] => {
  if (!param) return [];
  return param.split(",").filter(Boolean);
};

const defaultFilterValues: FilterValues = {
  categories: [],
  brands: [],
  attributes: {},
  instock: false,
  sort: "",
  page: 0,
};

const isFilterKey = (key: string): key is keyof FilterValues => {
  return ['categories', 'brands', 'attributes', 'instock', 'sort', 'page'].includes(key);
};

const convertFilterValuesToState = (values: FilterValues): FilterState => {
  const state: FilterState = {
    page: values.page,
  };

  if (values.categories.length > 0) {
    state.categories = values.categories;
  }

  if (values.brands.length > 0) {
    state.brands = values.brands;
  }

  if (values.instock) {
    state.instock = "true";
  }

  if (values.sort) {
    state.sort = values.sort;
  }

  // Handle attributes
  Object.entries(values.attributes).forEach(([key, value]) => {
    if (value.length > 0) {
      state[key] = value;
    }
  });

  return state;
};

interface UseFilterFormOptions {
  onChange: (filterState: FilterState) => void;
  initialPage?: number;
}

export const useFilterForm = (
  productFilter: GetProductFiltersQuery,
  options: UseFilterFormOptions
) => {
  const { onChange, initialPage = 0 } = options;
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const skipNextWatch = useRef(false);
  const lastFilterState = useRef<FilterValues>({ ...defaultFilterValues, page: initialPage });
  const isInitialMount = useRef(true);

  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: { ...defaultFilterValues, page: initialPage },
  });

  // Initialize form with URL params
  useEffect(() => {
    if (!isInitialMount.current) return;
    isInitialMount.current = false;

    try {
      // Get page from URL or use initialPage
      const urlPage = searchParams.get("page");
      const currentPage = urlPage ? parseInt(urlPage, 10) : initialPage;

      const params = filterSchema.parse({
        categories: parseUrlParam(searchParams.get("categories")),
        brands: parseUrlParam(searchParams.get("brands")),
        attributes: {},
        instock: searchParams.get("instock") === "true",
        sort: searchParams.get("sort") || "",
        page: currentPage,
      });
      
      // Handle attributes
      productFilter?.productFilters?.attributes?.forEach((attr) => {
        if (attr?.slug) {
          const values = parseUrlParam(searchParams.get(attr.slug));
          if (values.length) {
            params.attributes[attr.slug] = values;
          }
        }
      });

      // Only update if the values are different
      const currentValues = form.getValues();
      const hasChanges = JSON.stringify(currentValues) !== JSON.stringify(params);
      
      if (hasChanges) {
        skipNextWatch.current = true;
        form.reset(params);
        lastFilterState.current = params;
        // Notify parent about initial state
        onChange(convertFilterValuesToState(params));
      }
    } catch (error) {
      console.error('Error parsing URL params:', error);
      const defaultState = { ...defaultFilterValues, page: initialPage };
      form.reset(defaultState);
      onChange({ page: initialPage });
    }
  }, [searchParams, productFilter, form, initialPage, onChange]);

  // Handle form changes
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (skipNextWatch.current) {
        skipNextWatch.current = false;
        return;
      }

      // Ensure values are valid
      const validValues = filterSchema.parse(values);

      // Check if the values have actually changed
      if (JSON.stringify(lastFilterState.current) === JSON.stringify(validValues)) {
        return;
      }

      // Check if only the page has changed
      const isPageOnlyChange = Object.entries(validValues).every(([key, value]) => {
        if (key === 'page') return true;
        return JSON.stringify(value) === JSON.stringify(lastFilterState.current[key as keyof FilterValues]);
      });

      // Reset page to 0 if any other filter has changed
      if (!isPageOnlyChange) {
        validValues.page = 0;
      }

      const filterState = convertFilterValuesToState(validValues);
      const params = new URLSearchParams();

      // Preserve non-filter params
      searchParams.forEach((value, key) => {
        if (!isFilterKey(key) && 
            !productFilter?.productFilters?.attributes?.some(attr => attr?.slug === key)) {
          params.set(key, value);
        }
      });

      // Update URL params based on filter state
      Object.entries(filterState).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else {
          params.set(key, value.toString());
        }
      });

      lastFilterState.current = validValues;

      // Update URL and trigger onChange
      const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
      router.push(newUrl, { scroll: false });
      onChange(filterState);
    });

    return () => subscription.unsubscribe();
  }, [form, pathname, searchParams, onChange, router, productFilter]);

  const handleClearFilters = useCallback(() => {
    // When clearing filters, reset page to 0
    const emptyState: FilterValues = {
      ...defaultFilterValues,
      page: 0,
    };

    skipNextWatch.current = true;
    lastFilterState.current = emptyState;
    form.reset(emptyState);
    
    // Keep only non-filter params
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (!isFilterKey(key) && 
          !productFilter?.productFilters?.attributes?.some(attr => attr?.slug === key)) {
        params.set(key, value);
      }
    });

    const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(newUrl, { scroll: false });
    onChange({ page: 0 });
  }, [form, pathname, searchParams, router, onChange, productFilter]);

  return { form, handleClearFilters };
};
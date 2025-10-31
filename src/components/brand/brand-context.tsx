"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GetBrandsQuery, TermObjectsConnectionOrderbyEnum } from "@/lib/headkit/generated/index";
import { getBrands as getBrandList } from "@/lib/headkit/queries";
import { SortKeyType } from "./utils";

interface FilterValues {
  sort?: SortKeyType;
}

interface BrandContextType {
  brands: GetBrandsQuery;
  brandFilter: GetBrandsQuery;
  filterValues: FilterValues;
  setFilterValues: (values: FilterValues) => void;
  page: number;
  itemsPerPage: number;
  search?: string;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  hasPrevious: boolean;
  loadMore: () => Promise<void>;
  loadPrevious: () => Promise<void>;
  updateFilter: (key: string, value: string[]) => void;
  updateSort: (value: string) => void;
  clearFilters: () => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

interface BrandProviderProps {
  children: React.ReactNode;
  initialBrands: GetBrandsQuery;
  brandFilter: GetBrandsQuery;
  initialPage?: number;
  itemsPerPage?: number;
  search?: string;
}

export function BrandProvider({
  children,
  initialBrands,
  brandFilter,
  initialPage = 0,
  itemsPerPage = 24,
  search,
}: BrandProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [brands, setBrands] = useState<GetBrandsQuery>(initialBrands);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(initialPage);

  const hasMore = (brands?.brands?.nodes?.length ?? 0) > 0;
  const hasPrevious = page > 0;

  const filterValues: FilterValues = {
    sort: (searchParams.get("sort") as SortKeyType) || undefined,
  };

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    return params.toString();
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const newUrl = `${pathname}?${updateSearchParams({ page: nextPage.toString() })}`;
      router.push(newUrl);
      setPage(nextPage);
    } catch (error) {
      console.error("Error loading more brands:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const loadPrevious = async () => {
    if (loading || !hasPrevious) return;
    setLoading(true);
    try {
      const prevPage = Math.max(0, page - 1);
      const newUrl = `${pathname}?${updateSearchParams({ page: prevPage.toString() })}`;
      router.push(newUrl);
      setPage(prevPage);
    } catch (error) {
      console.error("Error loading previous brands:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: string, value: string[]) => {
    const newUrl = `${pathname}?${updateSearchParams({
      [key]: value.length > 0 ? value.join(",") : null,
      page: "0",
    })}`;
    router.push(newUrl);
    setPage(0);
  };

  const updateSort = (value: string) => {
    const newUrl = `${pathname}?${updateSearchParams({
      sort: value || null,
      page: "0",
    })}`;
    router.push(newUrl);
    setPage(0);
  };

  const clearFilters = () => {
    router.push(pathname);
    setPage(0);
  };

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(searchParams.toString());
        const page = parseInt(params.get("page") || "0");
        const sort = params.get("sort") || undefined;

        const response = await getBrandList({
          first: itemsPerPage,
          after: page > 0 ? btoa(`arrayconnection:${(page - 1) * itemsPerPage}`) : undefined,
          where: {
            orderby: sort ? TermObjectsConnectionOrderbyEnum.Name : undefined,
          },
        });
        
        if (response.data) {
          setBrands(response.data);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, [searchParams, pathname, itemsPerPage]);

  return (
    <BrandContext.Provider
      value={{
        brands,
        brandFilter,
        filterValues,
        setFilterValues: (values: FilterValues) => {
          const newUrl = `${pathname}?${updateSearchParams({
            sort: values.sort || null,
            page: "0",
          })}`;
          router.push(newUrl);
          setPage(0);
        },
        page,
        itemsPerPage,
        search,
        loading,
        loadingMore,
        hasMore,
        hasPrevious,
        loadMore,
        loadPrevious,
        updateFilter,
        updateSort,
        clearFilters,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error("useBrand must be used within a BrandProvider");
  }
  return context;
} 
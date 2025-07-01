"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getProductList } from "@/lib/headkit/actions";
import { GetProductFiltersQuery, GetProductListQuery, ProductContentFullWithGroupFragment } from "@/lib/headkit/generated";
import { makeWhereProductQuery, SortKeyType } from "./utils";

interface FilterValues {
  categories: string[];
  brands: string[];
  attributes: Record<string, string[]>;
  instock: boolean;
  sort: SortKeyType | "";
  page: number;
}

interface CollectionContextType {
  products: ProductContentFullWithGroupFragment[];
  totalProducts: number;
  currentPage: number;
  itemsPerPage: number;
  isLoading: boolean;
  isLoadingBefore: boolean;
  isLoadingAfter: boolean;
  hasMore: boolean;
  hasFirstPage: boolean;
  filterValues: FilterValues;
  setFilterValues: (values: FilterValues) => void;
  clearFilters: () => void;
  loadMore: () => void;
  loadPrevious: () => void;
  productFilter: GetProductFiltersQuery;
}

interface CollectionProviderProps {
  children: React.ReactNode;
  initialProducts: GetProductListQuery;
  productFilter: GetProductFiltersQuery;
  initialPage?: number;
  itemsPerPage?: number;
  onSale?: boolean;
  search?: string;
  newIn?: boolean;
}

const CollectionContext = createContext<CollectionContextType | null>(null);

const SPECIAL_PAGES = ["/shop", "/sale", "/new"];

export function CollectionProvider({
  children,
  initialProducts,
  productFilter,
  initialPage = 0,
  itemsPerPage = 24,
  onSale,
  search,
  newIn,
}: CollectionProviderProps) {
  const [products, setProducts] = useState<ProductContentFullWithGroupFragment[]>(
    (initialProducts.products?.nodes || []) as ProductContentFullWithGroupFragment[]
  );
  const [totalProducts, setTotalProducts] = useState(initialProducts.products?.found || 0);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBefore, setIsLoadingBefore] = useState(false);
  const [isLoadingAfter, setIsLoadingAfter] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasFirstPage, setHasFirstPage] = useState(initialPage === 0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse initial filter values from URL
  const [filterValues, setFilterValues] = useState<FilterValues>(() => {
    const initialValues: FilterValues = {
      categories: [],
      brands: [],
      attributes: {},
      instock: false,
      sort: "",
      page: initialPage,
    };

    // Check if we're on a brand page first
    const isBrandPage = pathname.startsWith('/brand/');
    const brandFromPath = isBrandPage ? pathname.split('/').pop() : undefined;

    // If we're on a brand page, use that brand and ignore URL brand params
    if (brandFromPath) {
      initialValues.brands = [brandFromPath];
    } else {
      // Only parse brands from URL if we're not on a brand page
      const brands = searchParams.get("brands")?.split(",").filter(Boolean) || [];
      if (brands.length) initialValues.brands = brands;
    }

    // Parse categories and brands
    const categories = searchParams.get("categories")?.split(",").filter(Boolean) || [];
    if (categories.length) initialValues.categories = categories;

    // Parse attributes from productFilter
    productFilter?.productFilters?.attributes?.forEach((attr) => {
      if (attr?.slug) {
        const values = searchParams.get(attr.slug)?.split(",").filter((value): value is string => 
          typeof value === 'string' && value !== null && value !== undefined && value !== ''
        ) || [];
        if (values.length) {
          initialValues.attributes[attr.slug] = values;
        }
      }
    });

    // Parse other values
    initialValues.instock = searchParams.get("instock") === "true";
    initialValues.sort = (searchParams.get("sort") || "") as SortKeyType | "";

    return initialValues;
  });

  const hasMore = products.length < totalProducts;

  const createUrl = (pageIndex: number) => {
    const params = new URLSearchParams(searchParams);
    if (pageIndex <= 0) {
      params.delete("page");
    } else {
      params.set("page", pageIndex.toString());
    }
    return `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
  };

  const fetchProducts = async (pageIndex: number, position: "before" | "after" | "middle") => {
    const setLoadingState = (isLoading: boolean) => {
      if (position === "before") setIsLoadingBefore(isLoading);
      else if (position === "after") setIsLoadingAfter(isLoading);
      else setIsLoading(isLoading);
    };

    if (isLoading || isLoadingBefore || isLoadingAfter) return;

    try {
      setLoadingState(true);
      
      // Only get categorySlug for non-special pages and non-brand pages
      const categorySlug = SPECIAL_PAGES.includes(pathname) || pathname.startsWith('/brand/') 
        ? undefined 
        : pathname.split("/").pop();

      // Create a copy of filterValues to avoid mutating state directly
      const queryFilters = { ...filterValues };

      // For brand pages, always ensure the correct brand is set
      if (pathname.startsWith('/brand/')) {
        const brandSlug = pathname.split('/').pop();
  
        queryFilters.brands = brandSlug ? [brandSlug] : [];
      }

      const { data: fetchedProducts } = await getProductList({
        input: {
          where: makeWhereProductQuery({
            filterQuery: queryFilters,
            categorySlug,
            page: pageIndex,
            perPage: itemsPerPage,
            onSale,
            search,
            newIn,
          }),
          first: itemsPerPage,
        },
      });

      const newProducts = (fetchedProducts?.products?.nodes || []) as ProductContentFullWithGroupFragment[];
      const totalFound = fetchedProducts?.products?.found || 0;

      // Don't update anything if we're trying to load more but got no products
      if (position === "after" && newProducts.length === 0) {
        setLoadingState(false);
        return;
      }

      // Update state based on position
      setCurrentPage(pageIndex);
      setTotalProducts(totalFound);

      if (position === "middle") {
        setProducts(newProducts);
        setHasFirstPage(pageIndex === 0);
      } else if (position === "before") {
        setProducts([...newProducts, ...products]);
        if (pageIndex === 0) setHasFirstPage(true);
      } else { // after
        setProducts([...products, ...newProducts]);
      }

      // Only update URL if we have products or it's not "after" position
      if (position !== "after" || newProducts.length > 0) {
        window.history.pushState(null, "", createUrl(pageIndex));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingState(false);
    }
  };

  // Reset products when filters change
  useEffect(() => {
    if (!isInitialLoad) {
      fetchProducts(0, "middle");
    }
    setIsInitialLoad(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValues, onSale, search]);

  // Handle URL changes
  useEffect(() => {
    const pageParam = searchParams.get("page");
    const newPageIndex = pageParam ? parseInt(pageParam) : 0;
    
    if (!isInitialLoad && newPageIndex !== currentPage && products.length < totalProducts) {
      fetchProducts(newPageIndex, newPageIndex > currentPage ? "after" : "before");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const clearFilters = () => {
    setFilterValues({
      categories: [],
      brands: [],
      attributes: {},
      instock: false,
      sort: "",
      page: 0,
    });
  };

  const loadMore = () => {
    fetchProducts(currentPage + 1, "after");
  };

  const loadPrevious = () => {
    if (currentPage > 0) {
      fetchProducts(currentPage - 1, "before");
    }
  };

  // Add this effect after other useEffects
  useEffect(() => {
    const isBrandPage = pathname.startsWith('/brand/');
    const brandFromPath = isBrandPage ? pathname.split('/').pop() : undefined;

    // Update brand filter when pathname changes
    if (isBrandPage && brandFromPath) {
      setFilterValues(prev => ({
        ...prev,
        brands: [brandFromPath]
      }));
    } else if (!isBrandPage && filterValues.brands.length === 1 && !searchParams.get("brands")) {
      // Clear brand filter when leaving brand page if it wasn't set by URL params
      setFilterValues(prev => ({
        ...prev,
        brands: []
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <CollectionContext.Provider
      value={{
        products,
        totalProducts,
        currentPage,
        itemsPerPage,
        isLoading,
        isLoadingBefore,
        isLoadingAfter,
        hasMore,
        hasFirstPage,
        filterValues,
        setFilterValues,
        clearFilters,
        loadMore,
        loadPrevious,
        productFilter,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
}

export function useCollection() {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error("useCollection must be used within a CollectionProvider");
  }
  return context;
} 
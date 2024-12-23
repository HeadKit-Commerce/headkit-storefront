"use client";

import { Button } from "@/components/ui/button";
import {
  GetProductListQuery,
  ProductContentFullWithGroupFragment,
} from "@/lib/headkit/generated";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductCard } from "../../product/product-card";
import { makeWhereProductQuery, PER_PAGE } from "../utils";
import { getProductList } from "@/lib/headkit/actions";
import { usePathname, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  initialProducts: GetProductListQuery;
  initialPage: number;
  filterState: { [x: string]: string | string[] };
  onSale?: boolean;
  search?: string;
}

const LoadingSkeleton = () => (
  <>
    {[1, 2, 3].map((item) => (
      <div key={item} className="col-span-3 md:col-span-1">
        <div className="space-y-3">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    ))}
  </>
);

const ProductList = ({
  initialProducts,
  initialPage,
  filterState,
  onSale,
  search,
}: Props) => {
  const [page, setPage] = useState(initialPage);
  const [products, setProducts] = useState(initialProducts.products?.nodes || []);
  const [totalFoundProducts, setTotalFoundProducts] = useState(
    initialProducts.products?.found || 0
  );
  const [minNumber, setMinNumber] = useState(PER_PAGE * initialPage + 1);
  const [maxNumber, setMaxNumber] = useState(
    Math.min(PER_PAGE * (initialPage + 1), initialProducts.products?.found || 0)
  );
  const [shouldDisplayLoadPrevious, setShouldDisplayLoadPrevious] = useState(initialPage > 0);
  const pathname = usePathname();
  const [fetching, setFetching] = useState(false);
  const [fetchingBefore, setFetchingBefore] = useState(false);
  const [fetchingAfter, setFetchingAfter] = useState(false);
  const searchParams = useSearchParams();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const createUrl = (pageIndex: number) => {
    const params = new URLSearchParams(searchParams);
    if (pageIndex <= 0) {
      params.delete("page");
    } else {
      params.set("page", pageIndex.toString());
    }
    return `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
  };

  const handleFetchProducts = async (
    pageIndex: number,
    position: "before" | "after" | "middle"
  ) => {
    console.log("handleFetchProducts", pageIndex, position);
    const setLoadingState = (isLoading: boolean) => {
      if (position === "before") setFetchingBefore(isLoading);
      else if (position === "after") setFetchingAfter(isLoading);
      else setFetching(isLoading);
    };

    if (fetching || fetchingBefore || fetchingAfter) return;

    try {
      setLoadingState(true);
      const categorySlug = pathname.split("/").pop();

      const { data: fetchedProducts } = await getProductList({
        input: {
          where: makeWhereProductQuery({
            filterQuery: filterState,
            categorySlug,
            page: pageIndex,
            perPage: PER_PAGE,
            onSale,
            search,
          }),
          first: PER_PAGE,
        }
      });

      

      const newProducts = fetchedProducts?.products?.nodes || [];
      const totalFound = fetchedProducts?.products?.found || 0;
      
      // Don't update anything if we're trying to load more but got no products
      if (position === "after" && newProducts.length === 0) {
        setLoadingState(false);
        return;
      }

      // Update state first
      setPage(pageIndex);
      setTotalFoundProducts(totalFound);

      if (position === "middle") {
        setProducts(newProducts);
        setMinNumber(PER_PAGE * pageIndex + 1);
        setMaxNumber(Math.min(PER_PAGE * (pageIndex + 1), totalFound));
        setShouldDisplayLoadPrevious(pageIndex > 0);
      } else if (position === "before") {
        setProducts([...newProducts, ...products]);
        setMinNumber(PER_PAGE * pageIndex + 1);
        setShouldDisplayLoadPrevious(pageIndex > 0);
      } else { // after
        setProducts([...products, ...newProducts]);
        setMaxNumber(Math.min(maxNumber + newProducts.length, totalFound));
      }

      // Only update URL if we have products or it's not "after" position
      if (position !== "after" || newProducts.length > 0) {
        const params = new URLSearchParams(searchParams);
        if (pageIndex === 0) {
          params.delete("page");
        } else {
          params.set("page", pageIndex.toString());
        }
        window.history.pushState(
          null, 
          "", 
          `${pathname}${params.toString() ? `?${params.toString()}` : ""}`
        );
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
      console.log("reset products");
      handleFetchProducts(0, "middle");
    }
    setIsInitialLoad(false);
  }, [filterState, onSale, search]);

  useEffect(() => {
    console.log("filterState changed", filterState);
  }, [filterState]);

  useEffect(() => {
    console.log("onSale changed", onSale);
  }, [onSale]);

  useEffect(() => {
    console.log("search changed", search);
  }, [search]);


  // Modify URL change handler
  useEffect(() => {
    const pageParam = searchParams.get("page");
    const newPageIndex = pageParam ? parseInt(pageParam) : 0;
    
    if (!isInitialLoad && newPageIndex !== page && maxNumber < totalFoundProducts) {
      handleFetchProducts(newPageIndex, newPageIndex > page ? "after" : "before");
    }
  }, [searchParams]);

  return (
    <div className="px-5 py-[60px] md:px-10 relative z-0">
      {shouldDisplayLoadPrevious && (
        <div className="flex justify-center py-10">
          <Link
            href={createUrl(page - 1)}
            scroll={false}
            passHref
            legacyBehavior
          >
            <a
              onClick={(e) => {
                e.preventDefault();
                handleFetchProducts(page - 1, "before");
              }}
            >
              <Button>Load Previous</Button>
            </a>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-3 gap-8">
        {fetchingBefore && <LoadingSkeleton />}
        
        {fetching ? (
          <LoadingSkeleton />
        ) : products.length ? (
          products.map((item, i) => (
            <div key={i} className="col-span-3 md:col-span-1">
              <ProductCard
                product={item as ProductContentFullWithGroupFragment}
              />
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center">No results</div>
        )}

        {fetchingAfter && <LoadingSkeleton />}
      </div>

      <div className="flex flex-col items-center justify-center gap-5 py-10">
        {maxNumber < totalFoundProducts && (
          <Link
            href={createUrl(page + 1)}
            scroll={false}
            passHref
            legacyBehavior
          >
            <a
              onClick={(e) => {
                e.preventDefault();
                handleFetchProducts(page + 1, "after");
              }}
            >
              <Button>Load More</Button>
            </a>
          </Link>
        )}

        {totalFoundProducts > 0 && (
          <div className="mx-auto pb-8 text-center">
            Viewing {minNumber}{" "}
            {totalFoundProducts === minNumber ? "" : `- ${maxNumber}`} of{" "}
            {totalFoundProducts} products
          </div>
        )}
      </div>
    </div>
  );
};

export { ProductList };

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

interface Props {
  initialProducts: GetProductListQuery;
  initialPage: number;
  filterState: { [x: string]: string | string[] };
  onSale?: boolean;
  search?: string;
}

const ProductList = ({
  initialProducts,
  initialPage,
  filterState,
  onSale,
  search,
}: Props) => {
  // responsible for changing page, listen to filterState, fetch and append incoming results
  const [page, setPage] = useState(initialPage);
  const [products, setProducts] = useState(initialProducts.products?.nodes || []);
  const [totalFoundProducts, setTotalFoundProducts] = useState(
    initialProducts.products?.found || 0
  );
  const [minNumber, setMinNumber] = useState(PER_PAGE * page + 1);
  const [maxNumber, setMaxNumber] = useState(
    Math.min(PER_PAGE * (page + 1), totalFoundProducts)
  );
  const [shouldDisplayLoadPrevious, setShouldDisplayLoadPrevious] =
    useState(true);
  const pathname = usePathname();
  const [fetching, setFetching] = useState(false);
  const [fetchingBefore, setFetchingBefore] = useState(false);
  const [fetchingAfter, setFetchingAfter] = useState(false);
  const searchParams = useSearchParams();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // if filterState has changed, fetch new set of products, reset page to 0
  const handleFetchProducts = async (
    newPage: number,
    position: "before" | "after" | "middle"
  ) => {
    // Set loading state at the beginning
    const setLoadingState = (isLoading: boolean) => {
      if (position === "before") setFetchingBefore(isLoading);
      else if (position === "after") setFetchingAfter(isLoading);
      else setFetching(isLoading);
    };

    try {
      setLoadingState(true);
      const categorySlug = pathname.split("/").pop();
      setPage(newPage);

      // Update URL
      const params = new URLSearchParams(searchParams);
      if (newPage === 0 || position === "middle") {
        params.delete("page");
      } else {
        params.set("page", newPage.toString());
      }
      window.history.replaceState(null, "", `${pathname}?${params.toString()}`);

      const { data: fetchedProducts } = await getProductList({
        input: {
          where: makeWhereProductQuery({
            filterQuery: filterState,
            categorySlug,
            page: newPage,
            perPage: PER_PAGE,
            onSale,
            search,
          }),
          first: PER_PAGE,
        }
      });

      // Update products based on position
      if (position === "middle") {
        setShouldDisplayLoadPrevious(false);
        setProducts(fetchedProducts?.products?.nodes || []);
        setTotalFoundProducts(fetchedProducts?.products?.found || 0);
      } else if (position === "before") {
        setProducts([...(fetchedProducts?.products?.nodes || []), ...products]);
        setMinNumber(Math.max(minNumber - PER_PAGE, 1));
      } else {
        setProducts([...products, ...(fetchedProducts?.products?.nodes || [])]);
        setMaxNumber(Math.min(maxNumber + PER_PAGE, totalFoundProducts || 0));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingState(false);
    }
  };

  useEffect(() => {
    setMinNumber(PER_PAGE * page + 1);
    setMaxNumber(Math.min(PER_PAGE * (page + 1), totalFoundProducts || 0));
  }, [page, totalFoundProducts]);

  useEffect(() => {
    if (!isInitialLoad) {
      handleFetchProducts(0, "middle");
    }
    setIsInitialLoad(false);

    // No need for isFetching cleanup as it doesn't affect anything
  }, [filterState, onSale, search]);

  useEffect(() => {
    if (page === 0) {
      setShouldDisplayLoadPrevious(false);
    }
  }, [page]);

  const createUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page > 0) {
      params.set("page", page.toString());
    } else {
      params.delete("page");
    }

    return `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
  };

  return (
    <div className="px-5 py-[60px] md:px-10 relative z-0">
      {shouldDisplayLoadPrevious && page > 0 && page * PER_PAGE > 0 && (
        <div className="flex justify-center py-10">
          <Link
            href={createUrl(page - 1)}
            scroll={false}
            passHref
            legacyBehavior
          >
            <a
              onClick={async (e) => {
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
        {fetchingBefore &&
          [1, 2, 3].map((item, i) => {
            return (
              <div
                key={i}
                className="col-span-3 aspect-square w-full bg-gray-100 md:col-span-1"
              ></div>
            );
          })}

        {fetching ? (
          [1, 2, 3].map((item, i) => {
            return (
              <div
                key={i}
                className="col-span-3 aspect-square w-full bg-gray-100 md:col-span-1"
              ></div>
            );
          })
        ) : products.length ? (
          products.map((item, i) => {
            return (
              <div key={i} className="col-span-3 md:col-span-1">
                <ProductCard
                  product={item as ProductContentFullWithGroupFragment}
                />
              </div>
            );
          })
        ) : (
          <div className="col-span-3 text-center">No results</div>
        )}

        {fetchingAfter &&
          [1, 2, 3].map((item, i) => {
            return (
              <div
                key={i}
                className="col-span-3 aspect-square w-full bg-gray-100 md:col-span-1"
              ></div>
            );
          })}
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
              onClick={async (e) => {
                e.preventDefault();
                handleFetchProducts(page + 1, "after");
              }}
            >
              <Button>Load More</Button>
            </a>
          </Link>
        )}

        {page !== undefined && totalFoundProducts && (
          <div className="text-body3 text-black-5 mx-auto pb-8 text-center">
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

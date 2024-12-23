"use client";

import { Button } from "@/components/ui/button";
import { useCollection } from "./collection-context";

export const LoadPrevious = () => {
  const { 
    hasFirstPage,
    isLoading,
    isLoadingBefore,
    isLoadingAfter,
    loadPrevious,
  } = useCollection();

  if (hasFirstPage) return null;

  return (
    <div className="flex justify-center py-5">
      <Button
        variant="secondary"
        onClick={loadPrevious}
        disabled={isLoading || isLoadingBefore || isLoadingAfter}
        className="w-full max-w-[200px]"
      >
        Load Previous
      </Button>
    </div>
  );
};

export const LoadMore = () => {
  const { 
    totalProducts,
    products,
    isLoading,
    isLoadingBefore,
    isLoadingAfter,
    loadMore,
  } = useCollection();

  if (products.length >= totalProducts) return null;

  return (
    <Button
      variant="secondary"
      onClick={loadMore}
      disabled={isLoading || isLoadingBefore || isLoadingAfter}
      className="w-full max-w-[200px]"
    >
      Load More
    </Button>
  );
};

export const ProductCount = () => {
  const { 
    currentPage,
    totalProducts,
    itemsPerPage,
  } = useCollection();

  if (totalProducts <= 0) return null;

  const minNumber = itemsPerPage * currentPage + 1;
  const maxNumber = Math.min(itemsPerPage * (currentPage + 1), totalProducts);

  return (
    <div className="text-center text-sm text-muted-foreground">
      Viewing {minNumber}{" "}
      {totalProducts === minNumber ? "" : `- ${maxNumber}`} of{" "}
      {totalProducts} products
    </div>
  );
}; 
"use client";

import { Button } from "@/components/ui/button";
import { useCollection } from "./collection-context";

export const Pagination = () => {
  const { 
    currentPage,
    totalProducts,
    itemsPerPage,
    isLoading,
    isLoadingBefore,
    isLoadingAfter,
    hasMore,
    loadMore,
    loadPrevious,
  } = useCollection();

  const minNumber = itemsPerPage * currentPage + 1;
  const maxNumber = Math.min(itemsPerPage * (currentPage + 1), totalProducts);
  const shouldDisplayLoadPrevious = currentPage > 0;

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-10">
      {shouldDisplayLoadPrevious && (
        <Button
          variant="secondary"
          onClick={loadPrevious}
          disabled={isLoading || isLoadingBefore || isLoadingAfter}
          className="w-full max-w-[200px]"
        >
          Load Previous
        </Button>
      )}

      {hasMore && (
        <Button
          variant="secondary"
          onClick={loadMore}
          disabled={isLoading || isLoadingBefore || isLoadingAfter}
          className="w-full max-w-[200px]"
        >
          Load More
        </Button>
      )}

      {totalProducts > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Viewing {minNumber}{" "}
          {totalProducts === minNumber ? "" : `- ${maxNumber}`} of{" "}
          {totalProducts} products
        </div>
      )}
    </div>
  );
}; 
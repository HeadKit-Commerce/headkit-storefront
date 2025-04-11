"use client";

import { ProductCard } from "@/components/product/product-card";
import { useCollection } from "./collection-context";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductContentFullWithGroupFragment } from "@/lib/headkit/generated";

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

export function ProductGrid() {
  const { 
    products, 
    isLoading, 
    isLoadingBefore, 
    isLoadingAfter 
  } = useCollection();

  return (
    <div className="px-5 md:px-10 z-5">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {isLoadingBefore && <LoadingSkeleton />}
        
        {isLoading ? (
          <LoadingSkeleton />
        ) : products.length ? (
          products.map((product, index) => (
            <div key={index} className="col-span-3 md:col-span-1">
              <ProductCard
                product={product as ProductContentFullWithGroupFragment}
              />
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center">No results</div>
        )}

        {isLoadingAfter && <LoadingSkeleton />}
      </div>
    </div>
  );
} 
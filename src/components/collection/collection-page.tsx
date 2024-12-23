"use client";

import { GetProductFiltersQuery, GetProductListQuery } from "@/lib/headkit/generated";
import { CollectionProvider } from "./collection-context";
import { Filter } from "./filter";
import { ProductGrid } from "./product-grid";
import { Pagination } from "./pagination";

interface CollectionPageProps {
  initialProducts: GetProductListQuery;
  productFilter: GetProductFiltersQuery;
  initialPage?: number;
  itemsPerPage?: number;
  onSale?: boolean;
  search?: string;
}

export function CollectionPage({
  initialProducts,
  productFilter,
  initialPage = 0,
  itemsPerPage = 24,
  onSale,
  search,
}: CollectionPageProps) {
  return (
    <CollectionProvider
      initialProducts={initialProducts}
      productFilter={productFilter}
      initialPage={initialPage}
      itemsPerPage={itemsPerPage}
      onSale={onSale}
      search={search}
    >
      <div className="flex flex-col gap-8">
        <Filter />
        <ProductGrid />
        <Pagination />
      </div>
    </CollectionProvider>
  );
} 
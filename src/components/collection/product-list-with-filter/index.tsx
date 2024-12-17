"use client";

import {
  GetProductFiltersQuery,
  GetProductListQuery,
} from "@/lib/headkit/generated";
import { Suspense, useState } from "react";
import { Filter } from "./filter";
import { ProductList } from "./product-list";

interface Props {
  initialProducts: GetProductListQuery;
  initialFilterState: { [x: string]: string | string[] };
  initialPage: number;
  productFilter: GetProductFiltersQuery;
  onSale?: boolean;
  search?: string;
}
const ProductListWithFilter = ({
  initialProducts,
  initialFilterState,
  initialPage,
  productFilter,
  onSale,
  search
}: Props) => {
  // listening when filter change here
  const [filterState, setFilterState] = useState<{
    [x: string]: string | string[];
  }>()

  return (
    <Suspense>
      <Filter
        initialFilterState={initialFilterState}
        productFilter={productFilter}
        onChange={setFilterState}
      />
      <ProductList
        initialProducts={initialProducts}
        initialPage={initialPage}
        filterState={filterState || {}}
        onSale={onSale}
        search={search}
      />
    </Suspense>
  );
};

export { ProductListWithFilter };

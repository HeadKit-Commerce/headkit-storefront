"use client";

import {
  GetProductFiltersQuery,
  GetProductListQuery,
} from "@/lib/headkit/generated";
import { Suspense, useState } from "react";
import { FilterV2 } from "./filter/filter-v2";
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
  const [filterState, setFilterState] = useState(initialFilterState);

  return (
    <Suspense>
      <FilterV2
        productFilter={productFilter}
        onChange={setFilterState}
      />
      <ProductList
        initialProducts={initialProducts}
        initialPage={initialPage}
        filterState={filterState}
        onSale={onSale}
        search={search}
      />
    </Suspense>
  );
};

export { ProductListWithFilter };

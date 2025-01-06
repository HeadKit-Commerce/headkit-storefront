"use client";

import { GetBrandsQuery } from "@/lib/headkit/generated";
import { SortKeyType } from "./utils";
import { BrandGrid } from "./brand-grid";
import { BrandProvider } from "./brand-context";
import { Filter } from "./filter";

interface BrandPageProps {
  initialBrands: GetBrandsQuery;
  initialSort?: SortKeyType;
  initialPage?: number;
}

export function BrandPage({
  initialBrands,
  initialPage = 0,
}: BrandPageProps) {
  return (
    <BrandProvider
      initialBrands={initialBrands}
      brandFilter={initialBrands}
      initialPage={initialPage}
    >
      <div className="flex flex-col gap-8">
        <Filter />
        <BrandGrid brands={initialBrands} />
      </div>
    </BrandProvider>
  );
} 
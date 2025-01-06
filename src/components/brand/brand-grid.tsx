"use client";

import { GetBrandsQuery } from "@/lib/headkit/generated/index";
import { BrandCard } from "./brand-card";
import { Skeleton } from "@/components/ui/skeleton";

interface BrandGridProps {
  brands: GetBrandsQuery;
  loading?: boolean;
}

interface Category {
  name?: string | null;
  slug?: string | null;
}

interface Brand {
  databaseId?: number;
  name?: string | null;
  description?: string | null;
  slug?: string | null;
  thumbnail?: string | null;
  productCategories?: {
    nodes?: Array<Category | null> | null;
  } | null;
}

export function BrandGrid({ brands, loading }: BrandGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-4 md:px-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!brands?.brands?.nodes?.length) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <p className="text-lg text-gray-500">No brands found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-5 md:px-10">
      {brands.brands.nodes.map((brand: Brand) => (
        <BrandCard
          key={brand?.databaseId}
          name={brand?.name || ""}
          slug={brand?.slug || ""}
          logo={brand?.thumbnail || ""}
        />
      ))}
    </div>
  );
} 
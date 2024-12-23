"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ProductCard } from "../product/product-card";
import { getProductList } from "@/lib/headkit/actions";
import { makeWhereProductQuery } from "@/components/collection/utils";
import { ProductContentFullWithGroupFragment } from "@/lib/headkit/generated";
import { debounce } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/icon";

const ProductSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="aspect-square w-full" />
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

export function SearchDrawer() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<ProductContentFullWithGroupFragment[]>([]);
  const router = useRouter();

  const debouncedSearch = debounce(async (query: string) => {
    if (!query) {
      setProducts([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await getProductList({
        input: {
          where: makeWhereProductQuery({
            filterQuery: {},
            page: 0,
            perPage: 4,
            search: query,
          }),
          first: 4,
        },
      });
      setProducts((data?.products?.nodes || []) as ProductContentFullWithGroupFragment[]);
    } catch (error) {
      console.error("Error searching products:", error);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  const searchProducts = useCallback((query: string) => {
    debouncedSearch(query);
  }, []);

  useEffect(() => {
    searchProducts(searchQuery);
  }, [searchQuery, searchProducts]);

  const handleViewMore = () => {
    if (!searchQuery) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Icon.search className="h-6 w-6 stroke-purple-800 hover:stroke-pink-500 stroke-2" />
          <span className="sr-only">Search products</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="top" className="w-full">
        <SheetTitle className="sr-only">Search products</SheetTitle>
        <div className="flex flex-col gap-8 py-4">
          <div className="flex justify-center">
            <div className="flex items-center gap-2 max-w-xl w-full">
              <Icon.search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="h-9"
                autoFocus
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {products.map((product) => (
                  <div key={product.databaseId} onClick={() => setOpen(false)}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              <Button onClick={handleViewMore} className="mx-auto mt-6 block">
                View more results
              </Button>
            </>
          ) : searchQuery ? (
            <div className="text-center text-muted-foreground">
              No products found for &quot;{searchQuery}&quot;
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
} 
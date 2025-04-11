"use client";

import { useAppContext } from "@/contexts/app-context";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { actionWishlist, getProductList } from "@/lib/headkit/actions";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { ProductContentFullWithGroupFragment } from "@/lib/headkit/generated";

export default function Page() {
  const { wishlists, setWishlists } = useAppContext();
  const [products, setProducts] = useState<ProductContentFullWithGroupFragment[]>([])
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data: products } = await getProductList({ input: { where: { include: wishlists } } });
      setProducts(products.products?.nodes as ProductContentFullWithGroupFragment[] || []);
    };
    fetchProducts();
  }, [wishlists]);

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      await actionWishlist({
        input: {
          productId,
          wishlist: false
        },
      });

      setWishlists(wishlists.filter(id => id !== productId));
      toast({
        title: "Removed from Wishlist",
        description: "Product has been removed from your wishlist"
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to remove from wishlist. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
        {wishlists.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-500 text-center py-8">
              Your wishlist is currently empty.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <div key={index} className="relative">
                <ProductCard product={product} />
                <div className="absolute top-2 right-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFromWishlist(product.databaseId)}
                    aria-label="Remove from wishlist"
                  >
                    <Icon.trash className="h-5 w-5 text-gray-600 hover:text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { useAppContext } from "@/contexts/app-context";
import { ProductContentFullWithGroupFragment } from "@/lib/headkit/generated";
import { actionWishlist } from "@/lib/headkit/actions";
import { useToast } from "@/hooks/use-toast";

interface WishlistButtonProps {
  product: ProductContentFullWithGroupFragment;
  variant?: "icon" | "button";
}

export function WishlistButton({ product, variant = "icon" }: WishlistButtonProps) {
  const { wishlists, setWishlists } = useAppContext();
  const { toast } = useToast();
  const isWishlisted = wishlists.includes(product.databaseId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      await actionWishlist({
        input: {
          productId: product.databaseId,
          wishlist: !isWishlisted
        },
      });

      if (isWishlisted) {
        setWishlists(wishlists.filter(id => id !== product.databaseId));
        toast({
          title: "Removed from Wishlist",
          description: "Product has been removed from your wishlist"
        });
      } else {
        setWishlists([...wishlists, product.databaseId]);
        toast({
          title: "Added to Wishlist",
          description: "Product has been saved to your wishlist"
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        {isWishlisted ? (
          <Icon.heart className="h-5 w-5 text-red-500" />
        ) : (
          <Icon.heartOutline className="h-5 w-5 text-gray-600 hover:text-red-500" />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="secondary"
      onClick={handleClick}
      className="w-full"
    >
      {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
    </Button>
  );
} 
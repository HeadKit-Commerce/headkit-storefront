"use client";

import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/contexts/app-context";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ProductContentFullWithGroupFragment } from "@/lib/headkit/generated";
import { actionWishlist } from "@/lib/headkit/actions";
import { Button } from "../ui/button";
import { Icon } from "../icon";

interface Props {
  parentProduct: ProductContentFullWithGroupFragment;
}

export const ProductWishlist = ({ parentProduct }: Props) => {
  const router = useRouter();
  const { toast } = useToast();
  const { wishlists, setWishlists } = useAppContext();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const isInWishlist = wishlists.includes(parentProduct?.databaseId);

  const handleWishlist = async (addToWishlist: boolean) => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }

    setIsLoading(true);
    try {
      const data = await actionWishlist({
        input: {
          productId: parentProduct?.databaseId,
          wishlist: addToWishlist
        },
      });

      if (data) {
        if (addToWishlist) {
          setWishlists([...wishlists, parentProduct?.databaseId]);


          toast({
            title: "Added to Wishlist",
            description: "Product has been saved to your wishlist"
          });
        } else {
          setWishlists(wishlists.filter(id => id !== parentProduct?.databaseId));
          toast({
            title: "Removed from Wishlist",
            description: "Product has been removed from your wishlist"
          });
        }
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-end justify-end">
        <button
          type="button"
          onClick={() => handleWishlist(!isInWishlist)}
          disabled={isLoading}
          className={cn(
            "flex items-center ml-auto group",
            isLoading && "opacity-40"
          )}
        >
          {isInWishlist ?
            <Icon.heart className="mr-[8px] w-[16px] group-hover:text-pink-500" /> :
            <Icon.heartOutline className="mr-[8px] w-[16px] group-hover:text-pink-500" />
          }
          <span className="text-[17px] text-purple-800 underline group-hover:text-pink-500">
            {isInWishlist ? "Saved to Wishlist" : "Add to Wishlist"}
          </span>
        </button>
      </div>
      {showLogin && (
        <div className="col-span-2 mt-3 pt-[20px] pb-[30px] px-[20px] border-[2px] border-purple-500 rounded-[6px]">
          <div className="flex content-center text-hall-metal-700">
            <div>
              <span className="underline">Sign in</span> or <span className="underline">Create an Account</span> to save products for later.
            </div>
          </div>
          <div className="mt-[30px] grid grid-cols-1 md:grid-cols-2 gap-2 ">
            <Button
              variant="secondary"
              onClick={() => router.push('/account')}
            >
              Sign In
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push('/account')}
            >
              Create Account
            </Button>
          </div>
        </div>
      )}
    </>
  );
}; 
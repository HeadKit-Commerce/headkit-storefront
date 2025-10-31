"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { BadgeList } from "./badge-list";
import config from "@/headkit.config";

import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Lightbox } from "@/components/ui/lightbox";

import { EnhancedCarousel } from "@/components/carousel/enhanced-carousel";
import { useState } from "react";

interface Props {
  images: {
    src: string;
    alt: string;
  }[];
  isSale?: boolean;
  isNew?: boolean;
}

const ProductImageGallery = ({ images, isSale, isNew }: Props) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div>
      <div className="hidden grid-cols-2 flex-col gap-5 md:grid">
        {images?.length ? (
          images?.map((item, index) => {
            return (
              <Dialog key={index}>
                <DialogTrigger
                  className={cn(
                    "border-gray-500 relative cursor-pointer overflow-hidden rounded-[8px] bg-gray-300",
                    index > 0 ? "col-span-1" : "col-span-2"
                  )}
                >
                  <div
                    className={cn(
                      "absolute left-2 top-2 z-10",
                      index !== 0 && "hidden"
                    )}
                  >
                    <BadgeList isSale={isSale} isNewIn={isNew} />
                  </div>
                  <div className="relative aspect-square">
                    <Image
                      src={item?.src}
                      alt={item?.alt || "image"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      quality={100}
                      priority={index === 0}
                    />
                  </div>
                </DialogTrigger>
                <Lightbox images={images} initialSelectedIndex={index} />
              </Dialog>
            );
          })
        ) : (
          <div
            className={cn(
              "border-gray-500 relative col-span-2 aspect-square w-full animate-pulse cursor-pointer overflow-hidden rounded-[8px] bg-gray-200"
            )}
          />
        )}
      </div>
      <div className="relative block md:hidden border border-gray-200 rounded-lg overflow-hidden min-h-[300px] aspect-square">
        <div className="absolute left-2 top-2 z-10">
          <BadgeList isSale={isSale} isNewIn={isNew} />
        </div>
        <EnhancedCarousel
          items={images || []}
          renderItem={(image, i) => (
            <Dialog>
              <DialogTrigger className="w-full">
                <div className="relative aspect-square bg-white">
                  <Image
                    priority={i === 0}
                    src={image?.src || config.fallbackProductImage}
                    alt={image?.alt || ""}
                    fill
                    className="object-cover object-center"
                    placeholder="blur"
                    blurDataURL={config.fallbackProductImage}
                    sizes="100vw"
                  />
                </div>
              </DialogTrigger>
              <Lightbox images={images} initialSelectedIndex={i} />
            </Dialog>
          )}
          itemSizing={{
            base: "w-full",
          }}
          gap="gap-0"
          padding="px-0"
          showControls={false}
          showScrollbar={false}
          showPagination={true}
          paginationDotClassName="bg-black/70 hover:bg-black transition-colors"
          paginationClassName="absolute left-1/2 -translate-x-1/2 z-20 flex flex-wrap justify-center gap-2 bottom-4"
          useScrollSnap={true}
          className="w-full"
        />
      </div>
    </div>
  );
};

export { ProductImageGallery };

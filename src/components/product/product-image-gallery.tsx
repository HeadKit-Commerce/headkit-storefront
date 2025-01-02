"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { BadgeList } from "./badge-list";
import { CONFIG } from "@/config/app-config";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Lightbox } from "@/components/ui/lightbox";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselPagination,
  useDotButton,
} from "@/components/ui/carousel";
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
  const [api, setApi] = useState<CarouselApi>();
  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(api);

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
                      className="object-contain"
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
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-[30px]">
            {images?.map((image, i) => (
              <CarouselItem key={i} className="basis-full pl-[30px]">
                <Dialog>
                  <DialogTrigger className="w-full">
                    <div className="relative aspect-square bg-white">
                      <Image
                        priority={i === 0}
                        src={image?.src || CONFIG.fallbackProductImage}
                        alt={image?.alt || ""}
                        fill
                        className="object-contain object-center"
                        placeholder="blur"
                        blurDataURL={CONFIG.fallbackProductImage}
                        sizes="100vw"
                      />
                    </div>
                  </DialogTrigger>
                  <Lightbox images={images} initialSelectedIndex={i} />
                </Dialog>
              </CarouselItem>
            ))}
          </CarouselContent>
          {scrollSnaps?.length > 1 && (
            <CarouselPagination
              itemLength={images?.length}
              selectedIndex={selectedIndex}
              onChange={(index) => {
                onDotButtonClick(index);
              }}
            />
          )}

        </Carousel>
      </div>
    </div>
  );
};

export { ProductImageGallery };

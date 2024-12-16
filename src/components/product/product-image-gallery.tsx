import { cn } from "@/lib/utils";
import Image from "next/image";
import { BadgeList } from "./badge-list";
import { CONFIG } from "@/config/app-config";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface Props {
  images: {
    src: string;
    alt: string;
  }[];
  isSale?: boolean;
  isNew?: boolean;
}

const ProductImageGallery = ({ images, isSale, isNew }: Props) => {
  return (
    <div>
      <div className="hidden grid-cols-2 flex-col gap-5 md:grid">
        {images?.length ? (
          images?.map((item, index) => {
            return (
              <div
                key={index}
                className={cn(
                  "border-silver-3 relative cursor-pointer overflow-hidden rounded-[8px] bg-gray-300",
                  index > 0 ? "col-span-1" : "col-span-2"
                )}
              >
                <div
                  className={cn(
                    "absolute left-2 top-2",
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
                    sizes="100vw"
                    quality={100}
                    priority={index === 0}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div
            className={cn(
              "border-silver-3 relative col-span-2 aspect-square w-full animate-pulse cursor-pointer overflow-hidden rounded-[8px] bg-gray-200"
            )}
          />
        )}
      </div>
      <div className="relative block md:hidden">
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-[30px]">
            {images?.map((image, i) => (
              <CarouselItem key={i} className="basis-full pl-[30px]">
                <div className="absolute left-0 top-0">
                  <BadgeList isSale={isSale} isNewIn={isNew} />
                </div>
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
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
};

export { ProductImageGallery };

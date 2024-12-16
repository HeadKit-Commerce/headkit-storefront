"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";

interface Props {
  brands: { name: string; thumbnail: string; slug: string }[];
}

const BrandCarousel = ({ brands }: Props) => {
  return (
    <Carousel
      plugins={[
        Autoplay({
          delay: 3000,
          stopOnInteraction: true,
        }),
      ]}
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent>
        {brands.map(
          (item, index) =>
            item?.thumbnail && (
              <CarouselItem
                key={index}
                className="basis-1/2 md:basis-1/3 lg:basis-1/5"
              >
                <div className="relative h-[50px] w-[160px]">
                  <Image
                    alt={item?.name}
                    src={item?.thumbnail}
                    fill
                    className="object-contain object-center"
                  />
                </div>
              </CarouselItem>
            )
        )}
      </CarouselContent>
    </Carousel>
  );
};

export { BrandCarousel };

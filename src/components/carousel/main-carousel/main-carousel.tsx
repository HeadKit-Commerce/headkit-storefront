"use client";

import Image from "next/image";
import { ElementType, useState } from "react";
import Link from "next/link";
import {
  CarouselContent,
  CarouselItem,
  Carousel,
  CarouselApi,
  CarouselPagination,
  useDotButton,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import { GetCarouselQuery } from "@/lib/headkit/generated";

interface Props {
  carouselData: GetCarouselQuery["carousels"];
}

export const MainCarousel = ({ carouselData }: Props) => {
  const [api, setApi] = useState<CarouselApi>();
  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(api);

  return (
    <div className="bg-white overflow-hidden">
      <Carousel
        setApi={setApi}
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: true,
          }),
        ]}
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent>
          {carouselData?.nodes?.map((carousel, index) => {
            const HeaderTag: ElementType = index === 0 ? "h1" : "h2";
            return (
              <CarouselItem key={index} className="basis-full w-full relative">
                <div className="relative flex flex-col-reverse rounded-2xl md:flex-col ">
                  <div className="z-[999] h-full w-full md:absolute">
                    <div className="mx-auto flex h-full items-center">
                      <div className="py-[20px] md:w-[400px] md:pl-[20px] lg:w-[600px] lg:pl-[100px]">
                        <HeaderTag className="bg-gradient-to-r from-purple-800 to-pink-500 bg-clip-text text-3xl font-semibold !leading-[1.3] text-transparent md:from-purple-500 md:to-pink-500 md:text-5xl">
                          {carousel?.header}
                        </HeaderTag>
                        <p className="bg-gradient-to-r from-purple-800 to-pink-500 bg-clip-text text-3xl font-semibold !leading-[1.3] text-transparent md:from-purple-500 md:to-pink-500 md:text-5xl">
                          {carousel?.description}
                        </p>
                        <div className="mt-8">
                          <Link href={carousel?.url || "#"}>
                            <Button
                              className="min-w-full md:min-w-[300px]"
                              rightIcon="arrowRight"
                            >
                              {carousel?.buttonText}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative h-[40vh] overflow-hidden rounded-2xl md:h-[60vh] lg:h-[80vh]">
                    {carousel?.image ? (
                      <Image
                        priority
                        src={carousel.image!}
                        alt={carousel.header!}
                        quality="100"
                        sizes="100vw"
                        width={0}
                        height={0}
                        className="object-cover w-full h-full"
                      />
                    ) : null}
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        {scrollSnaps.length > 1 && (
          <CarouselPagination
            itemLength={scrollSnaps.length}
            selectedIndex={selectedIndex}
            onChange={(index) => {
              onDotButtonClick(index);
            }}
            className="!bottom-6"
          />
        )}
      </Carousel>
    </div>
  );
};

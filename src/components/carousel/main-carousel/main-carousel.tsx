"use client";

import Image from "next/image";
import { ElementType } from "react";
import Link from "next/link";
import { Carousel } from "../carousel";
import { Button } from "@/components/ui/button";
import { GetCarouselQuery } from "@/lib/headkit/generated";

interface Props {
  carouselData: GetCarouselQuery["carousels"];
}

export const MainCarousel = ({ carouselData }: Props) => {
  const carouselItems = carouselData?.nodes || [];

  return (
    <div className="bg-white overflow-hidden">
      <Carousel
        items={carouselItems}
        renderItem={(carousel, index) => {
          const HeaderTag: ElementType = index === 0 ? "h1" : "h2";
          return (
            <div className="basis-full w-full relative">
              <div className="relative flex flex-col-reverse rounded-2xl md:flex-col ">
                <div className="z-10 h-full w-full md:absolute">
                  <div className="mx-auto flex h-full items-center">
                    <div className="py-[20px] md:w-[400px] md:pl-[20px] lg:w-[600px] lg:pl-[100px]">
                      <HeaderTag className="text-primary text-3xl font-semibold leading-[1.3]! md:text-5xl">
                        {carousel?.header}
                      </HeaderTag>
                      <p className="mt-8 text-3xl font-semibold text-black md:text-white">
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
                    <>
                      <Image
                        priority
                        src={carousel.mobileImage || carousel.image}
                        alt={carousel.header!}
                        quality="100"
                        sizes="100vw"
                        width={0}
                        height={0}
                        className="object-cover w-full h-full md:hidden"
                      />
                      <Image
                        priority
                        src={carousel.image}
                        alt={carousel.header!}
                        quality="100"
                        sizes="100vw"
                        width={0}
                        height={0}
                        className="hidden md:block object-cover w-full h-full"
                      />
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          );
        }}
        className="w-full"
        autoplay={{
          enabled: true,
          delay: 5000,
          stopOnInteraction: true,
        }}
        showPagination={carouselItems.length > 1}
        paginationClassName="bottom-[240px]! md:bottom-6! flex"
        useScrollSnap={true}
        itemSizing={{
          base: "w-full",
        }}
        gap="gap-0"
        padding="px-0"
      />
    </div>
  );
};

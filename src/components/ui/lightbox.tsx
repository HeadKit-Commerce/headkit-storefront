"use client";

import {
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";

interface Props {
  images: { src: string; alt: string }[];
  initialSelectedIndex: number;
}

const Lightbox = ({ images, initialSelectedIndex }: Props) => {
  const [api, setApi] = useState<CarouselApi>();
  useEffect(() => {
    if (api) {
      api.scrollTo(initialSelectedIndex);
    }
  }, [api, initialSelectedIndex]);

  return (
    <DialogContent>
      <DialogTitle className="absolute"></DialogTitle>
      <DialogDescription className="absolute"> </DialogDescription>
      <Carousel setApi={setApi} opts={{ align: "center", loop: true }}>
        <CarouselContent>
          {images.map((image, i) => (
            <CarouselItem key={i} className="basis-full">
              <Image
                src={image.src}
                alt={image.alt}
                width={0}
                height={0}
                sizes="100vw"
                className="object-contain object-center w-auto h-screen mx-auto"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-4" />
        <CarouselNext className="-right-4" />
      </Carousel>
    </DialogContent>
  );
};

export { Lightbox };

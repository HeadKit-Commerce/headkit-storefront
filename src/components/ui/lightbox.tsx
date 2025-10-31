"use client";

import {
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { EnhancedCarousel } from "@/components/carousel/enhanced-carousel";
import { useEffect, useState } from "react";

interface Props {
  images: { src: string; alt: string }[];
  initialSelectedIndex: number;
}

const Lightbox = ({ images, initialSelectedIndex }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(initialSelectedIndex);

  useEffect(() => {
    setCurrentIndex(initialSelectedIndex);
  }, [initialSelectedIndex]);

  return (
    <DialogContent>
      <DialogTitle hidden />
      <DialogDescription hidden />
      <EnhancedCarousel
        items={images}
        renderItem={(image) => (
          <Image
            src={image.src}
            alt={image.alt}
            width={0}
            height={0}
            sizes="100vw"
            className="object-contain object-center w-auto h-screen mx-auto"
          />
        )}
        itemSizing={{
          base: "w-full",
        }}
        gap="gap-0"
        padding="px-0"
        showControls={true}
        showScrollbar={false}
        showPagination={false}
        loop={true}
        useScrollSnap={true}
        initialSelectedIndex={initialSelectedIndex}
        className="w-full"
      />
    </DialogContent>
  );
};

export { Lightbox };

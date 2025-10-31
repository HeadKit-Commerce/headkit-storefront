"use client";
import { Carousel } from "./carousel";
import Image from "next/image";

interface Props {
  brands: { name: string; thumbnail: string; slug: string }[];
}

const BrandCarousel = ({ brands }: Props) => {
  const filteredBrands = brands.filter(item => item?.thumbnail);
  
  return (
    <Carousel
      items={filteredBrands}
      renderItem={(item) => (
        <div className="relative h-[50px] w-[160px]">
          <Image
            alt={item?.name}
            src={item?.thumbnail}
            fill
            className="object-contain object-center"
          />
        </div>
      )}
      className="w-full"
      autoplay={{
        enabled: true,
        delay: 3000,
        stopOnInteraction: true,
      }}
      loop={true}
      showPagination={false}
    />
  );
};

export { BrandCarousel };

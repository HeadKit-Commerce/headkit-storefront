"use client";
import { Carousel } from "./carousel";
import Link from "next/link";
import { FeaturedImage } from "../product/featured-image";

interface Props {
  categories: {
    slug: string;
    name: string;
    uri: string;
    thumbnail: string | null;
  }[];
}

const CategoryCarousel = ({ categories }: Props) => {
  return (
    <Carousel
      items={categories}
      renderItem={(item) => (
        <Link href={item?.uri}>
          <FeaturedImage sourceUrl={item?.thumbnail} />
          <div className="pt-3 text-[17px] font-semibold">{item?.name}</div>
        </Link>
      )}
      className="w-full"
      showPagination={false}
    />
  );
};

export { CategoryCarousel };

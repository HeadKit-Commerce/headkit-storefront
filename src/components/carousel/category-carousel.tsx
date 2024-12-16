import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
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
      opts={{
        align: "start",
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-[30px]">
        {categories.map((item, index) => (
          <CarouselItem
            key={index}
            className="basis-10/12 sm:basis-1/2 lg:basis-1/3 pl-[30px]"
          >
            <Link href={item?.uri}>
              <FeaturedImage sourceUrl={item?.thumbnail} />
              <div className="pt-3 text-[17px] font-semibold">{item?.name}</div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};

export { CategoryCarousel };

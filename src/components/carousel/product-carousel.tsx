import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProductCard } from "../product/product-card";
import { ProductContentFullWithGroupFragment } from "@/lib/headkit/generated";
import { cn } from "@/lib/utils";

interface Props {
  products: ProductContentFullWithGroupFragment[];
  carouselItemClassName?: string;
}

const ProductCarousel = ({ products, carouselItemClassName }: Props) => {
  return (
    <Carousel
      opts={{
        align: "start",
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-[30px]">
        {products
          ?.filter((x) => !!x?.slug)
          ?.map((product, index) => (
            <CarouselItem
              key={index}
              className={cn("basis-10/12 sm:basis-1/2 lg:basis-1/3 pl-[30px]", carouselItemClassName)}
            >
              <ProductCard product={product} />
            </CarouselItem>
          ))}
      </CarouselContent>
      <CarouselPrevious className="-left-4 bg-white" />
      <CarouselNext className="-right-4 bg-white" />
    </Carousel>
  );
};

export { ProductCarousel };

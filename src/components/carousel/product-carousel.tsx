import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { ProductCard } from "../product/product-card";
import { ProductContentFullWithGroupFragment } from "@/lib/headkit/generated";

interface Props {
  products: ProductContentFullWithGroupFragment[];
}

const ProductCarousel = ({ products }: Props) => {
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
              className="basis-10/12 sm:basis-1/2 lg:basis-1/3 pl-[30px]"
            >
              <ProductCard product={product} />
            </CarouselItem>
          ))}
      </CarouselContent>
    </Carousel>
  );
};

export { ProductCarousel };

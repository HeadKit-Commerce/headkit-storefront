"use client";
import { Suspense } from "react";
import { ProductCard } from "../product/product-card";
import { ProductContentFullWithGroupFragment } from "@/lib/headkit/generated";
import { Carousel } from "./carousel";

interface Props {
  products: (ProductContentFullWithGroupFragment & { isNew?: boolean })[];
  carouselItemClassName?: string;
  id?: string;
}

const ProductCarousel = ({
  products,
  carouselItemClassName,
  id = "product-carousel",
}: Props) => {
  return (
    <Suspense fallback={null}>
      <Carousel
        items={products?.filter((x) => !!x?.slug) || []}
        renderItem={(product: ProductContentFullWithGroupFragment & { isNew?: boolean }) => (
          <ProductCard product={product} isNew={product.isNew} />
        )}
        carouselItemClassName={carouselItemClassName}
        id={id}
        showPagination={false}
      />
    </Suspense>
  );
};

export { ProductCarousel };

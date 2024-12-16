
import {
  SimpleProduct,
  StockStatusEnum,
  VariableProduct,
} from "@/lib/headkit/generated";
import { getFloatVal } from "@/lib/utils";
import Script from "next/script";
import { ItemList, WithContext } from "schema-dts";

interface CarouselProductJsonLDProps {
  products: Array<SimpleProduct | VariableProduct>;
  currency: string | null | undefined;
}

export const CarouselProductJsonLD = ({
  products,
  currency,
}: CarouselProductJsonLDProps) => {
  const matchAvailabilitySchema = (stockStatus: StockStatusEnum) => {
    switch (stockStatus) {
      case StockStatusEnum.OnBackorder:
        return "https://schema.org/BackOrder";
      case StockStatusEnum.InStock:
        return "https://schema.org/InStock";
      case StockStatusEnum.OutOfStock:
        return "https://schema.org/OutOfStock";
      default:
        break;
    }
  };

  const jsonLd: WithContext<ItemList> = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products?.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: "name" in product && product?.name || "",
        image: [product?.image, ...(product?.galleryImages?.nodes ?? [])].map(
          (image) => image?.sourceUrl ?? ""
        ),
        offers: {
          "@type": "Offer",
          price:
            getFloatVal(product?.salePrice ?? "") ||
            getFloatVal(product?.regularPrice ?? ""),
          availability: matchAvailabilitySchema(
            product?.stockStatus ?? StockStatusEnum.InStock
          ),
          priceCurrency: currency ?? "",
        },
        url:
          process.env.NEXT_PUBLIC_FRONTEND_URL! +
          ("uri" in product && product?.uri),
      },
    })),
  };

  return (
    <>
      <Script
        id="carouselProductJsonLD"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
};

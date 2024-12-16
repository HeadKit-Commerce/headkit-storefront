import {
  GetProductQuery,
  ProductTypesEnum,
  PostTypeSeoContentFragment,
  SimpleProductContentFragment,
  StockStatusEnum,
  VariableProductContentFragment,
} from "@/lib/headkit/generated";
import Script from "next/script";
import { Offer, Product as ProductLD, WithContext } from "schema-dts";

interface ProductJsonLDProps {
  product: GetProductQuery;
  currency: string | null | undefined;
}

export const ProductJsonLD = ({ product, currency }: ProductJsonLDProps) => {
  const seo: PostTypeSeoContentFragment | null | undefined =
    product?.product?.seo;

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

  const setOffer = (
    productType: ProductTypesEnum,
    product: GetProductQuery
  ) => {
    switch (productType) {
      case ProductTypesEnum.Simple:
        const simpleProduct = product?.product as SimpleProductContentFragment;
        return {
          "@type": "Offer",
          // offerCount: 5,
          price: simpleProduct?.rawPrice ?? "",
          availability: matchAvailabilitySchema(
            simpleProduct?.stockStatus ?? StockStatusEnum.InStock
          ),
          priceCurrency: currency ?? "",
        } as Offer;
      case ProductTypesEnum.Variable:
        const variableProduct =
          product?.product as VariableProductContentFragment;
        const prices = variableProduct?.rawPrice
          ?.split(",")
          .map((price) => Number(price)) || [0];
        return {
          "@type": "Offer",
          // offerCount: 5,
          price: Math.min(...prices),
          availability: matchAvailabilitySchema(
            variableProduct?.stockStatus ?? StockStatusEnum.InStock
          ),
          priceCurrency: currency ?? "",
        } as Offer;
      // return {
      //   "@type": "AggregateOffer",
      //   // offerCount: 5,
      //   lowPrice: Math.min(...prices),
      //   highPrice: Math.max(...prices),
      //   availability: matchAvailabilitySchema(variableProduct?.stockStatus),
      //   priceCurrency: currency,
      // } as Offer;

      default:
        return {} as Offer;
    }
  };

  const jsonLd: WithContext<ProductLD> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product?.product?.name ?? "",
    description:
      seo?.metaDesc ? seo?.metaDesc : product?.product?.shortDescription ?? "",
    image: [
      product?.product?.image,
      ...(product?.product?.galleryImages?.nodes ?? []),
    ].map((image) => image?.sourceUrl ?? ""),
    offers: setOffer(
      product?.product?.type ?? ProductTypesEnum.Simple,
      product
    ),
  };

  return (
    <>
      <Script
        id="productJsonLD"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
};

import {
  PostTypeSeoContentFragment,
} from "@/lib/headkit/generated";
import Script from "next/script";
import { BreadcrumbList, WithContext } from "schema-dts";

interface BreadcrumbJsonLDProps {
  seo:
    | PostTypeSeoContentFragment
    | null
    | undefined;
}

export const BreadcrumbJsonLD = ({ seo }: BreadcrumbJsonLDProps) => {
  const jsonLd: WithContext<BreadcrumbList> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: seo?.breadcrumbs?.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item?.text ?? "",
      item: item?.url?.replaceAll(
        process.env.WOOCOMMERCE_ENDPOINT || "",
        process.env.NEXT_PUBLIC_FRONTEND_URL || ""
      ),
    })),
  };

  return (
    <>
      <Script
        id="breadcrumbJsonLD"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
};

import { GetPostsQuery } from "@/lib/headkit/generated";
import Script from "next/script";
import { ItemList, WithContext } from "schema-dts";

interface CarouselPostJsonLDProps {
  posts: GetPostsQuery;
}

export const CarouselPostJsonLD = ({ posts }: CarouselPostJsonLDProps) => {
  const jsonLd: WithContext<ItemList> = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: posts?.posts?.nodes.map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: post?.link ?? "",
    })),
  };

  return (
    <>
      <Script
        id="carouselPostJsonLD"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
};

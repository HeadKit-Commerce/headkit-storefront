import { PostTypeSeoContentFragment } from "@/lib/headkit/generated";
import Script from "next/script";
import { Article, WithContext } from "schema-dts";

interface ArticleJsonLDProps {
  seo: PostTypeSeoContentFragment;
}

export const ArticleJsonLD = ({ seo }: ArticleJsonLDProps) => {
  const jsonLd: WithContext<Article> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: seo?.title ?? "",
    image: seo?.opengraphImage?.sourceUrl ?? "",
    datePublished: seo?.opengraphPublishedTime ?? "",
    dateModified: seo?.opengraphModifiedTime ?? "",
    author: {
      "@type": "Organization",
      name: seo?.opengraphSiteName ?? "",
      url: process.env.NEXT_PUBLIC_FRONTEND_URL ?? "",
    },
  };

  return (
    <>
      <Script
        id="articleJsonLD"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
};

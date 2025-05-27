import config from "@/headkit.config";

import { removeHtmlTags } from "@/lib/utils";
import { Metadata } from "next";
import { PostTypeSeoContentFragment, TaxonomySeoContentFragment } from "../generated";

interface RootMetadata {
  title?: string | null;
  description?: string | null;
}

const makeRootMetadata = ({ title, description }: RootMetadata): Metadata => {
  return {
    title: title || config.metadata.appName,
    description: description || config.metadata.description,
  };
};

type SEOContentFragment = TaxonomySeoContentFragment | PostTypeSeoContentFragment | null | undefined;

const makeSEOMetadata = (
  seo?: SEOContentFragment, // Assuming SeoContentFragment combines both types
  options?: { fallback?: Metadata; override?: Metadata }
): Metadata => {
  const title =
    seo?.title || options?.fallback?.title ||  config .metadata.appName;
  const description = removeHtmlTags(
    options?.override?.description ||
      seo?.metaDesc ||
      options?.fallback?.description ||
      options?.override?.openGraph?.description ||
      seo?.opengraphDescription ||
      options?.override?.twitter?.description ||
      seo?.twitterDescription ||
       config .metadata.description
  );
  const keywords =
    options?.override?.keywords ||
    seo?.metaKeywords ||
    options?.fallback?.keywords;
  const canonical =
    options?.override?.alternates?.canonical ||
    seo?.canonical ||
    options?.fallback?.alternates?.canonical;
  const robots =
    options?.override?.robots || {
      index: process.env.VERCEL_ENV === "production",
      follow: process.env.VERCEL_ENV === "production",
    } ||
    options?.fallback?.robots;

  const openGraphImage =
    (options?.override?.openGraph?.images as unknown as { url: string }[])?.[0]
      ?.url ||
    seo?.opengraphImage?.sourceUrl ||
    (options?.fallback?.openGraph?.images as unknown as { url: string }[])?.[0]
      ?.url ||
     config .metadata.openGraphImageFallback;

  const openGraphAltText =
    (
      options?.override?.openGraph?.images as unknown as { alt: string }[]
    )?.[0]?.alt ||
    seo?.opengraphImage?.altText ||
    (
      options?.fallback?.openGraph?.images as unknown as { alt: string }[]
    )?.[0]?.alt ||
     config .metadata.openGraphImageFallback;

  const twitterImage =
    (options?.override?.twitter?.images as unknown as { url: string }[])?.[0]
      ?.url ||
    seo?.twitterImage?.sourceUrl ||
    (options?.fallback?.twitter?.images as unknown as { url: string }[])?.[0]
      ?.url ||
     config .metadata.openGraphImageFallback;

  const twitterAltText =
    (options?.override?.twitter?.images as unknown as { alt: string }[])?.[0]
      ?.alt ||
    seo?.twitterImage?.altText ||
    (options?.fallback?.twitter?.images as unknown as { alt: string }[])?.[0]
      ?.alt ||
     config .metadata.openGraphImageFallback;

  const openGraph = {
    type: "website",
    title:
      options?.override?.openGraph?.title ||
      seo?.opengraphTitle ||
      seo?.title ||
      options?.fallback?.title ||
       config .metadata.appName,
    description: removeHtmlTags(
      options?.override?.openGraph?.description ||
        seo?.opengraphDescription ||
        seo?.metaDesc ||
        options?.fallback?.description ||
        options?.override?.description ||
        description ||
        config.metadata.description ||
        ""
    ),
    url: options?.override?.openGraph?.url || "",
    siteName:
      options?.override?.openGraph?.siteName || seo?.opengraphSiteName || "",
    ...(openGraphImage && {
      images: [
        {
          url: openGraphImage,
          alt: openGraphAltText,
        },
      ],
    }),
  };

  const twitter = {
    card: "summary_large_image",
    title:
      options?.override?.twitter?.title ||
      seo?.twitterTitle ||
      seo?.title ||
      options?.fallback?.title ||
       config .metadata.appName,
    description: removeHtmlTags(
      options?.override?.twitter?.description ||
        seo?.twitterDescription ||
        seo?.metaDesc ||
        options?.override?.description ||
        description ||
        config.metadata.description ||
        ""
    ),
    ...(twitterImage && {
      images: [
        {
          url: twitterImage,
          alt: twitterAltText,
        },
      ],
    }),
  };

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    robots,
    openGraph,
    twitter,
  };
};

export { makeRootMetadata, makeSEOMetadata };

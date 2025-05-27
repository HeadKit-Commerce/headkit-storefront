import config from "@/headkit.config";
import { removeHtmlTags } from "@/lib/utils";
import { Metadata } from "next";
import { PostTypeSeoContentFragment, TaxonomySeoContentFragment } from "../generated";
import { getSEOSettings } from "../actions";

interface RootMetadata {
  title?: string | null;
  description?: string | null;
}

const makeRootMetadata = async ({ title, description }: RootMetadata): Promise<Metadata> => {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "";
  
  // Fetch global SEO settings as fallback
  let seoSettings = null;
  try {
    const { data } = await getSEOSettings();
    seoSettings = data?.seoSettings;
  } catch (error) {
    console.warn("Failed to fetch SEO settings:", error);
  }

  return {
    title: title || seoSettings?.title || config.metadata.appName,
    description: description || seoSettings?.description || config.metadata.description,
    metadataBase: new URL(baseUrl),
    applicationName: config.metadata.appName,
  };
};

type SEOContentFragment = TaxonomySeoContentFragment | PostTypeSeoContentFragment | null | undefined;

const makeSEOMetadata = async (
  seo?: SEOContentFragment,
  options?: { fallback?: Metadata; override?: Metadata }
): Promise<Metadata> => {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "";

  // Fetch global SEO settings as fallback
  let seoSettings = null;
  try {
    const { data } = await getSEOSettings();
    seoSettings = data?.seoSettings;
  } catch (error) {
    console.warn("Failed to fetch SEO settings:", error);
  }

  const title =
    seo?.title || 
    options?.fallback?.title || 
    seoSettings?.title || 
    config.metadata.appName;

  const description = removeHtmlTags(
    options?.override?.description ||
      seo?.metaDesc ||
      options?.fallback?.description ||
      options?.override?.openGraph?.description ||
      seo?.opengraphDescription ||
      options?.override?.twitter?.description ||
      seo?.twitterDescription ||
      seoSettings?.description ||
      config.metadata.description
  );

  const keywords =
    options?.override?.keywords ||
    seo?.metaKeywords ||
    options?.fallback?.keywords;

  const canonical =
    options?.override?.alternates?.canonical ||
    seo?.canonical ||
    options?.fallback?.alternates?.canonical ||
    options?.override?.openGraph?.url;

  const robots =
    options?.override?.robots || {
      index: process.env.VERCEL_ENV === "production",
      follow: process.env.VERCEL_ENV === "production",
    } ||
    options?.fallback?.robots;

  // Enhanced image handling with mutual fallbacks
  const ogImageFromOverride = (options?.override?.openGraph?.images as { url: string }[])?.[0]?.url;
  const ogImageFromSeo = seo?.opengraphImage?.sourceUrl;
  const ogImageFromFallback = (options?.fallback?.openGraph?.images as { url: string }[])?.[0]?.url;
  const ogImageFromSeoSettings = seoSettings?.ogImageUrl;
  
  const twitterImageFromOverride = (options?.override?.twitter?.images as { url: string }[])?.[0]?.url;
  const twitterImageFromSeo = seo?.twitterImage?.sourceUrl;
  const twitterImageFromFallback = (options?.fallback?.twitter?.images as { url: string }[])?.[0]?.url;
  
  // Define file-based fallbacks
  const fileBasedOgImage = `${baseUrl}/opengraph-image`;
  const fileBasedTwitterImage = `${baseUrl}/twitter-image`;
  
  // Direct sources for each platform with SEO settings fallback
  const primaryOgImage = ogImageFromOverride || ogImageFromSeo || ogImageFromFallback || ogImageFromSeoSettings;
  const primaryTwitterImage = twitterImageFromOverride || twitterImageFromSeo || twitterImageFromFallback || ogImageFromSeoSettings;
  
  // If we have specific images, use them; otherwise use the file-based images
  const openGraphImage = primaryOgImage || primaryTwitterImage || fileBasedOgImage;
  const twitterImage = primaryTwitterImage || primaryOgImage || fileBasedTwitterImage;

  // Handle alt text with proper fallbacks
  const openGraphAltText = 
    (options?.override?.openGraph?.images as { alt: string }[])?.[0]?.alt ||
    seo?.opengraphImage?.altText ||
    (options?.fallback?.openGraph?.images as { alt: string }[])?.[0]?.alt ||
    title || '';

  const twitterAltText =
    (options?.override?.twitter?.images as { alt: string }[])?.[0]?.alt ||
    seo?.twitterImage?.altText ||
    (options?.fallback?.twitter?.images as { alt: string }[])?.[0]?.alt ||
    openGraphAltText || 
    title || '';

  // Extract and format dates if available
  const publishedTime = seo?.opengraphPublishedTime || null;
  const modifiedTime = seo?.opengraphModifiedTime || null;

  // Safely build OpenGraph object with proper types
  const openGraphBase = {
    type: "website" as const,
    title:
      options?.override?.openGraph?.title ||
      seo?.opengraphTitle ||
      seo?.title ||
      options?.fallback?.title ||
      seoSettings?.title ||
      config.metadata.appName,
    description: removeHtmlTags(
      options?.override?.openGraph?.description ||
        seo?.opengraphDescription ||
        seo?.metaDesc ||
        options?.fallback?.description ||
        description ||
        seoSettings?.description ||
        config.metadata.description ||
        ""
    ),
    url: (options?.override?.openGraph?.url ||
      seo?.opengraphUrl ||
      canonical ||
      options?.fallback?.openGraph?.url ||
      "") as string,
    siteName:
      options?.override?.openGraph?.siteName ||
      seo?.opengraphSiteName ||
      seoSettings?.title ||
      config.metadata.appName ||
      "",
    locale: "en_US",
  };

  // Add conditional properties
  const openGraph: Metadata["openGraph"] = {
    ...openGraphBase,
    ...(publishedTime && { publishedTime }),
    ...(modifiedTime && { modifiedTime }),
  };

  // Always include images
  openGraph.images = [
    {
      url: openGraphImage,
      alt: String(openGraphAltText),
      width: 1200,
      height: 630,
    },
  ];

  // Build Twitter object with proper types
  const twitter: Metadata["twitter"] = {
    card: "summary_large_image",
    title:
      options?.override?.twitter?.title ||
      seo?.twitterTitle ||
      seo?.title ||
      options?.fallback?.title ||
      seoSettings?.title ||
      config.metadata.appName,
    description: removeHtmlTags(
      options?.override?.twitter?.description ||
        seo?.twitterDescription ||
        seo?.metaDesc ||
        options?.fallback?.description ||
        description ||
        seoSettings?.description ||
        config.metadata.description ||
        ""
    ),
  };

  // Always include Twitter images
  twitter.images = [
    {
      url: twitterImage,
      alt: String(twitterAltText),
      width: 1200,
      height: 630,
    },
  ];

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    robots,
    openGraph,
    twitter,
    metadataBase: new URL(baseUrl),
  };
};

export { makeRootMetadata, makeSEOMetadata };

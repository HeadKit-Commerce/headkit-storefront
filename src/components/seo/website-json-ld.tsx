import { headkit } from "@/lib/headkit/client";
import config from "@/headkit.config";
import Script from "next/script";

export async function WebsiteJsonLD() {
  const client = await headkit();
  const { data: { generalSettings } } = await client.getGeneralSettings();
  
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${process.env.NEXT_PUBLIC_FRONTEND_URL}/#website`,
    "name": generalSettings?.title || config.metadata.appName,
    "url": process.env.NEXT_PUBLIC_FRONTEND_URL,
    "description": generalSettings?.description || config.metadata.description,
    "potentialAction": [
      {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${process.env.NEXT_PUBLIC_FRONTEND_URL}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    ],
    "inLanguage": "en-US"
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${process.env.NEXT_PUBLIC_FRONTEND_URL}/#organization`,
    "name": generalSettings?.title || config.metadata.appName,
    "url": process.env.NEXT_PUBLIC_FRONTEND_URL,
    "logo": {
      "@type": "ImageObject",
      "inLanguage": "en-US",
      "@id": `${process.env.NEXT_PUBLIC_FRONTEND_URL}/#logo`,
      "url": `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/icon?size=512`,
      "contentUrl": `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/icon?size=512`,
      "width": 512,
      "height": 512,
      "caption": generalSettings?.title || config.metadata.appName
    },
    "image": {
      "@id": `${process.env.NEXT_PUBLIC_FRONTEND_URL}/#logo`
    }
  };

  return (
    <>
      <Script
        id="websiteJsonLD"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Script
        id="organizationJsonLD"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </>
  );
} 
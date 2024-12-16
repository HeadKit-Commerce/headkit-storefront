import Script from "next/script";
import { SearchAction, WebSite, WithContext } from "schema-dts";

interface SearchboxJsonLDProps {
  url: string;
  searchUrl: string;
}

export const SearchboxJsonLD = ({ url, searchUrl }: SearchboxJsonLDProps) => {
  type SearchActionWithQueryInput = SearchAction & {
    "query-input": string;
  };
  const searchAction: SearchActionWithQueryInput = {
    "@type": "SearchAction",
    target: `${searchUrl}{search_term_string}`,
    "query-input": "required name=search_term_string",
  };
  const jsonLd: WithContext<WebSite> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: url,
    potentialAction: searchAction,
  };

  return (
    <>
      <Script
        id="searchboxJsonLD"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
};

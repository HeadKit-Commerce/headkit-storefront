import { GetFaQsQuery } from "@/lib/headkit/generated";
import Script from "next/script";
import { FAQPage, WithContext } from "schema-dts";

interface FAQPageJsonLDProps {
  faqs: GetFaQsQuery;
}

export const FAQPageJsonLD = ({ faqs }: FAQPageJsonLDProps) => {
  const jsonLd: WithContext<FAQPage> = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs?.faqs?.nodes
      .filter((faq): faq is NonNullable<typeof faq> => 
        faq?.question != null && faq?.answer != null
      )
      .map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer
        }
      })) as FAQPage["mainEntity"]
  };

  return (
    <>
      <Script
        id="faqPageJsonLD"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
};

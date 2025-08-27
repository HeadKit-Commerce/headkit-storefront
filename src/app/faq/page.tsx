import { PageIdType, PostObjectsConnectionOrderbyEnum, OrderEnum } from "@/lib/headkit/generated";
import { Metadata } from "next";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import sanitize from "sanitize-html";
import { makeSEOMetadata } from "@/lib/headkit/utils/make-metadata";
import { headkit } from "@/lib/headkit/client";

const FAQ_SLUG = "faq";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await headkit().getPage({
    id: FAQ_SLUG,
    type: PageIdType.Uri,
  });

  const page = data?.page;
  if (!page?.seo) {
    return {
      title: "FAQ",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return await makeSEOMetadata(page.seo, {
    fallback: {
      title: page.title,
      description: page.seo.metaDesc,
    },
  });
}

export default async function FAQPage() {
  // Fetch page content and FAQs in parallel
  const [pageData, faqsData] = await Promise.all([
    headkit().getPage({
      id: FAQ_SLUG,
      type: PageIdType.Uri,
    }),
    headkit().getFAQs({
      where: {
        orderby: [{
          field: PostObjectsConnectionOrderbyEnum.Date,
          order: OrderEnum.Asc
        }]
      }
    })
  ]);

  const page = pageData.data?.page;
  const faqs = faqsData.data?.faqs?.nodes;

  if (!page) {
    return <div className="py-20 text-center text-[60px]">404 NOT FOUND</div>;
  }

  // Generate FAQ schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs?.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="px-5 md:px-10 py-10 md:py-16">
        <div>
          {/* Header */}
          <div className="mb-12">
            <h1 className="mb-6 text-3xl font-bold text-purple-800">{page.title}</h1>
            {page.content && (
              <div
                className="prose text-purple-800 max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitize(page.content || "") }}
              />
            )}
          </div>

          {/* FAQ Accordion */}
          {faqs && faqs.length > 0 && (
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={faq.id || index}
                  value={faq.id || index.toString()}
                  className="rounded-lg border border-purple-200 px-4"
                >
                  <AccordionTrigger className="text-left font-medium cursor-pointer">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div
                      className="prose text-purple-800 max-w-none pt-2"
                      dangerouslySetInnerHTML={{ __html: sanitize(faq.answer || "") }}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </>
  );
} 
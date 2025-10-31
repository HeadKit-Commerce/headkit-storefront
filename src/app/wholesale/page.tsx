import { PageIdType } from "@/lib/headkit/generated";
import { Metadata } from "next";
import { GravityForm } from "@/components/gravity-form";
import sanitize from "sanitize-html";
import { makeSEOMetadata } from "@/lib/headkit/utils/make-metadata";
import { getPage } from "@/lib/headkit/queries";

const WHOLESALE_SLUG = "wholesale";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getPage({
    id: WHOLESALE_SLUG,
    type: PageIdType.Uri,
  });

  const page = data?.page;
  if (!page?.seo) {
    return {
      title: "Wholesale",
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

export default async function Page() {
  const { data } = await getPage({
    id: WHOLESALE_SLUG,
    type: PageIdType.Uri,
  });

  const page = data?.page;

  if (!page) {
    return <div className="py-20 text-center text-[60px]">404 NOT FOUND</div>;
  }

  return (
    <div className="px-5 md:px-10 py-10 md:py-16">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Left Column - Content */}
        <div>
          <h1 className="mb-6 text-3xl font-bold text-purple-800">{page.title}</h1>
          <div
            className="prose text-purple-800 max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitize(page.content || "") }}
          />
        </div>

        {/* Right Column - Form */}
        <div>
          <GravityForm formId="2" />
        </div>
      </div>
    </div>
  );
} 
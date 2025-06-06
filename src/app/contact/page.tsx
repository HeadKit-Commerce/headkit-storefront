import { PageIdType } from "@/lib/headkit/generated";
import { Metadata } from "next";
import { GravityForm } from "@/components/gravity-form";
import sanitize from "sanitize-html";
import { makeSEOMetadata } from "@/lib/headkit/utils/make-metadata";
import { getPage } from "@/lib/headkit/actions";

const CONTACT_SLUG = "contact";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getPage({
    id: CONTACT_SLUG,
    type: PageIdType.Uri,
  });

  const page = data?.page;
  if (!page?.seo) {
    return {
      title: "Contact Us",
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

export default async function ContactPage() {
  const { data } = await getPage({
    id: CONTACT_SLUG,
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
          <GravityForm formId="1" />
        </div>

        {/* Full Width Map */}
        <div className="col-span-1 mt-12 md:col-span-2">
          <iframe
            className="h-[450px] w-full rounded-lg"
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d414.2441332052148!2d151.208024!3d-33.839321!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12aef2f20f9d09%3A0x2df5ebd486d15fd6!2sSophos%20House%2C%206%2F1%20Elizabeth%20Plaza%2C%20North%20Sydney%20NSW%202060%2C%20Australia!5e0!3m2!1sen!2sth!4v1715583061026!5m2!1sen!2sth"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
} 
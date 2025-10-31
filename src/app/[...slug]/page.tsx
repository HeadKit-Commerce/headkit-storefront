import { PageIdType } from "@/lib/headkit/generated";
import { ResolvingMetadata, Metadata } from "next";
import { makeSEOMetadata } from "@/lib/headkit/utils/make-metadata";
import { notFound } from "next/navigation";
import sanitize from "sanitize-html";
import { getPage } from "@/lib/headkit/queries";

type Props = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string }>;
};

async function getPageData(params: Props["params"]) {
  const resolvedParams = await params;
  // Create URL path with leading slash
  const finalSlug = `/${resolvedParams.slug.join("/")}`;

  const response = await getPage({
    id: finalSlug,
    type: PageIdType.Uri,
  });

  return response;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const { data: page } = await getPageData(params);
    const seo = page?.page?.seo;

    if (!seo) {
      throw new Error("Not Found");
    }

    return makeSEOMetadata(seo, { fallback: { title: page?.page?.title } });
  } catch {
    const parentMetadata = await parent;
    return {
      title: parentMetadata?.title,
      description: parentMetadata?.description,
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function Page({ params }: Props) {
  const { data: page } = await getPageData(params);

  if (!page?.page) {
    return notFound();
  }

  return (
    <div className="px-5 md:px-10 my-10 min-h-[50vh]">
      <h1 className="font-extrabold text-3xl text-purple-800">{page?.page?.title}</h1>
      <div className="mt-5 grid grid-cols-12">
        <div className="prose col-span-9">
          <div
            dangerouslySetInnerHTML={{ __html: sanitize(page?.page?.content || "") }}
          ></div>
        </div>
      </div>
    </div>
  );
}

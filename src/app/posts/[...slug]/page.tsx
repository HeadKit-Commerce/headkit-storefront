import { PostCarousel } from "@/components/carousel/post-carousel";
import { SectionHeader } from "@/components/common/section-header";
import { FeaturedImageHeader } from "@/components/post/featured-image-header";
import { ArticleJsonLD } from "@/components/seo/article-json-ld";
import { BreadcrumbJsonLD } from "@/components/seo/breadcrumb-json-ld";
import { headkit } from "@/lib/headkit/client";
import {
  OrderEnum,
  PostIdType,
  PostObjectsConnectionOrderbyEnum,
} from "@/lib/headkit/generated";
import { processText } from "@/lib/utils";
import sanitize from "sanitize-html";

interface Props {
  params: Promise<{ slug: string[] }>;
}

export default async function Page({ params }: Props) {

  const { slug } = await params;
  const post = await headkit().getPost({ id: slug[slug.length - 1], type: PostIdType.Slug });

  const { text, highlightedText } = processText(post?.data.post?.title || "");

  const postNews = await headkit().getPosts({
    first: 0,
    last: 10,
    where: {
      notIn: [post?.data?.post?.id || ""],
      orderby: [
        {
          field: PostObjectsConnectionOrderbyEnum.Date,
          order: OrderEnum.Desc,
        },
      ],
    },
  });
  return (
    <>
      <ArticleJsonLD seo={post?.data?.post?.seo || {}} />
      <BreadcrumbJsonLD seo={post?.data?.post?.seo || {}} />

      <div>
        <FeaturedImageHeader
          text={text}
          highlightedText={highlightedText}
          image={post?.data?.post?.featuredImage?.node?.sourceUrl || ""}
        />
        <div className="my-[40px] grid grid-cols-12 gap-2 md:gap-8 px-[20px] md:px-[40px]">
          <div className="col-span-12 md:col-span-9">
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: sanitize(post?.data?.post?.content || "") }}
            />
          </div>
        </div>

        {(postNews?.data?.posts?.nodes?.length ?? 0) > 0 && (
          <div className="overflow-hidden px-5 md:px-10 py-[30px] lg:pt-[60px] lg:pb-[30px]">
            <SectionHeader
              title="Latest News"
              description="Get the latest news and updates from our blog."
              allButton="View All"
              allButtonPath="/posts"
            />
            <div className="mt-5">
              <PostCarousel
                posts={
                  postNews?.data?.posts?.nodes.map((post) => ({
                    title: post?.title || "",
                    slug: post?.slug || "",
                    featuredImage: {
                      src: post?.featuredImage?.node?.sourceUrl || "",
                      alt: post?.title || "",
                    },
                  })) ?? []
                }
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}



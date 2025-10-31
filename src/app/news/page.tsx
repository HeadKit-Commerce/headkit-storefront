import { Metadata } from "next";
import { PostPage } from "@/components/post/post-page";
import { makeWherePostQuery, SortKeyType } from "@/components/post/utils";
import { PostHeader } from "@/components/post/post-header";
import headkitConfig from "@/headkit.config";
import { getPosts, getPostFilters } from "@/lib/headkit/queries";
import { Suspense } from "react";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    sort?: string;
    categories?: string;
    [key: string]: string | undefined;
  }>;
}

export const metadata: Metadata = {
  title: headkitConfig.article.name,
  description: "Browse our collection of posts",
};

async function PostsContent({ searchParams }: PageProps) {
  const parsedSearchParams = await searchParams;
  const page = parsedSearchParams.page
    ? parseInt(parsedSearchParams.page)
    : 0;
  const perPage = 12;
  const categories =
    parsedSearchParams.categories?.split(",").filter(Boolean) || [];

  const filterQuery = {
    sort: parsedSearchParams.sort as SortKeyType | undefined,
    categories,
  };

  const [postsData, filtersData] = await Promise.all([
    getPosts({
      first: perPage,
      where: makeWherePostQuery({
        filterQuery,
      }),
    }),
    getPostFilters({}),
  ]);

  return (
    <PostPage
      initialPosts={postsData.data}
      postFilter={filtersData.data}
      initialPage={page}
    />
  );
}

export default async function Page({ searchParams }: PageProps) {
  return (
    <>
      <PostHeader
        name={headkitConfig.article.name}
        breadcrumbData={[
          {
            name: "Home",
            uri: "/",
            current: false,
          },
          {
            name: "News & Tips",
            uri: "/news",
            current: true,
          },
        ]}
      />
      <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading posts...</div>}>
        <PostsContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

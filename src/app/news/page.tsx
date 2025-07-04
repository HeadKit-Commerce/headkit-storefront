import { Metadata } from "next";
import { getPostList, getPostFilters } from "@/lib/headkit/actions";
import { PostPage } from "@/components/post/post-page";
import { makeWherePostQuery, SortKeyType } from "@/components/post/utils";
import { PostHeader } from "@/components/post/post-header";
import headkitConfig from "@/headkit.config";

export const dynamic = "force-dynamic";

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

export default async function Page({ searchParams }: PageProps) {
  try {
    const parsedSearchParams = await searchParams;
    const page = parsedSearchParams.page ? parseInt(parsedSearchParams.page) : 0;
    const perPage = 12;
    const categories = parsedSearchParams.categories?.split(",").filter(Boolean) || [];

    const filterQuery = {
      sort: parsedSearchParams.sort as SortKeyType | undefined,
      categories,
    };

    const [postsData, filtersData] = await Promise.all([
      getPostList({
        input: {
          first: perPage,
          where: makeWherePostQuery({
            filterQuery,
          }),
        },
      }),
      getPostFilters({
        input: {
          where: {},
        },
      }),
    ]);

    return <>
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
      <PostPage
        initialPosts={postsData.data}
        postFilter={filtersData.data}
        initialPage={page}
      /></>;
  } catch (error) {
    console.error("Error fetching posts data:", error);
    throw error;
  }
} 
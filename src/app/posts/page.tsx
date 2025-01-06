import { Metadata } from "next";
import { getPostList, getPostFilters } from "@/lib/headkit/actions";
import { PostPage } from "@/components/post/post-page";
import { makeWherePostQuery, SortKeyType } from "@/components/post/utils";
import { PostHeader } from "@/components/post/post-header";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    sort?: string;
    categories?: string;
    [key: string]: string | undefined;
  }>;
}

export const metadata: Metadata = {
  title: "Posts",
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
          after: page > 0 ? btoa(`arrayconnection:${(page - 1) * perPage}`) : undefined,
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
        name="Posts"
        breadcrumbData={[
          {
            name: "Home",
            uri: "/",
            current: false,
          },
          {
            name: "Posts",
            uri: "/posts",
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
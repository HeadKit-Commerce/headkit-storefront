"use client";

import { GetPostCategoriesQuery, GetPostsQuery } from "@/lib/headkit/generated";
import { SortKeyType } from "./utils";
import { PostGrid } from "./post-grid";
import { PostProvider } from "./post-context";
import { Filter } from "./filter";

interface PostPageProps {
  initialPosts: GetPostsQuery;
  postFilter: GetPostCategoriesQuery;
  initialSort?: SortKeyType;
  initialPage?: number;
  initialCategories?: string[];
}

export function PostPage({
  initialPosts,
  postFilter,
  initialPage = 0,
}: PostPageProps) {
  return (
    <PostProvider
      initialPosts={initialPosts}
      postFilter={postFilter}
      initialPage={initialPage}
    >
      <div className="flex flex-col gap-8">
        <Filter />
        <PostGrid posts={initialPosts} />
      </div>
    </PostProvider>
  );
} 
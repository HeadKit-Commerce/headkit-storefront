"use client";

import { GetPostsQuery } from "@/lib/headkit/generated";
import { PostCard } from "./post-card";

interface PostGridProps {
  posts: GetPostsQuery;
}

export function PostGrid({ posts }: PostGridProps) {
  if (!posts?.posts?.nodes?.length) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <p className="text-lg text-gray-500">No posts found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 px-5 md:px-10">
      {posts.posts.nodes.map((post, index) => (
        <PostCard
          key={index}
          title={post?.title || ""}
          image={post?.featuredImage?.node?.sourceUrl || ""}
          uri={post?.slug || ""}
        />
      ))}
    </div>
  );
} 
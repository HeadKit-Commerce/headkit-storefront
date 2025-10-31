"use client";
import { Carousel } from "./carousel";
import { PostCard } from "../post/post-card";

interface Props {
  posts: {
    title: string;
    slug: string;
    featuredImage: {
      src: string;
      alt: string;
    };
  }[];
}
const PostCarousel = ({ posts }: Props) => {
  return (
    <Carousel
      items={posts}
      renderItem={(post) => (
        <PostCard
          title={post.title}
          image={post?.featuredImage?.src || ""}
          uri={post.slug}
        />
      )}
      className="w-full pb-8"
      showPagination={false}
    />
  );
};

export { PostCarousel };

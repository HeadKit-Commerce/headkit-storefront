"use client";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselPagination,
  useDotButton,
} from "@/components/ui/carousel";
import { useState } from "react";
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
  const [api, setApi] = useState<CarouselApi>();
  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(api);

  return (
    <Carousel
      setApi={setApi}
      opts={{
        align: "start",
      }}
      className="w-full pb-8"
    >
      <CarouselContent className="-ml-[30px]">
        {posts.map((post, index) => (
          <CarouselItem
            key={index}
            className="basis-10/12 sm:basis-1/2 lg:basis-1/3 pl-[30px]"
          >
            <PostCard
              title={post.title}
              image={post?.featuredImage?.src || ""}
              uri={post.slug}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      {scrollSnaps.length > 1 && (
        <CarouselPagination
          itemLength={scrollSnaps.length}
          selectedIndex={selectedIndex}
          onChange={(index) => {
            onDotButtonClick(index);
          }}
          className="!-bottom-2"
        />
      )}
    </Carousel>
  );
};

export { PostCarousel };

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
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
      <CarouselPrevious className="-left-4 bg-white" />
      <CarouselNext className="-right-4 bg-white" />
    </Carousel>
  );
};

export { PostCarousel };

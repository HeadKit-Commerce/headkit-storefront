import Link from "next/link";
import { cn } from "@/lib/utils";
import { CONFIG } from "@/config/app-config";
import { FeaturedImage } from "../product/featured-image";

interface Props {
  title: string;
  image: string;
  uri: string;
  subCategory?: string;
  textStyle?: "dark" | "light";
}
const PostCard = ({ title, image, uri, textStyle = "dark" }: Props) => {
  return (
    <Link href={`${CONFIG.article.link}/${uri}`}>
      <div className="w-full ">
        <FeaturedImage sourceUrl={image} />

        <div className="flex justify-between pt-2">
          <h5
            className={cn("text-[15px] font-semibold", {
              "text-pink-500": textStyle === "light",
              "text-purple-800": textStyle === "dark",
            })}
          >
            {title}
          </h5>
        </div>
      </div>
    </Link>
  );
};

export { PostCard };

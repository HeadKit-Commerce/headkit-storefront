import config from "@/headkit.config";

import Image from "next/image";

interface Props {
  sourceUrl?: string | null;
  alt?: string;
}
const FeaturedImage = ({ sourceUrl, alt }: Props) => {
  return (
    <>
      <div className="relative aspect-square overflow-hidden rounded-md bg-white">
        <Image
          src={sourceUrl || config.fallbackProductImage}
          alt={alt || ""}
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
    </>
  );
};

export { FeaturedImage };

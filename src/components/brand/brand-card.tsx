"use client";

import Image from "next/image";
import Link from "next/link";

interface Props {
  name: string;
  slug: string;
  logo: string;
}

export function BrandCard({ name, slug, logo }: Props) {
  return (
    <Link href={`/brands/${slug}`}>
      <div className="group relative flex flex-col">
        <div className="aspect-[3/2] w-full overflow-hidden flex justify-center items-center bg-white border border-gray-200 rounded-md">
          {logo ? (
            <div className="relative h-[50px] w-[160px]">
              <Image
                alt={name}
                src={logo}
                fill
                className="object-contain object-center"
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-lg text-gray-500">{name}</span>
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-col">
          <h3 className="text-xl font-semibold">{name}</h3>
        </div>
      </div>
    </Link>
  );
} 
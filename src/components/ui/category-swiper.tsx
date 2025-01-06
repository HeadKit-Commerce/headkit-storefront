"use client";

import Link from "next/link";
import { useRef } from "react";
import { Icon } from "@/components/icon";

interface Category {
  name: string;
  href: string;
  count?: number;
}

interface Props {
  categories: Category[];
}

export function CategorySwiper({ categories }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;
    const scrollAmount = 200;
    containerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 z-10 -translate-y-1/2 transform rounded-full bg-white p-2 shadow-md hover:bg-gray-50"
      >
        <Icon.arrowRight className="h-5 w-5 rotate-180 text-gray-600" />
      </button>
      <div
        ref={containerRef}
        className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth px-8"
      >
        {categories.map((category) => (
          <Link
            key={category.href}
            href={category.href}
            className="flex min-w-fit items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
          >
            {category.name}
            {category.count !== undefined && (
              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs">
                {category.count}
              </span>
            )}
          </Link>
        ))}
      </div>
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 transform rounded-full bg-white p-2 shadow-md hover:bg-gray-50"
      >
        <Icon.arrowRight className="h-5 w-5 text-gray-600" />
      </button>
    </div>
  );
} 
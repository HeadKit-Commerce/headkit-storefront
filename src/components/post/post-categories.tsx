"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface PostCategoriesProps {
  initialCategories: string[];
}

export function PostCategories({ initialCategories }: PostCategoriesProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateCategories = (categories: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categories.length > 0) {
      params.set("categories", categories.join(","));
    } else {
      params.delete("categories");
    }
    router.push(`?${params.toString()}`);
  };

  const toggleCategory = (category: string) => {
    const currentCategories = initialCategories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category];
    updateCategories(newCategories);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category.slug}
          onClick={() => toggleCategory(category.slug)}
          className={cn(
            "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
            initialCategories?.includes(category.slug)
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}

// This would typically come from your API/database
const categories = [
  { name: "All Posts", slug: "all" },
  { name: "News", slug: "news" },
  { name: "Updates", slug: "updates" },
  { name: "Tutorials", slug: "tutorials" },
]; 
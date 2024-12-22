"use client";

import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { VariantSwatch } from "@/components/product/product-variations/variant-swatch";

interface Props {
  name: string;
  slug: string;
  data: {
    count?: number;
    id?: string;
    name?: string;
    slug?: string;
    options?: string[];
  }[];
  align?: "left" | "right";
  multipleSelect?: boolean;
  className?: string;
  onChange: (e: { slug: string; value: string | string[] }) => void;
  clearFilter?: number;
}

const FilterList = ({
  slug,
  data,
  align = "left",
  multipleSelect = false,
  onChange,
  clearFilter,
}: Props) => {
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const searchParams = useSearchParams();
  const [isInitialized, setIsInitialized] = useState(false);

  // Combine initialization and clear filter into one effect
  useEffect(() => {
    if (!isInitialized) {
      const params = searchParams.get(slug)?.split(",").filter(Boolean);
      if (params?.length) {
        setSelectedOptions(new Set(params));
      }
      setIsInitialized(true);
    } else if (clearFilter) {
      setSelectedOptions(new Set());
    }
  }, [searchParams, slug, clearFilter, isInitialized]);

  // Simplified onChange effect with memoized value
  useEffect(() => {
    if (!isInitialized) return;
    
    const value = multipleSelect 
      ? Array.from(selectedOptions)
      : Array.from(selectedOptions)[0] || '';
    onChange({ slug, value });
  }, [selectedOptions, isInitialized]);

  const handleOptionClick = (optionSlug: string) => {
    setSelectedOptions((prev) => {
      const next = new Set(prev);
      
      if (!multipleSelect) {
        if (prev.has(optionSlug)) {
          next.clear();
        } else {
          next.clear();
          next.add(optionSlug);
        }
      } else {
        if (prev.has(optionSlug)) {
          next.delete(optionSlug);
        } else {
          next.add(optionSlug);
        }
      }
      return next;
    });
  };

  return (
    <>
      <div className="grid grid-flow-col grid-cols-2 grid-rows-6 gap-x-8 gap-y-4 md:grid-cols-12">
        {data.map((option, i) => {
          if (slug === "pa_colour") {
            return (
              <div
                key={option.id || i}
                onClick={() => handleOptionClick(option.slug || "")}
                role="menuitem"
                tabIndex={0}
                className={cn(
                  "col-span-2 flex cursor-pointer items-center hover:text-purple-500",
                  align === "right"
                    ? "justify-end md:col-start-11"
                    : i < 6
                    ? "md:col-start-2"
                    : "",
                  selectedOptions?.has(option.slug || "") && "font-bold"
                )}
              >
                <VariantSwatch
                  color1={option?.options?.[0] || ""}
                  color2={option?.options?.[1] || ""}
                  label={option.name || ""}
                  value={option.slug || ""}
                  selectedOptionValue={
                    selectedOptions?.has(option.slug || "") ? option.slug || "" : undefined
                  }
                />
                <span className="ml-4">{option.name}</span>
              </div>
            );
          } else {
            return (
              <div
                key={option.id || i}
                onClick={() => handleOptionClick(option.slug || "")}
                role="menuitem"
                tabIndex={0}
                className={cn(
                  "col-span-2 flex cursor-pointer items-center hover:text-purple-500",
                  align === "right"
                    ? "justify-end md:col-start-11"
                    : i < 6
                    ? "md:col-start-2"
                    : "",
                  selectedOptions?.has(option.slug || "") && "font-bold"
                )}
              >
                {selectedOptions?.has(option.slug || "") && (
                  <Icon.check className="mr-1 text-pink-500" />
                )}
                {option.name}
              </div>
            );
          }
        })}
      </div>
    </>
  );
};

export { FilterList };

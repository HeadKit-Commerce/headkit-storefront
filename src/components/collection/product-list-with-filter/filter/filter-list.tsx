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
  name,
  slug,
  data,
  align = "left",
  multipleSelect = false,
  className,
  onChange,
  clearFilter,
}: Props) => {
  const [active, setActive] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const searchParams = useSearchParams();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (selectedOptions && selectedOptions.size > 0) {
      onChange({
        slug,
        value: multipleSelect
          ? Array.from(selectedOptions)
          : Array.from(selectedOptions)[0],
      });
    }
  }, [selectedOptions, multipleSelect, slug, onChange]);

  useEffect(() => {
    if (active) {
      document.body.classList.add("overflow-hidden");
    }
    
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [active]);

  useEffect(() => {
    if (isInitialLoad) {
      const params = searchParams.get(slug)?.split(",");
      setSelectedOptions(params ? new Set(params) : new Set());
      setIsInitialLoad(false);
    }
  }, [searchParams, slug, isInitialLoad]);

  useEffect(() => {
    if (clearFilter !== 0) {
      setSelectedOptions(new Set());
    }
  }, [clearFilter]);

  const handleOptionClick = (optionSlug: string) => {
    setSelectedOptions((prev) => {
      if (!multipleSelect) {
        return new Set([optionSlug]);
      }
      const next = new Set(prev);
      if (prev.has(optionSlug)) {
        next.delete(optionSlug);
      } else {
        next.add(optionSlug);
      }
      return next;
    });
  };

  return (
    <>
      <div
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        className={cn("flex h-full items-center justify-center px-4 py-2", className)}
        role="button"
        aria-expanded={active}
        aria-haspopup="true"
      >
        <div
          className={cn("relative cursor-default whitespace-nowrap", {
            "font-bold": selectedOptions?.size > 0,
          })}
        >
          <span className={cn(active && "text-purple-500")}>{name}</span>
          {selectedOptions?.size > 0 && (
            <div className="absolute right-[-12px] top-[-2px] h-[14px] w-[14px] rounded-full bg-purple-500 text-center text-[10px] font-medium text-white">
              {selectedOptions?.size}
            </div>
          )}
        </div>
      </div>

      <div
        className={cn(
          "absolute left-0 top-[100%] z-[1000] w-full overflow-hidden bg-white",
          active ? "block" : "hidden"
        )}
        role="menu"
      >
        <div className="px-5 py-10 duration-700 ease-out animate-in slide-in-from-bottom-5 lg:px-10">
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
        </div>
      </div>

      <div
        className={cn(
          "absolute left-0 top-[100%] z-[999] hidden h-screen w-full bg-black/60 backdrop-blur-md",
          active ? "block" : "hidden"
        )}
        onMouseEnter={() => {
          setActive(false);
        }}
      />
    </>
  );
};

export { FilterList };

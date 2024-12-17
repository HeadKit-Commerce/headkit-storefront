"use client";

import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Props {
  name: string;
  slug: string;
  onChange: (e: { slug: string; value: string }) => void;
}

const ToggleFilter = ({ name, slug, onChange }: Props) => {
  const [value, setValue] = useState<boolean>();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof value === "boolean") onChange({ slug, value: `${value}` });
  }, [value]);

  useEffect(() => {
    const params = searchParams.get(slug);
    const value = params ? JSON.parse(params) : undefined;
    if (typeof value === "boolean") {
      setValue(value);
    } else {
      setValue(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="flex h-full items-center">
      <div className="relative inline-flex cursor-pointer items-center">
        <div
          className={cn(
            "peer h-5 w-[30px] rounded-full bg-gray-300 after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-purple-500 after:transition-all after:content-[''] ",
            value
              ? "bg-yes after:translate-x-[10px] after:border-white rtl:after:-translate-x-[10px]"
              : ""
          )}
          onClick={() => {
            setValue(!value);
          }}
        ></div>
      </div>
      <div className="ml-2  whitespace-nowrap">{name}</div>
    </div>
  );
};

export { ToggleFilter };

"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useSearchParams } from "next/navigation";

interface Props {
  name: string;
  slug: string;
  onChange: (e: { slug: string; value: string }) => void;
}

const ToggleFilter = ({ name, slug, onChange }: Props) => {
  const searchParams = useSearchParams();
  const [isChecked, setIsChecked] = useState(() => {
    // Initialize state from URL params
    return searchParams.get(slug) === 'true';
  });

  // Handle URL changes
  useEffect(() => {
    const urlValue = searchParams.get(slug) === 'true';
    if (isChecked !== urlValue) {
      setIsChecked(urlValue);
    }
  }, [searchParams, slug, isChecked]);

  return (
    <div className="flex items-center space-x-2 px-4">
      <Checkbox
        id={slug}
        checked={isChecked}
        onCheckedChange={(checked) => {
          const newValue = Boolean(checked);
          setIsChecked(newValue);
          onChange({
            slug,
            value: newValue ? 'true' : '',
          });
        }}
      />
      <label
        htmlFor={slug}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {name}
      </label>
    </div>
  );
};

export { ToggleFilter };

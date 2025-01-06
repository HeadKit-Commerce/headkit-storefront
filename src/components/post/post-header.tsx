"use client";

import { Breadcrumb } from "@/components/ui/breadcrumb";
import sanitize from "sanitize-html";

interface Props {
  name: string;
  description?: string;
  breadcrumbData: {
    name: string;
    uri: string;
    current: boolean;
  }[];

}

export function PostHeader({ name, description, breadcrumbData }: Props) {
  return (
    <div className="overflow-x-hidden">
      <div className="mb-5 grid grid-cols-1 gap-5 px-4 md:grid-cols-2 md:px-10">
        <div className="pt-5">
          {breadcrumbData && <Breadcrumb items={breadcrumbData} />}
          <h1 className="mb-[10px] mt-5 text-3xl font-bold">{name}</h1>
          <p
            dangerouslySetInnerHTML={{
              __html: sanitize(description || ""),
            }}
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icon";
import { SortKeyType } from "./utils";

const sortOptions = [
  { name: "Most Recent", value: "DATE_DESC" },
  { name: "Oldest First", value: "DATE_ASC" },
] as const;

interface PostSortProps {
  initialSort?: SortKeyType;
}

export function PostSort({ initialSort }: PostSortProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
          Sort
          <Icon.chevronDown
            className="-mr-1 ml-1 h-5 w-5 shrink-0 text-gray-400 group-hover:text-gray-500"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-hidden">
          <div className="py-1">
            {sortOptions.map((option) => (
              <Menu.Item key={option.value}>
                {({ active }) => (
                  <button
                    onClick={() => updateSort(option.value)}
                    className={cn(
                      option.value === initialSort ? "font-medium text-gray-900" : "text-gray-500",
                      active ? "bg-gray-100" : "",
                      "block px-4 py-2 text-sm w-full text-left"
                    )}
                  >
                    {option.name}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
} 
"use client";

import { Fragment, useState } from "react";
import { Dialog, Disclosure, Menu, Transition } from "@headlessui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icon";

interface Category {
  name: string;
  slug: string;
}

interface Props {
  categories: Category[];
  children: React.ReactNode;
}

const sortOptions = [
  { name: "Newest", value: "newest" },
  { name: "Oldest", value: "oldest" },
];

export function PostFilter({ categories, children }: Props) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "newest";
  const currentCategory = searchParams.get("category");

  function updateFilters(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div>
      {/* Mobile filter dialog */}
      <Transition.Root show={mobileFiltersOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-40 lg:hidden"
          onClose={setMobileFiltersOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-6 shadow-xl">
                <div className="flex items-center justify-between px-4">
                  <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                  <button
                    type="button"
                    className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <Icon.close className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Filters */}
                <form className="mt-4">
                  <Disclosure
                    as="div"
                    className="border-t border-gray-200 px-4 py-6"
                    defaultOpen={true}
                  >
                    {({ open }) => (
                      <>
                        <h3 className="-mx-2 -my-3 flow-root">
                          <Disclosure.Button className="flex w-full items-center justify-between bg-white px-2 py-3 text-sm text-gray-400 hover:text-gray-500">
                            <span className="font-medium text-gray-900">
                              Categories
                            </span>
                            <span className="ml-6 flex items-center">
                              <Icon.chevronDown
                                className={cn(
                                  open ? "-rotate-180" : "rotate-0",
                                  "h-5 w-5 transform"
                                )}
                                aria-hidden="true"
                              />
                            </span>
                          </Disclosure.Button>
                        </h3>
                        <Disclosure.Panel className="pt-6">
                          <div className="space-y-6">
                            {categories.map((category) => (
                              <div
                                key={category.slug}
                                className="flex items-center"
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateFilters(
                                      "category",
                                      currentCategory === category.slug
                                        ? null
                                        : category.slug
                                    )
                                  }
                                  className={cn(
                                    "text-sm hover:text-indigo-500",
                                    currentCategory === category.slug
                                      ? "font-medium text-indigo-600"
                                      : "text-gray-500"
                                  )}
                                >
                                  {category.name}
                                </button>
                              </div>
                            ))}
                          </div>
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Posts
          </h1>

          <div className="flex items-center">
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
                            onClick={() => updateFilters("sort", option.value)}
                            className={cn(
                              option.value === currentSort
                                ? "font-medium text-gray-900"
                                : "text-gray-500",
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

            <button
              type="button"
              className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <span className="sr-only">Filters</span>
              <Icon.hamburger className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <section aria-labelledby="posts-heading" className="pb-24 pt-6">
          <h2 id="posts-heading" className="sr-only">
            Posts
          </h2>

          <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
            {/* Filters */}
            <form className="hidden lg:block">
              <Disclosure
                as="div"
                className="border-b border-gray-200 py-6"
                defaultOpen={true}
              >
                {({ open }) => (
                  <>
                    <h3 className="-my-3 flow-root">
                      <Disclosure.Button className="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                        <span className="font-medium text-gray-900">
                          Categories
                        </span>
                        <span className="ml-6 flex items-center">
                          <Icon.chevronDown
                            className={cn(
                              open ? "-rotate-180" : "rotate-0",
                              "h-5 w-5 transform"
                            )}
                            aria-hidden="true"
                          />
                        </span>
                      </Disclosure.Button>
                    </h3>
                    <Disclosure.Panel className="pt-6">
                      <div className="space-y-4">
                        {categories.map((category) => (
                          <div key={category.slug} className="flex items-center">
                            <button
                              type="button"
                              onClick={() =>
                                updateFilters(
                                  "category",
                                  currentCategory === category.slug
                                    ? null
                                    : category.slug
                                )
                              }
                              className={cn(
                                "text-sm hover:text-indigo-500",
                                currentCategory === category.slug
                                  ? "font-medium text-indigo-600"
                                  : "text-gray-500"
                              )}
                            >
                              {category.name}
                            </button>
                          </div>
                        ))}
                      </div>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            </form>

            {/* Post grid */}
            <div className="lg:col-span-3">{children}</div>
          </div>
        </section>
      </div>
    </div>
  );
} 
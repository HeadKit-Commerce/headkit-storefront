"use client";

import { useBrand } from "./brand-context";

export function LoadMore() {
  const { loadMore, loadingMore, hasMore } = useBrand();

  if (!hasMore) return null;

  return (
    <button
      onClick={loadMore}
      disabled={loadingMore}
      className="inline-flex items-center rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loadingMore ? "Loading..." : "Load More"}
    </button>
  );
}

export function LoadPrevious() {
  const { loadPrevious, loading, hasPrevious } = useBrand();

  if (!hasPrevious) return null;

  return (
    <button
      onClick={loadPrevious}
      disabled={loading}
      className="inline-flex items-center rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Loading..." : "Load Previous"}
    </button>
  );
}

export function BrandCount() {
  const { brands } = useBrand();
  const count = brands?.brands?.nodes?.length ?? 0;

  return (
    <p className="text-sm text-gray-500">
      Showing {count} result{count === 1 ? "" : "s"}
    </p>
  );
} 
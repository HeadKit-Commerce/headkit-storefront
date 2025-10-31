"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GetPostCategoriesQuery, GetPostsQuery, PostObjectsConnectionOrderbyEnum, OrderEnum } from "@/lib/headkit/generated/index";
import { getPosts as getPostList } from "@/lib/headkit/queries";
import { SortKeyType } from "./utils";

interface FilterValues {
  categories: string[];
  sort?: SortKeyType;
}

interface PostContextType {
  posts: GetPostsQuery;
  postFilter: GetPostCategoriesQuery;
  filterValues: FilterValues;
  setFilterValues: (values: FilterValues) => void;
  page: number;
  itemsPerPage: number;
  search?: string;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  hasPrevious: boolean;
  loadMore: () => Promise<void>;
  loadPrevious: () => Promise<void>;
  updateFilter: (key: string, value: string[]) => void;
  updateSort: (value: string) => void;
  clearFilters: () => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

interface PostProviderProps {
  children: React.ReactNode;
  initialPosts: GetPostsQuery;
  postFilter: GetPostCategoriesQuery;
  initialPage?: number;
  itemsPerPage?: number;
  search?: string;
}

export function PostProvider({
  children,
  initialPosts,
  postFilter,
  initialPage = 0,
  itemsPerPage = 12,
  search,
}: PostProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<GetPostsQuery>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(initialPage);

  const hasMore = (posts?.posts?.nodes?.length ?? 0) > 0;
  const hasPrevious = page > 0;

  const filterValues: FilterValues = {
    categories: searchParams.get("categories")?.split(",") || [],
    sort: (searchParams.get("sort") as SortKeyType) || undefined,
  };

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    return params.toString();
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const newUrl = `${pathname}?${updateSearchParams({ page: nextPage.toString() })}`;
      router.push(newUrl);
      setPage(nextPage);
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const loadPrevious = async () => {
    if (loading || !hasPrevious) return;
    setLoading(true);
    try {
      const prevPage = Math.max(0, page - 1);
      const newUrl = `${pathname}?${updateSearchParams({ page: prevPage.toString() })}`;
      router.push(newUrl);
      setPage(prevPage);
    } catch (error) {
      console.error("Error loading previous posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: string, value: string[]) => {
    const newUrl = `${pathname}?${updateSearchParams({
      [key]: value.length > 0 ? value.join(",") : null,
      page: "0",
    })}`;
    router.push(newUrl);
    setPage(0);
  };

  const updateSort = (value: string) => {
    const newUrl = `${pathname}?${updateSearchParams({
      sort: value || null,
      page: "0",
    })}`;
    router.push(newUrl);
    setPage(0);
  };

  const clearFilters = () => {
    router.push(pathname);
    setPage(0);
  };

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(searchParams.toString());
        const page = parseInt(params.get("page") || "0");
        const categories = params.get("categories")?.split(",") || [];
        const sort = params.get("sort") || undefined;

        const response = await getPostList({
          first: itemsPerPage,
          after: page > 0 ? btoa(`arrayconnection:${(page - 1) * itemsPerPage}`) : undefined,
          where: {
            categoryIn: categories.length > 0 ? categories : undefined,
            orderby: sort ? [{ field: PostObjectsConnectionOrderbyEnum.Date, order: OrderEnum.Desc }] : undefined,
          },
        });
        
        if (response.data) {
          setPosts(response.data);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [searchParams, pathname, itemsPerPage]);

  return (
    <PostContext.Provider
      value={{
        posts,
        postFilter,
        filterValues,
        setFilterValues: (values: FilterValues) => {
          const newUrl = `${pathname}?${updateSearchParams({
            categories: values.categories.length > 0 ? values.categories.join(",") : null,
            sort: values.sort || null,
            page: "0",
          })}`;
          router.push(newUrl);
          setPage(0);
        },
        page,
        itemsPerPage,
        search,
        loading,
        loadingMore,
        hasMore,
        hasPrevious,
        loadMore,
        loadPrevious,
        updateFilter,
        updateSort,
        clearFilters,
      }}
    >
      {children}
    </PostContext.Provider>
  );
}

export function usePost() {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error("usePost must be used within a PostProvider");
  }
  return context;
} 
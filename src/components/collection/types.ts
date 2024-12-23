import { z } from "zod";
import { GetProductFiltersQuery, GetProductListQuery } from "@/lib/headkit/generated";
import { SortKeyType } from "./utils";

export const filterSchema = z.object({
  categories: z.array(z.string()).default([]),
  brands: z.array(z.string()).default([]),
  attributes: z.record(z.array(z.string())).default({}),
  instock: z.boolean().default(false),
  sort: z.string().transform((val): SortKeyType | "" => val as SortKeyType | "").default(""),
  page: z.number().default(0),
});

export type FilterValues = z.infer<typeof filterSchema>;

export interface CollectionContextType {
  // Filter state
  filterValues: FilterValues;
  setFilter: <K extends keyof FilterValues>(key: K, value: FilterValues[K]) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  
  // Product state
  products: NonNullable<GetProductListQuery["products"]>["nodes"];
  totalProducts: number;
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  loadPrevious: () => Promise<void>;
  
  // Metadata
  productFilter: GetProductFiltersQuery;
  currentPage: number;
  itemsPerPage: number;
} 
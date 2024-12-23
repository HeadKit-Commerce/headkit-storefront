import { z } from "zod";

export interface FilterState {
  [key: string]: string | string[] | number;
}

export const filterSchema = z.object({
  categories: z.array(z.string()).default([]),
  brands: z.array(z.string()).default([]),
  attributes: z.record(z.array(z.string())).default({}),
  instock: z.boolean().default(false),
  sort: z.string().default(""),
  page: z.number().default(0),
});

export type FilterValues = z.infer<typeof filterSchema>; 
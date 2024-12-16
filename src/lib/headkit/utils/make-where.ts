import { RootQueryToProductUnionConnectionWhereArgs } from "../generated";

export type PageThatUseWhereProductQuery =
  | "collections"
  | "sale"
  | "new-products"
  | "featured"
  | "search";

export const makeWhereProductQuery = (
  forPage: PageThatUseWhereProductQuery,
  options?: {
    slug?: string[]; // for collections page
    searchString?: string; // for search page
  }
) => {
  const where: RootQueryToProductUnionConnectionWhereArgs = {
    status: "publish",
  };

  if (forPage === "collections") {
    if (!options?.slug) return where;
    where.category = options.slug?.[options.slug?.length - 1];
  } else if (forPage === "sale") {
    where.onSale = true;
  } else if (forPage === "featured") {
    where.featured = true;
  } else if (forPage === "search") {
    where.search = options?.searchString || "";
  } else if (forPage === "new-products") {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    where.dateQuery = {
      after: {
        month: lastMonth.getMonth(),
        year: lastMonth.getFullYear(),
        day: lastMonth.getDate(),
      },
    };
  }

  return where;
};
import {
  OrderEnum,
  TermObjectsConnectionOrderbyEnum,
  RootQueryToBrandConnectionWhereArgs,
} from "@/lib/headkit/generated";

export const SortKey = {
  NAME_ASC: "NAME_ASC",
  NAME_DESC: "NAME_DESC",
} as const;

export type SortKeyType = keyof typeof SortKey;

export const SortKeyLabels: Record<SortKeyType, string> = {
  NAME_ASC: "Alphabetically, A-Z",
  NAME_DESC: "Alphabetically, Z-A",
};

interface FilterQuery {
  sort?: SortKeyType | "";
}

interface QueryParams {
  filterQuery: FilterQuery;
}

export function makeWhereBrandQuery({
  filterQuery,
}: QueryParams): RootQueryToBrandConnectionWhereArgs {
  const where: RootQueryToBrandConnectionWhereArgs = {};

  // Handle sorting
  if (filterQuery.sort) {
    switch (filterQuery.sort) {
      case "NAME_ASC":
        where.orderby = TermObjectsConnectionOrderbyEnum.Name;
        break;
      case "NAME_DESC":
        where.orderby = TermObjectsConnectionOrderbyEnum.Name;
        where.order = OrderEnum.Desc;
        break;
    }
  }

  return where;
}

interface BrandCategoryData {
  brandCategory?: {
    name?: string;
    slug?: string;
    children?: {
      nodes?: Array<{
        name?: string;
        slug?: string;
        count?: number;
      }>;
    };
  };
}

export function makeBreadcrumbFromBrandCategoryData(data: BrandCategoryData) {
  const breadcrumb = [
    { name: "Home", href: "/" },
    { name: "Brands", href: "/brand" },
  ];

  if (data?.brandCategory) {
    breadcrumb.push({
      name: data.brandCategory.name || "",
      href: `/brand/${data.brandCategory.slug}`,
    });
  }

  return breadcrumb;
}

export function makeSubcategorySwiperFromBrandCategoryData(
  data: BrandCategoryData
) {
  return (
    data?.brandCategory?.children?.nodes?.map((category) => ({
      name: category?.name || "",
      slug: category?.slug || "",
      count: category?.count || 0,
    })) || []
  );
}

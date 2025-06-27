import {
  OrderEnum,
  PostObjectsConnectionOrderbyEnum,
  RootQueryToPostConnectionWhereArgs,
} from "@/lib/headkit/generated";

export const SortKey = {
  DATE_DESC: "DATE_DESC",
  DATE_ASC: "DATE_ASC",
} as const;

export type SortKeyType = keyof typeof SortKey;

export const SortKeyLabels: Record<SortKeyType, string> = {
  DATE_DESC: "Most Recent",
  DATE_ASC: "Oldest First",
};

interface FilterQuery {
  categories?: string[];
  sort?: SortKeyType | "";
}

interface QueryParams {
  filterQuery: FilterQuery;
}

export function makeWherePostQuery({
  filterQuery,
}: QueryParams): RootQueryToPostConnectionWhereArgs {
  const where: RootQueryToPostConnectionWhereArgs = {};

  // Handle category filter
  if (filterQuery.categories?.length) {
    where.categoryIn = filterQuery.categories;
  }

  // Handle sorting
  if (filterQuery.sort) {
    switch (filterQuery.sort) {
      case "DATE_ASC":
        where.orderby = [{ field: PostObjectsConnectionOrderbyEnum.Date, order: OrderEnum.Asc }];
        break;
      case "DATE_DESC":
        where.orderby = [{ field: PostObjectsConnectionOrderbyEnum.Date, order: OrderEnum.Desc }];
        break;
    }
  }

  return where;
}

interface PostCategoryData {
  postCategory?: {
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

export function makeBreadcrumbFromPostCategoryData(data: PostCategoryData) {
  const breadcrumb = [
    { name: "Home", href: "/" },
    { name: "News & Tips", href: "/news" },
  ];

  if (data?.postCategory) {
    breadcrumb.push({
      name: data.postCategory.name || "",
      href: `/news/${data.postCategory.slug}`,
    });
  }

  return breadcrumb;
}

export function makeSubcategorySwiperFromPostCategoryData(
  data: PostCategoryData
) {
  return (
    data?.postCategory?.children?.nodes?.map((category) => ({
      name: category?.name || "",
      slug: category?.slug || "",
      count: category?.count || 0,
    })) || []
  );
} 
import {
  GetProductCategoryQuery,
  OrderEnum,
  ProductsOrderByEnum,
  ProductsOrderbyInput,
  ProductTaxonomyEnum,
  ProductTaxonomyFilterInput,
  RelationEnum,
  RootQueryToProductUnionConnectionWhereArgs,
  StockStatusEnum,
} from "@/lib/headkit/generated";

const PER_PAGE = 24;

enum SortKey {
  NEWEST = "Newest",
  PRICE_HIGH_TO_LOW = "Price: High - Low",
  PRICE_LOW_TO_HIGH = "Price: Low - High",
  PRODUCT_NAME_A_TO_Z = "Product Name: A - Z",
  PRODUCT_NAME_Z_TO_A = "Product Name: Z - A",
}

const makeBreadcrumbFromProductCategoryData = (
  data: GetProductCategoryQuery
): {
  name: string;
  uri: string;
  current: boolean;
}[] => {
  if (!data?.productCategory) return [];

  const { ancestors } = data.productCategory;
  const breadcrumb: {
    name: string;
    uri: string;
    current: boolean;
  }[] = [];

  // Create a map of databaseId to ancestor nodes for quick access
  const ancestorMap: Record<
    string,
    GetProductCategoryQuery["productCategory"]
  > = {};
  ancestors?.nodes.forEach((node) => {
    ancestorMap[node.databaseId] = node;
  });

  // Start with the current category and trace back through parentDatabaseId
  let currentAncestor =
    data.productCategory as GetProductCategoryQuery["productCategory"];
  while (currentAncestor) {
    breadcrumb.unshift({
      name: currentAncestor.name || "",
      uri: currentAncestor.uri || "",
      current: currentAncestor === data.productCategory,
    });
    // Move to the parent category using parentDatabaseId
    currentAncestor = ancestorMap[currentAncestor.parentDatabaseId!];
  }

  // Add Shop
  breadcrumb.unshift({
    name: "Shop",
    uri: "/shop",
    current: false,
  });

  // Add Home
  breadcrumb.unshift({
    name: "Home",
    uri: "/",
    current: false,
  });

  return breadcrumb;
};

const makeSubcategorySwiperFromProductCategoryData = (
  data: GetProductCategoryQuery
): {
  slug: string;
  name: string;
  uri: string;
  thumbnail: string | null;
}[] => {
  if (!data?.productCategory) return [];
  const { children } = data.productCategory;
  if (!children || !children.nodes.length) {
    return []; // No subcategories found, return an empty array
  }

  return children.nodes.map((subcategory) => ({
    slug: subcategory.slug || "",
    name: subcategory.name || "",
    uri: subcategory.uri || "",
    thumbnail: subcategory.thumbnail || null,
  }));
};

const makeSort = (sortKey: SortKey): ProductsOrderbyInput => {
  switch (sortKey) {
    case "NEWEST" as SortKey:
      return { field: ProductsOrderByEnum.Date, order: OrderEnum.Desc };
    case "PRICE_HIGH_TO_LOW" as SortKey:
      return { field: ProductsOrderByEnum.Price, order: OrderEnum.Desc };
    case "PRICE_LOW_TO_HIGH" as SortKey:
      return { field: ProductsOrderByEnum.Price, order: OrderEnum.Asc };
    case "PRODUCT_NAME_Z_TO_A" as SortKey:
      return { field: ProductsOrderByEnum.Name, order: OrderEnum.Desc };
    case "PRODUCT_NAME_A_TO_Z" as SortKey:
      return { field: ProductsOrderByEnum.Name, order: OrderEnum.Asc };
    default:
      return { field: ProductsOrderByEnum.Date, order: OrderEnum.Desc };
  }
};

const makeTaxonomyFilter = (slug: string, terms: string[]) => {
  let taxonomy: ProductTaxonomyEnum;
  switch (slug) {
    case "categories":
      taxonomy = ProductTaxonomyEnum.ProductCat;
      break;
    case "pa_colour":
      taxonomy = ProductTaxonomyEnum.PaColour;
      break;
    case "pa_size":
      taxonomy = ProductTaxonomyEnum.PaSize;
      break;
    case "brands":
      taxonomy = ProductTaxonomyEnum.ProductBrand;
      break;
    default:
      throw new Error(`unknow taxonomy: ${slug}`);
  }

  return {
    taxonomy,
    terms,
  };
};

const makeWhereProductQuery = ({
  filterQuery,
  categorySlug,
  page,
  perPage,
  onSale,
  search,
}: {
  filterQuery?: {
    [x: string]: string | string[];
  };
  categorySlug?: string;
  page?: number;
  perPage?: number;
  onSale?: boolean;
  search?: string;
}): RootQueryToProductUnionConnectionWhereArgs => {
  const taxonomyFilter: ProductTaxonomyFilterInput[] = [];
  const sort = makeSort(filterQuery?.sort as SortKey);
  const instock: boolean = JSON.parse(
    (filterQuery?.instock as string) || "false"
  );

  if (filterQuery) {
    Object.entries(filterQuery).forEach(([key, value]) => {
      const terms = value as string[];
      if (
        terms.length &&
        key !== "sort" &&
        key !== "page" &&
        key !== "instock"
      ) {
        try {
          taxonomyFilter.push(makeTaxonomyFilter(key, terms));
        } catch (error) {
          console.log(error);
        }
      }
    });
  }

  const notAllowedSlugs = ["shop", "sale"];

  return {
    status: "publish",
    perPage: perPage || PER_PAGE,
    offset: page ? page * (perPage || PER_PAGE) : 0,
    onSale,
    orderby: [sort],
    ...(instock && { stockStatus: [StockStatusEnum.InStock] }),
    ...(!onSale &&
      !search &&
      !notAllowedSlugs.includes(categorySlug || "") && {
        category: categorySlug || "",
      }),
    ...(search && { search }),
    taxonomyFilter: {
      relation: RelationEnum.And,
      filters: taxonomyFilter,
    },
  };
};

export {
  PER_PAGE,
  SortKey,
  makeBreadcrumbFromProductCategoryData,
  makeSubcategorySwiperFromProductCategoryData,
  makeWhereProductQuery,
};

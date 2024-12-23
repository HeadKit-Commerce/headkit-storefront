import {
  GetProductCategoryQuery,
  OrderEnum,
  ProductsOrderByEnum,
  ProductTaxonomyEnum,
  ProductTaxonomyFilterInput,
  RelationEnum,
  RootQueryToProductUnionConnectionWhereArgs,
  StockStatusEnum,
  TaxonomyOperatorEnum,
} from "@/lib/headkit/generated";

const PER_PAGE = 24;

export const SortKey = {
  FEATURED: "FEATURED",
  BEST_SELLING: "BEST_SELLING",
  CREATED_AT: "CREATED_AT",
  CREATED_AT_DESC: "CREATED_AT_DESC",
  PRICE: "PRICE",
  PRICE_DESC: "PRICE_DESC",
  TITLE: "TITLE",
  TITLE_DESC: "TITLE_DESC",
} as const;

export type SortKeyType = keyof typeof SortKey;

interface FilterQuery {
  categories?: string[];
  brands?: string[];
  attributes?: Record<string, string[]>;
  instock?: boolean;
  sort?: SortKeyType;
  page?: number;
}

interface QueryParams {
  filterQuery: FilterQuery;
  categorySlug?: string;
  page?: number;
  perPage?: number;
  onSale?: boolean;
  search?: string;
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

export const makeWhereProductQuery = ({
  filterQuery,
  categorySlug,
  page = 0,
  perPage = 24,
  onSale,
  search,
}: QueryParams): RootQueryToProductUnionConnectionWhereArgs => {
  const where: RootQueryToProductUnionConnectionWhereArgs = {
    offset: page * perPage,
    perPage,
  };

  // Handle category filter
  if (categorySlug) {
    where.category = categorySlug;
  }
  if (filterQuery.categories?.length) {
    where.categoryIn = filterQuery.categories;
  }

  // Handle brand filter
  if (filterQuery.brands?.length) {
    where.taxonomyFilter = {
      relation: RelationEnum.And,
      filters: [{
        taxonomy: ProductTaxonomyEnum.Brand,
        terms: filterQuery.brands,
        operator: TaxonomyOperatorEnum.In,
      }],
    };
  }

  // Handle attribute filters
  if (filterQuery.attributes && Object.keys(filterQuery.attributes).length > 0) {
    const attributeFilters: ProductTaxonomyFilterInput[] = Object.entries(filterQuery.attributes)
      .filter(([, values]) => values.length > 0)
      .map(([key, values]) => ({
        taxonomy: key as ProductTaxonomyEnum,
        terms: values,
        operator: TaxonomyOperatorEnum.In,
      }));

    where.taxonomyFilter = {
      relation: RelationEnum.And,
      filters: filterQuery.brands?.length 
        ? [...(where.taxonomyFilter?.filters || []), ...attributeFilters]
        : attributeFilters,
    };
  }

  // Handle stock status
  if (filterQuery.instock) {
    where.stockStatus = [StockStatusEnum.InStock];
  }

  // Handle sorting
  if (filterQuery.sort) {
    where.orderby = [];
    switch (filterQuery.sort) {
      case "FEATURED":
        where.orderby.push({ field: ProductsOrderByEnum.MenuOrder, order: OrderEnum.Asc });
        break;
      case "BEST_SELLING":
        where.orderby.push({ field: ProductsOrderByEnum.Rating, order: OrderEnum.Desc });
        break;
      case "CREATED_AT":
        where.orderby.push({ field: ProductsOrderByEnum.Date, order: OrderEnum.Desc });
        break;
      case "CREATED_AT_DESC":
        where.orderby.push({ field: ProductsOrderByEnum.Date, order: OrderEnum.Asc });
        break;
      case "PRICE":
        where.orderby.push({ field: ProductsOrderByEnum.Price, order: OrderEnum.Asc });
        break;
      case "PRICE_DESC":
        where.orderby.push({ field: ProductsOrderByEnum.Price, order: OrderEnum.Desc });
        break;
      case "TITLE":
        where.orderby.push({ field: ProductsOrderByEnum.Name, order: OrderEnum.Asc });
        break;
      case "TITLE_DESC":
        where.orderby.push({ field: ProductsOrderByEnum.Name, order: OrderEnum.Desc });
        break;
    }
  }

  // Handle sale status
  if (onSale) {
    where.onSale = true;
  }

  // Handle search
  if (search) {
    where.search = search;
  }

  return where;
};

export {
  PER_PAGE,
  SortKey,
  makeBreadcrumbFromProductCategoryData,
  makeSubcategorySwiperFromProductCategoryData,
  makeWhereProductQuery,
};

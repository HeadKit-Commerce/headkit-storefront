import { CollectionPage } from "@/components/collection/collection-page";
import { getProductFilters, getProductList } from "@/lib/headkit/actions";
import { makeWhereProductQuery } from "@/components/collection/utils";
import { CollectionHeader } from "@/components/collection/collection-header";
import { SortKeyType } from "@/components/collection/utils";

interface Props {
  searchParams: Promise<{ [key: string]: string }>;
}

export default async function Page({ searchParams }: Props) {
  const parsedSearchParams = await searchParams;
  const pageNumber = parsedSearchParams?.page
    ? parseInt(parsedSearchParams.page)
    : 0;
  const itemsPerPage = 24;
  const searchQuery = parsedSearchParams.q || "";

  // Create filter state from search params
  const filterState = {
    categories: parsedSearchParams.categories?.split(",").filter(Boolean) || [],
    brands: parsedSearchParams.brands?.split(",").filter(Boolean) || [],
    attributes: {} as Record<string, string[]>,
    instock: parsedSearchParams.instock === "true",
    sort: (parsedSearchParams.sort || "") as SortKeyType | "",
    page: pageNumber,
  };

  // Fetch products and filters in parallel
  const [{ data: initialProducts }, { data: productFilter }] =
    await Promise.all([
      getProductList({
        input: {
          where: makeWhereProductQuery({
            filterQuery: filterState,
            page: pageNumber,
            perPage: itemsPerPage,
            search: searchQuery,
          }),
          first: itemsPerPage,
        },
      }),
      getProductFilters({ input: {} }),
    ]);

  // Parse attribute filters after getting the product filter data
  productFilter?.productFilters?.attributes?.forEach((attr) => {
    if (attr?.slug) {
      const values =
        parsedSearchParams[attr.slug]?.split(",").filter(Boolean) || [];
      if (values.length) {
        filterState.attributes[attr.slug] = values;
      }
    }
  });

  const totalProducts = initialProducts.products?.found || 0;
  const searchTitle = searchQuery
    ? `Search results for "${searchQuery}"`
    : "Search products";
  const searchDescription = searchQuery
    ? `Found ${totalProducts} product${
        totalProducts === 1 ? "" : "s"
      } for "${searchQuery}"`
    : "Search for products in our store";

  return (
    <>
      <CollectionHeader
        name={searchTitle}
        description={searchDescription}
        breadcrumbData={[
          {
            name: "Home",
            uri: "/",
            current: false,
          },
          {
            name: "Search",
            uri: "/search",
            current: true,
          },
        ]}
      />
      <CollectionPage
        initialProducts={initialProducts}
        productFilter={productFilter}
        initialPage={pageNumber}
        itemsPerPage={itemsPerPage}
        search={searchQuery}
      />
    </>
  );
}

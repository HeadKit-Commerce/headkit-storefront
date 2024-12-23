import { ProductListWithFilter } from "@/components/collection/product-list-with-filter";
import { getProductFilters, getProductList } from "@/lib/headkit/actions";
import { makeWhereProductQuery, PER_PAGE } from "@/components/collection/utils";
import { CollectionHeader } from "@/components/collection/collection-header";

interface Props {
  searchParams: Promise<{ [key: string]: string }>;
}

export default async function Page({ searchParams }: Props) {
  const parsedSearchParams = await searchParams;
  // Convert from 1-based URL parameter to 0-based index for internal use
  const pageNumber = parsedSearchParams?.page ? parseInt(parsedSearchParams.page) - 1 : 0;

  // Create filter state from search params
  const filterState: { [key: string]: string | string[] } = {};
  Object.entries(parsedSearchParams).forEach(([key, value]) => {
    if (key !== "page") {
      filterState[key] = value.includes(",") ? value.split(",") : value;
    }
  });

  // Fetch products and filters in parallel
  const [{ data: initialProducts }, { data: productFilter }] = await Promise.all([
    getProductList({
      input: {
        where: makeWhereProductQuery({
          filterQuery: filterState,
          page: pageNumber, // Use zero-based index for API
          perPage: PER_PAGE,
        }),
        first: PER_PAGE,
      }
    }),
    getProductFilters()
  ]);

  return (
    <>
      <CollectionHeader
        name="Shop"
        description=""
        breadcrumbData={[
          {
            name: "Home",
            uri: "/",
            current: false,
          },
          {
            name: "Shop",
            uri: "/shop",
            current: true,
          },
        ]}
      />
      <ProductListWithFilter
        initialProducts={initialProducts}
        initialFilterState={filterState}
        initialPage={pageNumber} // Pass zero-based index
        productFilter={productFilter}
      />
    </>
  );
} 
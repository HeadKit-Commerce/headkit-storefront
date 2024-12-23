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
  const pageNumber = parsedSearchParams?.page ? parseInt(parsedSearchParams.page) : 0;
  const itemsPerPage = 24;

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
  const [{ data: initialProducts }, { data: productFilter }] = await Promise.all([
    getProductList({
      input: {
        where: makeWhereProductQuery({
          filterQuery: filterState,
          page: pageNumber,
          perPage: itemsPerPage,
          newIn: true,
        }),
        first: itemsPerPage,
      }
    }),
    getProductFilters()
  ]);

  // Parse attribute filters after getting the product filter data
  productFilter?.productFilters?.attributes?.forEach((attr) => {
    if (attr?.slug) {
      const values = parsedSearchParams[attr.slug]?.split(",").filter(Boolean) || [];
      if (values.length) {
        filterState.attributes[attr.slug] = values;
      }
    }
  });

  return (
    <>
      <CollectionHeader
        name="New Arrivals"
        description="Discover our latest products from the last 30 days"
        breadcrumbData={[
          {
            name: "Home",
            uri: "/",
            current: false,
          },
          {
            name: "New Arrivals",
            uri: "/new",
            current: true,
          },
        ]}
      />
      <CollectionPage
        initialProducts={initialProducts}
        productFilter={productFilter}
        initialPage={pageNumber}
        itemsPerPage={itemsPerPage}
      />
    </>
  );
}
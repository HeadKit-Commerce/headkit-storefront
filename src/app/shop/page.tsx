import { CollectionPage } from "@/components/collection/collection-page";
import { getProductFilters, getProductList } from "@/lib/headkit/actions";
import { makeWhereProductQuery } from "@/components/collection/utils";
import { CollectionHeader } from "@/components/collection/collection-header";
import { SortKeyType } from "@/components/collection/utils";

// Remove dynamic export - shop page can be statically generated with client-side interactions
// The CollectionPage component handles dynamic filtering on the client side

interface Props {
  searchParams: Promise<{ [key: string]: string }>;
}

export default async function Page({ searchParams }: Props) {
  const parsedSearchParams = await searchParams;
  const pageNumber = parsedSearchParams?.page
    ? parseInt(parsedSearchParams.page)
    : 0;
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
  const [{ data: initialProducts }, { data: productFilter }] =
    await Promise.all([
      getProductList({
        input: {
          where: makeWhereProductQuery({
            filterQuery: filterState,
            page: pageNumber,
            perPage: itemsPerPage,
          }),
          first: itemsPerPage,
        },
      }),
      getProductFilters(),
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
      <CollectionPage
        initialProducts={initialProducts}
        productFilter={productFilter}
        initialPage={pageNumber}
        itemsPerPage={itemsPerPage}
      />
    </>
  );
}

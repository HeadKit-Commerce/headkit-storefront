import { CollectionPage } from "@/components/collection/collection-page";
import { getPage, getProductFilters, getProductList } from "@/lib/headkit/actions";

import { makeWhereProductQuery } from "@/lib/headkit/utils/make-where";
import { CollectionHeader } from "@/components/collection/collection-header";
import { SortKeyType } from "@/components/collection/utils";
import { makeSEOMetadata } from "@/lib/headkit/utils/make-metadata";
import { PageIdType } from "@/lib/headkit/generated";

export async function generateMetadata() {
  const { data } = await getPage({ id: "/featured", type: PageIdType.Uri });
  const seo = data?.page?.seo;
  return await makeSEOMetadata(seo, {
    fallback: {
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/featured`,
      },
    },
  });
}

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
        where: makeWhereProductQuery("featured"),
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
        name="Featured Products"
        description="Discover our handpicked selection of featured products"
        breadcrumbData={[
          {
            name: "Home",
            uri: "/",
            current: false,
          },
          {
            name: "Featured Products",
            uri: "/featured",
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
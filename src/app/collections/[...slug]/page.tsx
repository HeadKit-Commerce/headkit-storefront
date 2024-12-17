import { makeWhereProductQuery, PER_PAGE } from "@/components/collection/utils";

import { makeSubcategorySwiperFromProductCategoryData } from "@/components/collection/utils";

import { CollectionHeader } from "@/components/collection/collection-header";
import { makeBreadcrumbFromProductCategoryData } from "@/components/collection/utils";
import { getProductCategory, getProductFilters, getProductList } from "@/lib/headkit/actions";
import { notFound } from "next/navigation";
import { ProductListWithFilter } from "@/components/collection/product-list-with-filter";

interface Props {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  const categorySlug = slug.pop();
  const parsedSearchParams = await searchParams;
  const pageNumber = Number(parsedSearchParams?.page) || 0;
  delete parsedSearchParams?.page;
  const filterQuery = Object.keys(parsedSearchParams).length === 0
    ? undefined
    : Object.fromEntries(
      Object.entries(parsedSearchParams).filter(([, value]) => value !== undefined)
    ) as { [key: string]: string | string[] };

  if (!categorySlug) return notFound();

  const [productCategory, productFilter, initialProducts] = await Promise.all([
    getProductCategory({ slug: categorySlug }),
    getProductFilters({ mainCategory: categorySlug }),
    getProductList({
      input: {
        where: makeWhereProductQuery({
          filterQuery,
          categorySlug,
          page: pageNumber,
          perPage: PER_PAGE,
        }),
      },
    }),
  ]);

  if (!productCategory?.data?.productCategory) return notFound();

  return (
    <>
      <CollectionHeader
        name={productCategory.data.productCategory?.name || ""}
        description={productCategory.data.productCategory?.description || ""}
        breadcrumbData={makeBreadcrumbFromProductCategoryData(productCategory.data)}
        categories={makeSubcategorySwiperFromProductCategoryData(
          productCategory.data
        )}
      />
      <ProductListWithFilter
        initialProducts={initialProducts.data}
        initialFilterState={filterQuery || {}}
        initialPage={pageNumber}
        productFilter={productFilter.data}
      />
    </>
  );
}
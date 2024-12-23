import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductCategory, getProductFilters, getProductList } from "@/lib/headkit/actions";
import { CollectionPage } from "@/components/collection/collection-page";
import { makeWhereProductQuery, SortKeyType, makeBreadcrumbFromProductCategoryData, makeSubcategorySwiperFromProductCategoryData } from "@/components/collection/utils";
import { CollectionHeader } from "@/components/collection/collection-header";

interface CollectionPageProps {
  params: Promise<{
    slug: string[];
  }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
    categories?: string;
    brands?: string;
    instock?: string;
    [key: string]: string | undefined;
  }>;
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categorySlug = slug.pop();

  if (!categorySlug) return notFound();

  const { data } = await getProductCategory({ slug: categorySlug });
  if (!data?.productCategory) return notFound();

  return {
    title: data.productCategory.name || "Collection",
    description: data.productCategory.description || `Browse our ${categorySlug} collection`,
  };
}

export default async function Page({ params, searchParams }: CollectionPageProps) {
  const { slug } = await params;
  const categorySlug = slug.pop();
  const parsedSearchParams = await searchParams;
  const page = parsedSearchParams.page ? parseInt(parsedSearchParams.page) : 0;
  const itemsPerPage = 3;

  if (!categorySlug) return notFound();

  try {
    // Parse attributes from search params
    const attributes: Record<string, string[]> = {};
    Object.entries(parsedSearchParams).forEach(([key, value]) => {
      if (key !== 'page' && key !== 'sort' && key !== 'categories' && key !== 'brands' && key !== 'instock') {
        attributes[key] = value?.split(',') || [];
      }
    });

    // Create filter query object
    const filterQuery = {
      categories: parsedSearchParams.categories?.split(",") || [],
      brands: parsedSearchParams.brands?.split(",") || [],
      attributes,
      instock: parsedSearchParams.instock === "true",
      sort: parsedSearchParams.sort as SortKeyType | undefined,
      page,
    };

    const [productCategory, productFilter, productsData] = await Promise.all([
      getProductCategory({ slug: categorySlug }),
      getProductFilters({ mainCategory: categorySlug }),
      getProductList({
        input: {
          where: makeWhereProductQuery({
            filterQuery,
            categorySlug,
            page,
            perPage: itemsPerPage,
          }),
          first: itemsPerPage,
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
        <CollectionPage
          initialProducts={productsData.data}
          productFilter={productFilter.data}
          initialPage={page}
          itemsPerPage={itemsPerPage}
        />
      </>
    );
  } catch (error) {
    console.error("Error fetching collection data:", error);
    return notFound();
  }
} 
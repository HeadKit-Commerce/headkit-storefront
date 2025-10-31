import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionPage } from "@/components/collection/collection-page";
import {
  makeWhereProductQuery,
  SortKeyType,
  makeBreadcrumbFromProductCategoryData,
  makeSubcategorySwiperFromProductCategoryData,
} from "@/components/collection/utils";
import { CollectionHeader } from "@/components/collection/collection-header";
import { makeSEOMetadata } from "@/lib/headkit/utils/make-metadata";
import { getProductCategory, getProductList, getProductFilters } from "@/lib/headkit/queries";
import { ProductCategoryIdType } from "@/lib/headkit/generated";

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
  const categorySlug = slug[slug.length - 1];

  if (!categorySlug) return notFound();

  const { data } = await getProductCategory({ slug: categorySlug });
  if (!data?.productCategory) return notFound();

  return makeSEOMetadata(data.productCategory.seo, {
    override: {
      openGraph: {
        url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/collections/${slug.join(
          "/"
        )}`,
        images: [
          {
            url:
              data.productCategory.seo?.opengraphImage?.sourceUrl ||
              data.productCategory.thumbnail ||
              "",
          },
        ],
      },
      twitter: {
        images: [
          {
            url:
              data.productCategory.seo?.opengraphImage?.sourceUrl ||
              data.productCategory.thumbnail ||
              "",
          },
        ],
      },
    },
    fallback: {
      title: data.productCategory.name,
      description: data.productCategory.description,
      alternates: {
        canonical: `${
          process.env.NEXT_PUBLIC_FRONTEND_URL
        }/collections/${slug.join("/")}`,
      },
    },
  });
}

export default async function Page({
  params,
  searchParams,
}: CollectionPageProps) {
  const { slug } = await params;
  const categorySlug = slug[slug.length - 1];
  const parsedSearchParams = await searchParams;
  const page = parsedSearchParams.page ? parseInt(parsedSearchParams.page) : 0;
  const itemsPerPage = 24;

  if (!categorySlug) return notFound();

  try {
    // Parse attributes from search params
    const attributes: Record<string, string[]> = {};
    Object.entries(parsedSearchParams).forEach(([key, value]) => {
      if (
        key !== "page" &&
        key !== "sort" &&
        key !== "categories" &&
        key !== "brands" &&
        key !== "instock"
      ) {
        attributes[key] = value?.split(",") || [];
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
          where: makeWhereProductQuery({
            filterQuery,
            categorySlug,
            page,
            perPage: itemsPerPage,
          }),
          first: itemsPerPage,
      }),
    ]);

    if (!productCategory?.data?.productCategory) return notFound();

    return (
      <>
        <CollectionHeader
          name={productCategory.data.productCategory?.name || ""}
          description={productCategory.data.productCategory?.description || ""}
          breadcrumbData={makeBreadcrumbFromProductCategoryData(
            productCategory.data
          )}
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

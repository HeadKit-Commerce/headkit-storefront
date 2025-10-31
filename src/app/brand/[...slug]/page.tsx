import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionPage } from "@/components/collection/collection-page";
import {
  makeWhereProductQuery,
  SortKeyType,
} from "@/components/collection/utils";
import { CollectionHeader } from "@/components/collection/collection-header";
import { getBrand, getProductFilters, getProductList } from "@/lib/headkit/queries";

interface BrandPageProps {
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
}: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brandSlug = slug[slug.length - 1];

  if (!brandSlug) return notFound();

  const { data } = await getBrand({ slug: brandSlug });
  if (!data?.brand) return notFound();

  return {
    title: data.brand.name || "Brand",
    description: data.brand.description || `Browse our ${brandSlug} products`,
  };
}

export default async function Page({ params, searchParams }: BrandPageProps) {
  const { slug } = await params;
  const brandSlug = slug[slug.length - 1];
  const parsedSearchParams = await searchParams;
  const page = parsedSearchParams.page ? parseInt(parsedSearchParams.page) : 0;
  const itemsPerPage = 24;

  if (!brandSlug) return notFound();

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
      brands: [brandSlug, ...(parsedSearchParams.brands?.split(",") || [])],
      attributes,
      instock: parsedSearchParams.instock === "true",
      sort: parsedSearchParams.sort as SortKeyType | undefined,
      page,
    };

    const [brand, productFilter, productsData] = await Promise.all([
      getBrand({ slug: brandSlug }),
      getProductFilters({
        brands: [brandSlug],
      }),
      getProductList({
        where: makeWhereProductQuery({
          filterQuery,
          page,
          perPage: itemsPerPage,
        }),
        first: itemsPerPage,
      }),
    ]);

    if (!brand?.data?.brand) return notFound();

    return (
      <>
        <CollectionHeader
          name={brand.data.brand?.name || ""}
          description={brand.data.brand?.description || ""}
          breadcrumbData={[
            {
              name: "Home",
              uri: "/",
              current: false,
            },
            {
              name: "Brand",
              uri: "/brand",
              current: false,
            },
            {
              name: brand.data.brand?.name || "",
              uri: `/brand/${brandSlug}`,
              current: true,
            },
          ]}
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
    console.error("Error fetching brand products data:", error);
    return notFound();
  }
}

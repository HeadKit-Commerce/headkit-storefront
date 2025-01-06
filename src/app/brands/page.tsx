import { Metadata } from "next";
import { getBrandList } from "@/lib/headkit/actions";
import { BrandPage } from "@/components/brand/brand-page";
import { makeWhereBrandQuery, SortKeyType } from "@/components/brand/utils";
import { BrandHeader } from "@/components/brand/brand-header";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    sort?: string;
    [key: string]: string | undefined;
  }>;
}

export const metadata: Metadata = {
  title: "Brands",
  description: "Browse our collection of brands",
};

export default async function Page({ searchParams }: PageProps) {
  try {
    const parsedSearchParams = await searchParams;
    const page = parsedSearchParams.page ? parseInt(parsedSearchParams.page) : 0;
    const perPage = 24;

    const filterQuery = {
      sort: parsedSearchParams.sort as SortKeyType | undefined,
    };

    const brandsData = await getBrandList({
      input: {
        first: perPage,
        where: makeWhereBrandQuery({
          filterQuery,
        }),
      },
    });

    return (
      <>
        <BrandHeader
          name="Brands"
          breadcrumbData={[
            {
              name: "Home",
              uri: "/",
              current: false,
            },
            {
              name: "Brands",
              uri: "/brands",
              current: true,
            },
          ]}
        />
        <BrandPage
          initialBrands={brandsData.data}
          initialPage={page}
        />
      </>
    );
  } catch (error) {
    console.error("Error fetching brands data:", error);
    throw error;
  }
} 
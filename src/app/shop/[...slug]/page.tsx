import {
  ProductIdTypeEnum,
  PostTypeSeoContentFragment,
  ProductContentFullWithGroupFragment,
  SimpleProduct,
  VariableProduct,
  GroupProduct,
  ExternalProduct,
} from "@/lib/headkit/generated";

import { Metadata, ResolvedMetadata, ResolvingMetadata } from "next";

import { notFound } from "next/navigation";
import { makeSEOMetadata } from "@/lib/headkit/utils/make-metadata";
import { ProductJsonLD } from "@/components/seo/product-json-ld";
import { BreadcrumbJsonLD } from "@/components/seo/breadcrumb-json-ld";
import { ProductDetail } from "@/components/product/product-detail";
import { ProductCarousel } from "@/components/carousel/product-carousel";
import { SectionHeader } from "@/components/common/section-header";
import { getProduct, getGeneralSettings, getProducts } from "@/lib/headkit/actions";

type Props = {
  params: Promise<{ slug: string[] }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata | ResolvedMetadata> {
  try {
    const { slug } = await params;
    const product = await getProduct({
      id: slug[slug.length - 1],
      type: ProductIdTypeEnum.Slug,
    });
    const seo: PostTypeSeoContentFragment | null | undefined =
      product?.data?.product?.seo;

    if (!seo) {
      const getParent = await parent;
      return {
        title: getParent?.title,
        description: getParent?.description,
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    return await makeSEOMetadata(seo, {
      fallback: {
        title: product?.data?.product?.name,
        description: product?.data?.product?.shortDescription,
      },
    });
  } catch (error) {
    console.error("generateMetadata: error", error);
    const getParent = await parent;
    return {
      title: getParent?.title,
      description: getParent?.description,
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

// cannot use searchParams because it will be statically generated
export default async function Product({ params }: Props) {
  const { slug } = await params;
  const [product, generalSettings] = await Promise.all([
    getProduct({
      id: slug[slug.length - 1],
      type: ProductIdTypeEnum.Slug,
    }),
    getGeneralSettings(),
  ]);

  if (!product?.data.product) {
    notFound();
  }

  return (
    <div>
      <div className="px-[20px] sm:px-[40px]">
        <ProductJsonLD
          product={product.data}
          currency={generalSettings?.data.generalSettings?.currency}
        />
        <BreadcrumbJsonLD seo={product?.data?.product?.seo} />
        <ProductDetail product={product?.data.product} />
      </div>

      {(product?.data.product.upsell?.nodes?.length ?? 0) > 0 && (
        <div className="overflow-hidden px-5 md:px-10 py-[30px] lg:pt-[60px] lg:pb-[30px]">
          <SectionHeader
            title="You might also like…"
            description=""
            allButton="View All"
            allButtonPath="/shop"
          />
          <div className="mt-5 lg:mt-[30px]">
            <ProductCarousel
              products={
                (product?.data.product.upsell?.nodes || []) as ProductContentFullWithGroupFragment[]
              }
            />
          </div>
        </div>
      )}

      {(product?.data.product.related?.nodes?.length ?? 0) > 0 && (
        <div className="overflow-hidden px-5 md:px-10 py-[30px] lg:pt-[60px] lg:pb-[30px]">
          <SectionHeader
            title="Something similar"
            description=""
            allButton="View All"
            allButtonPath="/shop"
          />
          <div className="mt-5 lg:mt-[30px]">
            <ProductCarousel
              products={
                (product?.data.product.related?.nodes || []) as ProductContentFullWithGroupFragment[]
              }
              carouselItemClassName="basis-10/12 sm:basis-1/3 lg:basis-1/4 pl-[30px]"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export async function generateStaticParams() {
  // Use the action instead of direct client call
  const products = await getProducts({
    first: 1000, // Get a large number of products to ensure we get all slugs
  });

  return products?.data.products?.nodes?.map(
    (item) => {
      return {
        slug:
          (item as SimpleProduct | VariableProduct | GroupProduct | ExternalProduct | null | undefined)
            ?.uri?.split("/").filter((e) => e !== "" && e !== "shop") || [],
      };
    }
  ) || [];
}

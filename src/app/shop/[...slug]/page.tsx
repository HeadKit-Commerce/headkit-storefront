import {
  ProductIdTypeEnum,
  PostTypeSeoContentFragment,
} from "@/lib/headkit/generated";

import { Metadata, ResolvedMetadata, ResolvingMetadata } from "next";

import { notFound } from "next/navigation";
import { headkit } from "@/lib/headkit/client";
import { makeSEOMetadata } from "@/lib/headkit/utils/make-metadata";
import { ProductJsonLD } from "@/components/seo/product-json-ld";
import { BreadcrumbJsonLD } from "@/components/seo/breadcrumb-json-ld";
import { ProductDetail } from "@/components/product/product-detail";

type Props = {
  params: Promise<{ slug: string[] }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata | ResolvedMetadata> {
  try {
    const { slug } = await params;
    const product = await headkit().getProduct({
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

    return makeSEOMetadata(seo, {
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
    headkit().getProduct({
      id: slug[slug.length - 1],
      type: ProductIdTypeEnum.Slug,
    }),
    headkit().getGeneralSettings(),
  ]);

  if (!product?.data.product) {
    console.error("Product not found", product);
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
        <div className="mt-5">
          <ProductDetail product={product?.data.product} />
        </div>
      </div>
      {/* <Suspense fallback={<ProductRelateAndUpsellLoadingSkeleton />}>
        <ProductRelateAndUpsell currentProductSlug={product?.product?.slug} />
      </Suspense> */}
    </div>
  );
}

// export async function generateStaticParams() {
//   const slugs = await headkit().getProductSlugs();

//   return slugs?.data.products?.nodes?.map(
//     (item: SimpleProduct | VariableProduct) => {
//       return {
//         slug:
//           item?.uri?.split("/").filter((e) => e !== "" && e !== "shop") || [],
//       };
//     }
//   );
// }

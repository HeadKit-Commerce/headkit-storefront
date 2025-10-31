import { BlockEditor } from "@/components/block-editor/block-editor";
import { BrandCarousel } from "@/components/carousel/brand-carousel";
import { CategoryCarousel } from "@/components/carousel/category-carousel";
import { MainCarousel } from "@/components/carousel/main-carousel/main-carousel";
import { PostCarousel } from "@/components/carousel/post-carousel";
import { ProductCarousel } from "@/components/carousel/product-carousel";
import { SectionHeader } from "@/components/common/section-header";
import {
  CoreButton,
  CoreGroup,
  CoreHeading,
  CoreParagraph,
  PageIdType,
  ProductContentFullWithGroupFragment,
  WoocommerceHandpickedProducts,
  WoocommerceProductNew,
  WoocommerceProductOnSale,
  ProductTypesEnum,
  VariableProduct,
  ProductVariation,
  SimpleProduct,
} from "@/lib/headkit/generated";
import { processBlockEditor } from "@/lib/headkit/utils/process-block-editor";
import { makeWhereProductQuery } from "@/lib/headkit/utils/make-where";
import { makeSEOMetadata } from "@/lib/headkit/utils/make-metadata";
import { getPage, getSEOSettings, getBranding, getCarousel, getProductCategories, getBrands, getProducts, getPosts } from "@/lib/headkit/queries";

// Helper function to determine if a product is new (created within last 30 days)
function calculateIsNew(product: ProductContentFullWithGroupFragment): boolean {
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  if (product?.type === ProductTypesEnum.Variable) {
    const variableProduct = product as VariableProduct;
    return (
      variableProduct.variations?.nodes?.some(
        (variation: ProductVariation) => {
          const variationDate = new Date(variation?.date || "");
          return variationDate >= lastMonth;
        }
      ) || false
    );
  } else {
    const simpleProduct = product as SimpleProduct;
    const productDate = new Date(simpleProduct?.date || "");
    return productDate >= lastMonth;
  }
}

export async function generateMetadata() {
  const [{ data }, headkitSEOSettings, headkitBranding] = await Promise.all([
    getPage({ id: "/", type: PageIdType.Uri }),
    getSEOSettings(),
    getBranding(),
  ]);

  const seo = data?.page?.seo;
  return makeSEOMetadata(seo, {
    override: {
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_FRONTEND_URL}`,
      },
    },
    fallback: {
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_FRONTEND_URL}`,
      },
    },
    headkitSEOSettings,
    headkitBranding,
  });
}

export default async function Home() {
  const [
    page,
    mainCarousel,
    productCategories,
    brands,
    featuredProducts,
    posts,
  ] = await Promise.all([
    getPage({ id: "/", type: PageIdType.Uri }),
    getCarousel({ where: { carouselCategoriesIn: ["main"] } }),
    getProductCategories({ where: { featured: true } }),
    getBrands({ where: { featured: true } }),
    getProducts({
      first: 10,
      where: makeWhereProductQuery("featured"),
    }),
    getPosts({ first: 10 }),
  ]);

  const editorBlocks = processBlockEditor(
    page?.data?.page?.editorBlocks as (
      | CoreGroup
      | CoreHeading
      | CoreParagraph
      | CoreButton
      | WoocommerceHandpickedProducts
      | WoocommerceProductOnSale
      | WoocommerceProductNew
    )[]
  );

  return (
    <>
      {(mainCarousel?.data?.carousels?.nodes?.length ?? 0) > 0 && (
        <div className="overflow-hidden">
          <div className="mx-5">
            <MainCarousel carouselData={mainCarousel.data.carousels} />
          </div>
        </div>
      )}

      <BlockEditor blocks={editorBlocks} section="section-1" />

      {/* Featured Products */}
      {(featuredProducts?.data?.products?.nodes?.length ?? 0) > 0 && (
        <div className="py-[30px] overflow-hidden">
          <SectionHeader
            title="Featured Products"
            description="Explore our curated selection of top-rated products."
            allButton="View All"
            allButtonPath="/shop/featured"
            className="px-5 md:px-10"
          />
          <div className="mt-5">
            <ProductCarousel
              products={
                (featuredProducts?.data?.products?.nodes?.filter(
                  (node): node is NonNullable<typeof node> =>
                    node !== null && node !== undefined
                ) ?? []).map((product) => ({
                  ...(product as ProductContentFullWithGroupFragment),
                  isNew: calculateIsNew(product as ProductContentFullWithGroupFragment),
                }))
              }
            />
          </div>
        </div>
      )}

      <BlockEditor blocks={editorBlocks} section="section-2" />

      {(productCategories?.data?.productCategories?.nodes?.length ?? 0) > 0 && (
        <div className="py-[30px] overflow-hidden">
          <SectionHeader
            title="Top Collections"
            description=""
            allButton="Shop all Collections"
            allButtonPath="/shop/categories"
            className="px-5 md:px-10"
          />
          <div className="mt-5">
            <CategoryCarousel
              categories={
                productCategories?.data?.productCategories?.nodes?.map(
                  (category) => ({
                    name: category?.name || "",
                    thumbnail: category?.thumbnail || "",
                    slug: category?.slug || "",
                    uri: category?.uri || "",
                  })
                ) ?? []
              }
            />
          </div>
        </div>
      )}

      {/* brands */}
      {(brands?.data?.brands?.nodes?.length ?? 0) > 0 && (
        <div className="mx-5 px-5 md:px-10 py-10 overflow-hidden bg-lime-400 rounded-lg">
          <SectionHeader
            title={"Leading Brands"}
            description={""}
            allButton={"All Brands"}
            allButtonPath={"/"}
            className="py-0!"
          />

          <div className="mt-7">
            <BrandCarousel
              brands={
                brands?.data.brands?.nodes?.map((brand) => ({
                  name: brand?.name || "",
                  thumbnail: brand?.thumbnail || "",
                  slug: brand?.slug || "",
                })) ?? []
              }
            />
          </div>
        </div>
      )}

      {/* post */}
      {(posts?.data?.posts?.nodes?.length ?? 0) > 0 && (
        <div className="py-[30px] overflow-hidden">
          <SectionHeader
            title="Latest News"
            description="Get the latest news and updates from our blog."
            allButton="View All"
            allButtonPath="/news"
            className="px-5 md:px-10"
          />
          <div className="mt-5">
            <PostCarousel
              posts={
                posts?.data?.posts?.nodes?.map((post) => ({
                  title: post?.title || "",
                  slug: post?.slug || "",
                  featuredImage: {
                    src: post?.featuredImage?.node?.sourceUrl || "",
                    alt: post?.title || "",
                  },
                })) ?? []
              }
            />
          </div>
        </div>
      )}
    </>
  );
}

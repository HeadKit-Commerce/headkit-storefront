import { BlockEditor } from "@/components/block-editor/block-editor";
import { BrandCarousel } from "@/components/carousel/brand-carousel";
import { CategoryCarousel } from "@/components/carousel/category-carousel";
import { MainCarousel } from "@/components/carousel/main-carousel/main-carousel";
import { PostCarousel } from "@/components/carousel/post-carousel";
import { ProductCarousel } from "@/components/carousel/product-carousel";
import { SectionHeader } from "@/components/common/section-header";
import { headkit } from "@/lib/headkit/client";
import { CoreButton, CoreGroup, CoreHeading, CoreParagraph, PageIdType, ProductContentFullWithGroupFragment, WoocommerceHandpickedProducts, WoocommerceProductNew, WoocommerceProductOnSale } from "@/lib/headkit/generated";
import { processBlockEditor } from "@/lib/headkit/utils/process-block-editor";
import { makeWhereProductQuery } from "@/lib/headkit/utils/make-where";

export default async function Home() {
  const [
    page,
    mainCarousel,
    productCategories,
    brands,
    featuredProducts,
    posts,
  ] = await Promise.all([
    headkit().getPage({ id: "/", type: PageIdType.Uri }),
    headkit().getCarousel({ where: { carouselCategoriesIn: ["main"] } }),
    headkit().getProductCategories({ where: { featured: true } }),
    headkit().getBrands({ where: { featured: true } }),
    headkit().getProducts({
      first: 10,
      where: makeWhereProductQuery("featured"),
    }),
    headkit().getPosts({ first: 10 }),
  ]);

  const editorBlocks = processBlockEditor(
    page?.data.page?.editorBlocks as (
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
        <div className="px-5 md:px-10 py-[30px] lg:py-[60px] overflow-hidden">
          <SectionHeader
            title="Featured Products"
            description="Explore our curated selection of top-rated products."
            allButton="View All"
            allButtonPath="/shop/featured"
          />
          <div className="mt-5 lg:mt-[30px]">
            <ProductCarousel
              products={
                (featuredProducts?.data?.products?.nodes?.filter(
                  (node): node is NonNullable<typeof node> =>
                    node !== null && node !== undefined
                ) ?? []) as ProductContentFullWithGroupFragment[]
              }
            />
          </div>
        </div>
      )}

      <BlockEditor blocks={editorBlocks} section="section-2" />

      {(productCategories?.data?.productCategories?.nodes?.length ?? 0) > 0 && (
        <div className="px-5 md:px-10 py-[30px] lg:py-[60px] overflow-hidden">
          <SectionHeader
            title="Top Collections"
            description=""
            allButton="Shop all Collections"
            allButtonPath="/shop/categories"
          />
          <div className="mt-5 lg:mt-[30px]">
            <CategoryCarousel
              categories={
                productCategories?.data?.productCategories?.nodes.map(
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
            className="!py-0"
          />

          <div className="mt-7">
            <BrandCarousel
              brands={
                brands?.data.brands?.nodes.map((brand) => ({
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
        <div className="px-5 md:px-10 py-[30px] lg:py-[60px] overflow-hidden">
          <SectionHeader
            title="Latest News"
            description="Get the latest news and updates from our blog."
            allButton="View All"
            allButtonPath="/posts"
          />
          <div className="mt-5 lg:mt-[30px]">
            <PostCarousel
              posts={
                posts?.data?.posts?.nodes.map((post) => ({
                  title: post?.title || "",
                  slug: post?.slug || "",
                  featuredImage: {
                    src: post?.featuredImage?.node.sourceUrl || "",
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

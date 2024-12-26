"use client";

import {
  ProductContentFullWithGroupFragment,
  ProductTypesEnum,
  ProductVariationContentFragment,
  SimpleProduct,
  StockStatusEnum,
  VariableProduct,
} from "@/lib/headkit/generated";
import Image from "next/image";
import { ProductImageGallery } from "./product-image-gallery";
import { ProductPrice } from "./product-price";
import { Suspense, useEffect, useState } from "react";
import { Breadcrumb } from "@/components/product/breadcrumb";
import { usePathname } from "next/navigation";
import { differenceInDays } from "date-fns";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ProductVariations } from "./product-variations";
import { TextWithIcon } from "@/components/product/text-with-icon";
import { Icon } from "@/components/icon";
import { AvailabilityStatus } from "./availability-status";
import { AddToCart } from "./add-to-cart";
import { CONFIG } from "@/config/app-config";
import { ExpressCheckout } from "@/components/stripe/express-checkout";
import { PaymentMethodMessaging } from "@/components/stripe/payment-messaging";
import { getFloatVal } from "@/lib/utils";

interface Props {
  product: ProductContentFullWithGroupFragment;
}

export const ProductDetail = ({ product }: Props) => {
  const pathname = usePathname();
  const [giftCardFormValid] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<
    ProductContentFullWithGroupFragment | ProductVariationContentFragment
  >();

  const [imageVariableSelected, setImageVariableSelected] = useState<
    { src: string; alt: string }[]
  >([]);

  const handleVariableImage = (images: { src: string; alt: string }[]) => {
    const galleryImages =
      product?.attributes?.nodes.length === 1 && images.length === 1
        ? product?.galleryImages?.nodes.map((image) => ({
          src: image?.sourceUrl || CONFIG.fallbackProductImage,
          alt: image?.altText || "product",
        })) || []
        : [];
    setImageVariableSelected([...images, ...galleryImages]);
  };

  const isGiftCard = product?.metaData?.some(
    (meta) => meta?.key === "_gift_card" && meta?.value === "yes"
  );

  useEffect(() => {
    if (product?.type === ProductTypesEnum.Simple) {
      setSelectedProduct(product);
      setImageVariableSelected([
        {
          src: product?.image?.sourceUrl || CONFIG.fallbackProductImage,
          alt: product?.image?.altText || "product",
        },
        ...(product?.galleryImages?.nodes?.map((image) => ({
          src: image?.sourceUrl || CONFIG.fallbackProductImage,
          alt: image?.altText || "product",
        })) || []),
      ]);
    }
  }, [product]);



  return (
    <>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <ProductImageGallery
          images={imageVariableSelected.map((image) => ({
            src: image.src,
            alt: image.alt,
          }))}
          isSale={!!product?.onSale}
          isNew={
            product?.date
              ? differenceInDays(new Date(), new Date(product.date)) <= 30
              : false
          }
        />

        <div>
          <div className="mb-5 hidden md:block">
            <Breadcrumb
              items={[
                { name: "Home", uri: "/", current: false },
                { name: "Shop", uri: "/shop", current: false },
                ...pathname
                  ?.split("/")
                  ?.filter((x) => x && x !== "shop" && x !== product.slug)
                  ?.map((slug) => {
                    const cat = product?.productCategories?.nodes.find(
                      (x) => x.slug === slug
                    );
                    return {
                      name: cat?.name ?? "",
                      uri: cat?.uri ?? "",
                      current: false,
                    };
                  }),
                { name: product.name ?? "", uri: pathname ?? "", current: true },
              ]}
            />
          </div>
          <div className="mb-2">
            {product?.brands?.nodes?.map((brand, i) => {
              return (
                <div key={i} className="relative h-[50px] w-[160px]">
                  {brand?.thumbnail ? (
                    <Image
                      src={brand.thumbnail}
                      alt={brand.name ?? ""}
                      fill
                      priority={true}
                      className="object-contain object-center"
                    />
                  ) : (
                    <span className="text-center">{brand.name ?? ""}</span>
                  )}
                </div>
              );
            })}
          </div>
          <h1 className="mb-5 text-3xl font-bold text-purple-900">
            {product?.name}
          </h1>
          <div
            className="mb-8"
            dangerouslySetInnerHTML={{
              __html: product.shortDescription!,
            }}
          />
          {/* {isGiftCard && (
            <div className="mb-8">
              <GiftCardForm
                emitClickEvent={handleGiftCardEvent}
                onFormValid={setGiftCardFormValid}
              />
            </div>
          )} */}
          <Suspense>
            <div className="grid grid-cols-2">
              <div>
                {product?.type == ProductTypesEnum.Simple && (
                  <>
                    <ProductPrice
                      price={(product as SimpleProduct)?.price ?? ""}
                      regularPrice={product?.regularPrice ?? ""}
                      onSale={product?.onSale ?? false}
                      size="big"
                    />
                    <div className="mt-5">
                      <AvailabilityStatus
                        stockQuantity={
                          (product as SimpleProduct)?.stockQuantity ?? null
                        }
                        stockStatus={(product as SimpleProduct)?.stockStatus ?? StockStatusEnum.InStock}
                      />
                    </div>
                  </>
                )}
                {product?.type == ProductTypesEnum.Variable && (
                  <ProductVariations
                    parentProduct={product as VariableProduct}
                    setVariableImage={handleVariableImage}
                    onSetProduct={setSelectedProduct}
                  />
                )}
              </div>
              {/* <ProductWishlist parentProduct={product as SimpleProduct} /> */}
            </div>
          </Suspense>

          <div className="mt-3">
            <AddToCart
              productId={
                isGiftCard
                  ? giftCardFormValid
                    ? selectedProduct?.databaseId ?? null
                    : null
                  : selectedProduct?.databaseId ?? null
              }
              quantity={1}
              stockStatus={(selectedProduct as SimpleProduct)?.stockStatus ?? StockStatusEnum.InStock}
              disabled={isGiftCard ? !giftCardFormValid : false}
            />
          </div>

          {selectedProduct !== null && !isGiftCard ? (
            <div className="mt-3">
              <ExpressCheckout
                productName={selectedProduct?.name ?? ""}
                productId={selectedProduct?.databaseId}
                price={getFloatVal(
                  selectedProduct?.salePrice ?? selectedProduct?.regularPrice ?? ""
                )}
                disabled={
                  selectedProduct?.databaseId === null ||
                  (selectedProduct as SimpleProduct)?.stockStatus ===
                  StockStatusEnum.OutOfStock
                }
                singleCheckout={true}
              />
            </div>
          ) : null}

          <div className="mt-5 flex w-full flex-wrap justify-between gap-2">
            <div>
              <TextWithIcon
                text="Free shipping over $100"
                icon={<Icon.truck size={20} />}
                iconPosition="left"
              />
            </div>
            <PaymentMethodMessaging
              price={getFloatVal(
                selectedProduct?.price || selectedProduct?.regularPrice || ""
              )}
              disabled={
                !selectedProduct ||
                (selectedProduct as SimpleProduct)?.stockStatus ===
                StockStatusEnum.OutOfStock
              }
            />
          </div>

          <div className="my-6 grid gap-[10px]">
            {product?.description && (
              <Collapsible defaultOpen>
                <CollapsibleTrigger className="text-2xl font-bold flex w-full justify-between items-center group">
                  Details
                  <span className="text-xl group-data-[state=open]:hidden"><Icon.plus size={20} /></span>
                  <span className="text-xl hidden group-data-[state=open]:block"><Icon.minus size={20} /></span>
                </CollapsibleTrigger>
                <CollapsibleContent className="prose py-4">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: product?.description,
                    }}
                  />
                </CollapsibleContent>
              </Collapsible>
            )}
            {product?.productTechnical && (
              <Collapsible>
                <CollapsibleTrigger className="text-2xl font-bold flex w-full justify-between items-center group">
                  Technical Details
                  <span className="text-xl group-data-[state=open]:hidden"><Icon.plus size={20} /></span>
                  <span className="text-xl hidden group-data-[state=open]:block"><Icon.minus size={20} /></span>
                </CollapsibleTrigger>
                <CollapsibleContent className="prose py-4">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: product?.productTechnical,
                    }}
                  />
                </CollapsibleContent>
              </Collapsible>
            )}
            {product?.productInstructions && (
              <Collapsible>
                <CollapsibleTrigger className="text-2xl font-bold flex w-full justify-between items-center group">
                  Instructions
                  <span className="text-xl group-data-[state=open]:hidden"><Icon.plus size={20} /></span>
                  <span className="text-xl hidden group-data-[state=open]:block"><Icon.minus size={20} /></span>
                </CollapsibleTrigger>
                <CollapsibleContent className="prose py-4">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: product?.productInstructions,
                    }}
                  />
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
          {product.sku && (
            <div className="mb-8 text-xs text-purple-800">
              Item {product.sku}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

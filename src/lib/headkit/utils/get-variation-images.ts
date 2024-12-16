import { CONFIG } from "@/config/app-config";
import { ProductVariationContentFragment } from "../generated";

const getVariationImages = (
  product: ProductVariationContentFragment,
  isAdditionalVariationImagesPluginEnabled: boolean = false,
  baseUrl: string = ""
): { src: string; alt: string }[] => {
  const variationImages = [
    {
      src: product.image?.sourceUrl || CONFIG.fallbackProductImage,
      alt: product.image?.altText || "product",
    },
  ];

  if (!isAdditionalVariationImagesPluginEnabled) return variationImages;

  const additionalImages = product?.metaData
    ?.find(
      (meta) => meta?.key === "_wc_additional_variation_images" && meta?.value
    )
    ?.value?.split(",");

  additionalImages?.forEach((additionalImage) => {
    variationImages.push({
      src: `${baseUrl}/?attachment_id=${additionalImage}`,
      alt: `additional-image-${additionalImage}`,
    });
  });

  return variationImages;
};

export { getVariationImages };

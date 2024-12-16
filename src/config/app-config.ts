const FALLBACK_PRODUCT_IMAGE = "/fallback.svg";

const CONFIG = {
  metadata: {
    appName: "HeadKit Demo Store",
    description: "HeadKit Demo Store",
    appColor: "#0a0a0a",
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000"
    ),
    openGraphImageFallback:
      process.env.NEXT_PUBLIC_FRONTEND_URL + "/fallback-og-image.png",
  },
  fallbackProductImage: FALLBACK_PRODUCT_IMAGE,
  collection: {
    name: "Collection",
    slug: "collections",
    link: "/collections",
  },
  product: {
    name: "Shop",
    slug: "shop",
    link: "/shop",
  },
  article: {
    name: "News & Tips",
    slug: "posts",
    link: "/posts",
  },
};

export { CONFIG };

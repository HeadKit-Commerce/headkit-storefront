interface HeadKitConfig {
  metadata: {
    appName: string;
    description: string;
    appColor: string;
    metadataBase: string;
    openGraphImageFallback: string;
  };
  fallbackProductImage: string;
  logo: string;
  icon: string;
  collection: {
    name: string;
    slug: string;
    link: string;
  };
  product: {
    name: string;
    slug: string;
    link: string;
  };
  article: {
    name: string;
    slug: string;
    link: string;
  };
  sale: {
    name: string;
    slug: string;
    link: string;
  };
  account: {
    name: string;
    slug: string;
    link: string;
  };
}

const config: HeadKitConfig = {
  metadata: {
    appName: "HeadKit Demo Store",
    description: "HeadKit Demo Store",
    appColor: "#0a0a0a",
    metadataBase: process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
    openGraphImageFallback:
      process.env.NEXT_PUBLIC_FRONTEND_URL + "/fallback-og-image.png",
  },
  fallbackProductImage: "/fallback.svg",
  logo: "/brand/logo.svg",
  icon: "/brand/icon.png",
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
    slug: "news",
    link: "/news",
  },
  sale: {
    name: "Sale",
    slug: "sale",
    link: "/sale",
  },
  account: {
    name: "Account",
    slug: "account",
    link: "/account",
  },
};

export type { HeadKitConfig };
export default config;

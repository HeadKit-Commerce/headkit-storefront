import { removeTrailingSlash } from "@/lib/utils";
import { MetadataRoute } from "next";
import { getBrandList, getPostList } from "@/lib/headkit/actions";
import { headkit } from "@/lib/headkit/client";

type BaseSitemapItem = {
  url: string;
  lastModified: Date;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: number;
};

// GraphQL node types
interface ProductNode {
  uri?: string | null;
  slug?: string | null;
  modified?: string | null;
}

// For GraphQL query results
type GraphQLProductNode = {
  __typename?: string;
  uri?: string | null;
  slug?: string | null;
  modified?: string | null;
};

interface PostNode {
  slug?: string | null;
  modified?: string | null;
}

interface BrandNode {
  slug?: string | null;
  modified?: string | null;
}

const makeBrandSitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const response = await getBrandList({ input: {} });
  const brands = response.data?.brands?.nodes || [];

  return brands.map((node: BrandNode) => ({
    url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/brand/${node?.slug}`,
    lastModified: node?.modified ? new Date(node.modified) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));
};

const makeCollectionSitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const client = await headkit();
  const response = await client.getProductCategories();
  const categories = response.data?.productCategories?.nodes || [];

  return categories
    .filter(
      (node: ProductNode) =>
        node.uri &&
        node.uri !== "/collections/uncategorised/" &&
        node.uri !== "/collections/uncategorized/"
    )
    .map((node: ProductNode) => ({
      url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}${removeTrailingSlash(
        node?.uri || ""
      )}`,
      lastModified: node?.modified ? new Date(node.modified) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
};

const makeProductSitemap = async (): Promise<MetadataRoute.Sitemap> => {
  // Create direct recursive function with types
  async function getProducts(cursor?: string | null): Promise<ProductNode[]> {
    // Use the raw client to avoid intermediaries
    const client = await headkit();
    const response = await client.getProductSlugs({ after: cursor });

    const products = (response.data?.products?.nodes || []).map(
      (product: GraphQLProductNode): ProductNode => ({
        uri: product.uri,
        slug: product.slug,
        modified: product.modified,
      })
    );

    // Check if there are more pages
    if (response.data?.products?.pageInfo?.hasNextPage) {
      const nextCursor = response.data?.products?.pageInfo?.endCursor || null;
      const nextPageProducts = await getProducts(nextCursor);
      return [...products, ...nextPageProducts];
    }

    return products;
  }

  const productSlugs = await getProducts();

  return productSlugs.map((node: ProductNode) => ({
    url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}${removeTrailingSlash(
      node?.uri || ""
    )}`,
    lastModified: node?.modified ? new Date(node.modified) : new Date(),
    changeFrequency: "daily",
    priority: 1,
  }));
};

const makePostSitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const response = await getPostList({ input: {} });
  const posts = response.data?.posts?.nodes || [];

  return posts.map((node: PostNode) => ({
    url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/posts/${node?.slug}`,
    lastModified: node?.modified ? new Date(node.modified) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const brandSitemap = await makeBrandSitemap();
  const productSitemap = await makeProductSitemap();
  const collectionSitemap = await makeCollectionSitemap();
  const postSitemap = await makePostSitemap();

  const staticPages: BaseSitemapItem[] = [
    // priority = 1
    {
      url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },

    // priority = 0.8
    {
      url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },

    // priority = 0.5
    {
      url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/legal/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/legal/terms-conditions`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  return [
    ...staticPages,
    ...brandSitemap,
    ...productSitemap,
    ...collectionSitemap,
    ...postSitemap,
  ];
} 
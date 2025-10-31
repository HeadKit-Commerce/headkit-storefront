"use server";

import { cacheTag } from 'next/cache';
import { headkit } from './client';
import { CACHE_TAGS } from './cache-config';
import {
  GetBrandsQueryVariables,
  GetCarouselQueryVariables,
  GetFaQsQueryVariables,
  GetGeneralSettingsQueryVariables,
  GetPostCategoriesQueryVariables,
  GetPostsQueryVariables,
  GetProductCategoriesQueryVariables,
  GetProductFiltersQueryVariables,
  GetProductListQueryVariables,
  GetProductsQueryVariables,
  GetProductSlugsQueryVariables,
  PageIdType,
  PostIdType,
  ProductCategoryIdType,
  ProductIdTypeEnum,
} from './generated';

// ============================================
// PRODUCTS
// ============================================

export async function getProducts(variables?: GetProductsQueryVariables) {
  "use cache";
  cacheTag(CACHE_TAGS.PRODUCTS);
  return await headkit().getProducts(variables);
}

export async function getProduct({ id, type }: { id: string; type: ProductIdTypeEnum }) {
  "use cache";
  cacheTag(CACHE_TAGS.PRODUCTS);
  if (type === ProductIdTypeEnum.Slug) {
    cacheTag(CACHE_TAGS.PRODUCT(id));
  }
  return await headkit().getProduct({ id, type });
}

export async function getProductList(input: GetProductListQueryVariables) {
  "use cache";
  cacheTag(CACHE_TAGS.PRODUCTS);
  return await headkit().getProductList(input);
}

export async function getProductFilters(variables?: GetProductFiltersQueryVariables) {
  "use cache";
  cacheTag(CACHE_TAGS.PRODUCT_FILTERS);
  return await headkit().getProductFilters(variables);
}

export async function getProductCategory({ slug }: { slug: string }) {
  "use cache";
  cacheTag(CACHE_TAGS.PRODUCT_CATEGORIES);
  cacheTag(CACHE_TAGS.COLLECTION(slug));
  return await headkit().getProductCategory({
    id: slug,
    type: ProductCategoryIdType.Slug,
  });
}

export async function getProductCategories(variables?: GetProductCategoriesQueryVariables) {
  "use cache";
  cacheTag(CACHE_TAGS.PRODUCT_CATEGORIES);
  cacheTag(CACHE_TAGS.COLLECTIONS);
  return await headkit().getProductCategories(variables);
}

export async function getProductSlugs(variables?: GetProductSlugsQueryVariables) {
  "use cache";
  cacheTag(CACHE_TAGS.PRODUCTS);
  return await headkit().getProductSlugs(variables);
}

// ============================================
// PAGES & CONTENT
// ============================================

export async function getPage({ id, type }: { id: string; type: PageIdType }) {
  "use cache";
  cacheTag(CACHE_TAGS.PAGES);
  if (type === PageIdType.Uri) {
    cacheTag(CACHE_TAGS.PAGE(id));
  }
  return await headkit().getPage({ id, type });
}

export async function getPosts(variables: GetPostsQueryVariables) {
  "use cache";
  cacheTag(CACHE_TAGS.POSTS);
  return await headkit().getPosts(variables);
}

export async function getPost({ id, type }: { id: string; type: PostIdType }) {
  "use cache";
  cacheTag(CACHE_TAGS.POSTS);
  if (type === PostIdType.Slug) {
    cacheTag(CACHE_TAGS.POST(id));
  }
  return await headkit().getPost({ id, type });
}

export async function getPostFilters(input: GetPostCategoriesQueryVariables) {
  "use cache";
  cacheTag(CACHE_TAGS.POSTS);
  return await headkit().getPostCategories(input);
}

// ============================================
// BRANDS
// ============================================

export async function getBrands(input: GetBrandsQueryVariables) {
  "use cache";
  cacheTag(CACHE_TAGS.BRANDS);
  return await headkit().getBrands(input);
}

export async function getBrand({ slug }: { slug: string }) {
  "use cache";
  cacheTag(CACHE_TAGS.BRANDS);
  cacheTag(CACHE_TAGS.BRAND(slug));
  return await headkit().getBrand({ slug });
}

// ============================================
// SETTINGS & CONFIG
// ============================================

export async function getGeneralSettings(variables?: GetGeneralSettingsQueryVariables) {
  "use cache";
  cacheTag(CACHE_TAGS.GENERAL_SETTINGS);
  return await headkit().getGeneralSettings(variables);
}

export async function getSEOSettings() {
  "use cache";
  cacheTag(CACHE_TAGS.SEO_SETTINGS);
  return await headkit().getSEOSettings();
}

export async function getBranding() {
  "use cache";
  cacheTag(CACHE_TAGS.BRANDING);
  return await headkit().getBranding();
}

export async function getMenu() {
  "use cache";
  cacheTag(CACHE_TAGS.MENU);
  return await headkit().getMenu();
}

export async function getStoreSettings() {
  "use cache";
  cacheTag(CACHE_TAGS.STORE_SETTINGS);
  return await headkit().getStoreSettings();
}

// ============================================
// ECOMMERCE CONFIG
// ============================================

export async function getPaymentGateways() {
  "use cache";
  cacheTag(CACHE_TAGS.PAYMENT_GATEWAYS);
  return await headkit().getPaymentGateways();
}

export async function getStripeConfig() {
  "use cache";
  cacheTag(CACHE_TAGS.STRIPE_CONFIG);
  return await headkit().getStripeConfig();
}

export async function getPickupLocations() {
  "use cache";
  cacheTag(CACHE_TAGS.PICKUP_LOCATIONS);
  return await headkit().getPickupLocations();
}

// ============================================
// OTHER CONTENT
// ============================================

export async function getCarousel(variables?: GetCarouselQueryVariables) {
  "use cache";
  cacheTag(CACHE_TAGS.CAROUSEL);
  if (variables?.where?.carouselCategoriesIn) {
    variables.where.carouselCategoriesIn.forEach(cat => {
      if (cat) {
        cacheTag(CACHE_TAGS.CAROUSEL_CATEGORY(cat));
      }
    });
  }
  return await headkit().getCarousel(variables);
}

export async function getFAQs(variables?: GetFaQsQueryVariables) {
  "use cache";
  cacheTag(CACHE_TAGS.FAQS);
  return await headkit().getFAQs(variables);
}

export async function getGravityFormById({ id }: { id: string }) {
  "use cache";
  cacheTag(CACHE_TAGS.GRAVITY_FORMS);
  cacheTag(CACHE_TAGS.FORM(id));
  return await headkit().getGravityFormById({ id });
}

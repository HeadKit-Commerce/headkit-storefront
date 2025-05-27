import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/shop/*", "/brand/*", "/posts/*", "/collections/*"],
        disallow: [
          "/account/*", 
          "/checkout/*", 
          "/api/*", 
          "/search/*", 
          "/account", 
          "/checkout", 
          "/api", 
          "/search", 
          "/*/*?*", 
          "/*?*",
          "*/thank-you",
          "*/error",
          "*/canceled",
          "*/login",
          "*/register",
          "*/reset-password",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/shop/*?*", "/collections?page=*", "/shop?page=*"],
        disallow: [
          "/account/*", 
          "/checkout/*", 
          "/api/*",
          "/account", 
          "/checkout", 
          "/api",
        ],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/sitemap.xml`,
    host: process.env.NEXT_PUBLIC_FRONTEND_URL,
  };
} 
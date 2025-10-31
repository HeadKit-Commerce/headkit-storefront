import type { Metadata } from "next";
import "./globals.css";
import { getGeneralSettings } from "@/lib/headkit/queries";
import { HeaderWrapper } from "@/components/layout/header-wrapper";
import { FooterWrapper } from "@/components/layout/footer-wrapper";
import { Urbanist } from "next/font/google";
import { makeRootMetadata } from "@/lib/headkit/utils/make-metadata";
import { AppContextProvider } from "@/contexts/app-context";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/toaster";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { WebsiteJsonLD } from "@/components/seo/website-json-ld";
import { ModeIndicator } from "@/components/mode-indicator";
import { ThemeCSS } from "@/components/theme-css";
import { Suspense } from "react";

const urbanist = Urbanist({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-urbanist",
  display: "swap", // Improve font loading performance
});

export const generateMetadata = async (): Promise<Metadata> => {
  try {
    const {
      data: { generalSettings },
    } = await getGeneralSettings();

    return makeRootMetadata({
      title: generalSettings?.title,
      description: generalSettings?.description,
    });
  } catch (error) {
    console.error("Error fetching general settings for metadata:", error);

    // Return fallback metadata if the query fails
    return makeRootMetadata({
      title: "Your Store",
      description: "Welcome to our online store",
    });
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <ThemeCSS branding={null} />
      </head>
      <body
        className={`${urbanist.className} ${urbanist.variable} antialiased`}
      >
        <WebsiteJsonLD />
        <AuthProvider>
          <AppContextProvider>
            <HeaderWrapper />
            <Suspense fallback={<div className="min-h-screen" />}>
              <main>{children}</main>
            </Suspense>
            <Toaster />
            <Suspense>
              <FooterWrapper />
            </Suspense>
            <ModeIndicator
              position="bottom-right"
              showInProduction={
                process.env.NEXT_PUBLIC_SHOW_MODE_INDICATOR_IN_PRODUCTION ===
                "true"
              }
            />
          </AppContextProvider>
        </AuthProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}

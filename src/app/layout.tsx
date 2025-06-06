import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Urbanist } from "next/font/google";
import { MenuLocationEnum } from "@/lib/headkit/generated";
import { makeRootMetadata } from "@/lib/headkit/utils/make-metadata";
import { AppContextProvider } from "@/contexts/app-context";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/contexts/auth-context";
import { StripeProvider } from '@/contexts/stripe-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { Toaster } from "@/components/ui/toaster";
import { SpeedInsights } from "@vercel/speed-insights/next"
import config from "@/headkit.config";
import { getBrandingStatic, getGeneralSettingsStatic, getMenuStatic, getStoreSettingsStatic, getStripeConfigStatic } from "@/lib/headkit/actions";
import { WebsiteJsonLD } from "@/components/seo/website-json-ld";
import { GoogleTagManager } from "@next/third-parties/google";

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
    } = await getGeneralSettingsStatic();

    return await makeRootMetadata({
      title: generalSettings?.title,
      description: generalSettings?.description,
    });
  } catch (error) {
    console.warn('Failed to fetch general settings during build, using fallback metadata:', error);
    
    // Provide fallback metadata
    return await makeRootMetadata({
      title: "Store",
      description: "tore",
    });
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch data with error handling for build-time failures
  let branding, menu, stripeConfigData, storeSettings;
  
  try {
    const results = await Promise.all([
      getBrandingStatic(),
      getMenuStatic(),
      getStripeConfigStatic(),
      getStoreSettingsStatic()
    ]);
    
    [{ data: branding }, { data: menu }, { data: stripeConfigData }, { data: storeSettings }] = results;
  } catch (error) {
    console.warn('Failed to fetch some data during build, using fallbacks:', error);
    
    // Provide fallback data
    branding = { branding: null };
    menu = { menus: { nodes: [] } };
    stripeConfigData = { stripeConfig: null };
    storeSettings = { storeSettings: null };
  }

  // Use the enum to fetch menus by location
  const headerMenuLocations = [
    MenuLocationEnum.Primary,
    MenuLocationEnum.MainRight,
    MenuLocationEnum.PreHeader,
  ];

  const footerMenuLocations = [
    MenuLocationEnum.Footer,
    MenuLocationEnum.Footer_2,
    MenuLocationEnum.FooterPolicy,
  ];

  const headerMenusByLocation = headerMenuLocations.reduce((acc, location) => {
    const temp = menu?.menus?.nodes?.find((menu) =>
      menu?.locations?.includes(location)
    ) ?? null;

    acc[location] = {
      name: temp?.name ?? "",
      menuItems: {
        nodes: temp?.menuItems?.nodes.map((node) => ({
          id: node.id,
          parentId: node.parentId ?? null,
          label: node.label ?? "",
          uri: node.uri ?? "",
          description: node.description ?? "",
        })) ?? [],
      },
    };
    return acc;
  }, {} as Record<MenuLocationEnum, {
    name: string;
    menuItems: {
      nodes: {
        id: string;
        parentId: string | null;
        label: string;
        uri: string;
        description?: string | null;
      }[];
    };
  }>);

  const footerMenusByLocation = footerMenuLocations.reduce((acc, location) => {
    const temp = menu?.menus?.nodes?.find((menu) =>
      menu?.locations?.includes(location)
    ) ?? null;

    acc[location] = {
      name: temp?.name ?? "",
      menuItems: {
        nodes: temp?.menuItems?.nodes.map((node) => ({
          id: node.id,
          parentId: node.parentId ?? null,
          label: node.label ?? "",
          uri: node.uri ?? "",
          description: node.description ?? "",
        })) ?? [],
      },
    };
    return acc;
  }, {} as Record<MenuLocationEnum, {
    name: string;
    menuItems: {
      nodes: {
        id: string;
        parentId: string | null;
        label: string;
        uri: string;
        description?: string | null;
      }[];
    };
  }>);

  return (
    <html lang="en">
      <body
        className={`${urbanist.className} ${urbanist.variable} antialiased`}
      >
        {storeSettings?.storeSettings?.gtmId && <GoogleTagManager gtmId={storeSettings?.storeSettings?.gtmId} />}
        <WebsiteJsonLD />
        <AuthProvider>
          <AppContextProvider 
            brandingData={branding?.branding ?? null}
            stripeFullConfig={stripeConfigData?.stripeConfig ?? null}
          >
            <StripeProvider>
              <ThemeProvider>
                <Header 
                  menus={headerMenusByLocation} 
                  logoUrl={branding?.branding?.logoUrl ?? config.logo} 
                />
                <main>{children}</main>
                <Toaster />
                <Footer 
                  menus={footerMenusByLocation} 
                  iconUrl={branding?.branding?.iconUrl ?? config.icon} 
                />
              </ThemeProvider>
            </StripeProvider>
          </AppContextProvider>
        </AuthProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}

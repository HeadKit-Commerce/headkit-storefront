import type { Metadata } from "next";
import "./globals.css";
import { headkit } from "@/lib/headkit/client";
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
import { getBranding, getStripeConfig } from "@/lib/headkit/actions";

const urbanist = Urbanist({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-urbanist",
});

export const generateMetadata = async (): Promise<Metadata> => {
  const {
    data: { generalSettings },
  } = await headkit().getGeneralSettings();

  return makeRootMetadata({
    title: generalSettings?.title,
    description: generalSettings?.description,
  });
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [{ data: branding }, { data: menu }, { data: stripeConfigData }] = await Promise.all([
    getBranding(),
    headkit().getMenu(),
    getStripeConfig()
  ]);

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
                {children}
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

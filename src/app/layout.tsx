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
import { Toaster } from "@/components/ui/toaster";
import { SpeedInsights } from "@vercel/speed-insights/next"

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
  const { data: menu } = await headkit().getMenu();

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
          <AppContextProvider>
            <StripeProvider>
              <Header menus={headerMenusByLocation} />
              {children}
              <Toaster />
              <Footer menus={footerMenusByLocation} />
            </StripeProvider>
          </AppContextProvider>
        </AuthProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}

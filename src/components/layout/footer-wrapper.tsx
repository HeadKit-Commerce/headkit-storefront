import { getMenu, getBranding } from "@/lib/headkit/queries";
import { MenuLocationEnum } from "@/lib/headkit/generated";
import { Footer } from "./footer";
import config from "@/headkit.config";

export async function FooterWrapper() {
  let branding = null;
  let menu = null;

  try {
    const results = await Promise.all([
      getBranding()
        .catch((error) => {
          console.error("Error fetching branding:", error);
          return { data: { branding: null } };
        }),
      getMenu()
        .catch((error) => {
          console.error("Error fetching menu:", error);
          return { data: { menus: { nodes: [] } } };
        }),
    ]);

    branding = results[0].data;
    menu = results[1].data;
  } catch (error) {
    console.error("Error in FooterWrapper queries:", error);
    branding = { branding: null };
    menu = { menus: { nodes: [] } };
  }

  const footerMenuLocations = [
    MenuLocationEnum.Footer,
    MenuLocationEnum.Footer_2,
    MenuLocationEnum.FooterPolicy,
  ];

  const footerMenusByLocation = footerMenuLocations.reduce(
    (acc, location) => {
      const temp =
        menu?.menus?.nodes?.find((menu) =>
          menu?.locations?.includes(location)
        ) ?? null;

      acc[location] = {
        name: temp?.name ?? "",
        menuItems: {
          nodes:
            temp?.menuItems?.nodes.map((node) => ({
              id: node.id,
              parentId: node.parentId ?? null,
              label: node.label ?? "",
              uri: node.uri ?? "",
              description: node.description ?? "",
            })) ?? [],
        },
      };
      return acc;
    },
    {} as Record<
      MenuLocationEnum,
      {
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
      }
    >
  );

  return (
    <Footer
      menus={footerMenusByLocation}
      iconUrl={branding?.branding?.iconUrl ?? config.icon}
    />
  );
}

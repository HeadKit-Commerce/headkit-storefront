import { getBranding, getMenu } from "@/lib/headkit/queries";
import { MenuLocationEnum } from "@/lib/headkit/generated";
import { Header } from "./header";
import { cache } from "react";
import config from "@/headkit.config";

export async function HeaderWrapper() {
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
    console.error("Error in HeaderWrapper queries:", error);
    branding = { branding: null };
    menu = { menus: { nodes: [] } };
  }

  if (!menu) {
    return null;
  }

  // Use the enum to fetch menus by location
  const headerMenuLocations = [
    MenuLocationEnum.Primary,
    MenuLocationEnum.MainRight,
    MenuLocationEnum.PreHeader,
  ];

  const processMenus = cache((menuData: typeof menu) => {
    return headerMenuLocations.reduce(
      (acc, location) => {
        const temp =
          menuData?.menus?.nodes?.find((menu) =>
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
  });

  const headerMenusByLocation = processMenus(menu);

  return (
    <Header
      menus={headerMenusByLocation}
      logoUrl={branding?.branding?.logoUrl ?? config.logo}
    />
  );
}

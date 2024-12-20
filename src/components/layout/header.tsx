"use client";

import { useState } from "react";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { formatNodeTree } from "@/lib/headkit/utils/format-node-tree";
import { MenuLocationEnum } from "@/lib/headkit/generated";
import { Icon } from "../icon";
import { CartDrawer } from "./cart-drawer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "../ui/button";

interface Props {
  menus: Record<
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
  >;
}

const Header = ({ menus }: Props) => {
  const [open, setOpen] = useState(false);

  const preheaderMenu = menus[MenuLocationEnum.PreHeader];
  const primaryMenu = menus[MenuLocationEnum.Primary];
  const mainRightMenu = menus[MenuLocationEnum.MainRight];

  return (
    <>
      <Preheader
        title={preheaderMenu.name}
        links={preheaderMenu.menuItems.nodes.map((item) => ({
          label: item.label,
          uri: item.uri,
          target: "_blank",
        }))}
      />
      <NavigationMenu className="sticky top-0 flex items-center justify-between h-20 w-full bg-white max-w-full z-20 px-5 md:px-10">
        <NavigationMenuList>
          <NavigationMenuItem className="mr-4 hover:opacity-75">
            <NavigationMenuLink asChild>
              <Link href="/">
                <Icon.logo className="h-6 md:h-9 w-auto" />
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <div className="hidden md:flex">
            {primaryMenu && <MenuSection menuItems={primaryMenu.menuItems.nodes} />}
          </div>
        </NavigationMenuList>
        {/* Main Right Menu */}
        <NavigationMenuList>
          <div className="hidden md:flex">
            {mainRightMenu && <MenuSection menuItems={mainRightMenu.menuItems.nodes} />}
          </div>
          <NavigationMenuItem>
            <CartDrawer />
          </NavigationMenuItem>
          <NavigationMenuItem className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant={"ghost"} className="pr-0">
                  <Icon.hamburger className="stroke-purple-800 w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetTitle hidden />
                <SheetDescription hidden />
                <nav className="flex flex-col gap-4 mt-8">
                  {primaryMenu && (
                    <MobileMenuSection
                      menuItems={primaryMenu.menuItems.nodes}
                      onSelect={() => setOpen(false)}
                    />
                  )}
                  {mainRightMenu && (
                    <MobileMenuSection
                      menuItems={mainRightMenu.menuItems.nodes}
                      onSelect={() => setOpen(false)}
                    />
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </>
  );
};

interface MenuSectionProps {
  menuItems: {
    id: string;
    parentId: string | null;
    label: string;
    uri: string;
    description?: string | null;
  }[];
}

const MenuSection = ({ menuItems }: MenuSectionProps) => {
  const formattedMenu = formatNodeTree({
    nodes: menuItems.map((item) => ({
      id: item.id,
      parentId: item.parentId!,
      payload: {
        label: item.label,
        uri: item.uri,
        description: item.description,
      },
    })),
    parent: null,
  });

  return (
    <>
      {formattedMenu.map((menuItem) => (
        <NavigationMenuItem key={menuItem.id}>
          {menuItem.children && menuItem.children.length > 0 ? (
            <>
              <NavigationMenuTrigger>
                {menuItem.payload.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="!w-screen !rounded-none">
                <ul className="grid gap-3 p-6 w-full">
                  {menuItem.children.map((child) => (
                    <MenuItem key={child.id} menuItem={child} />
                  ))}
                </ul>
              </NavigationMenuContent>
            </>
          ) : (
            <Link href={menuItem.payload.uri} legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                {menuItem.payload.label}
              </NavigationMenuLink>
            </Link>
          )}
        </NavigationMenuItem>
      ))}
    </>
  );
};

interface MenuItemProps {
  menuItem: {
    id: string;
    payload: { label: string; uri: string; description?: string | null };
    children?: MenuItemProps["menuItem"][];
  };
}

const MenuItem = ({ menuItem }: MenuItemProps) => (
  <li>
    <NavigationMenuLink asChild>
      <Link href={menuItem.payload.uri}>
        <div>
          <div className="text-sm font-medium">{menuItem.payload.label}</div>
          {menuItem.payload.description && (
            <p className="text-muted-foreground text-sm">
              {menuItem.payload.description}
            </p>
          )}
        </div>
      </Link>
    </NavigationMenuLink>
  </li>
);

interface PreheaderProps {
  title: string;
  links: { label: string; uri: string; target: string }[];
}

const Preheader = ({ title, links }: PreheaderProps) => {
  return (
    <div className="flex h-[30px] items-center justify-end sm:justify-between bg-purple-800 px-5 text-sm text-white md:px-10">
      <div className="hidden sm:block">{title}</div>
      <div className="flex gap-4 md:gap-8">
        {links?.map(({ label, uri, target }, i) => {
          return (
            <Link key={i} href={uri} target={target} className="underline">
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const MobileMenuSection = ({ menuItems, onSelect }: MenuSectionProps & { onSelect?: () => void }) => {
  const formattedMenu = formatNodeTree({
    nodes: menuItems.map((item) => ({
      id: item.id,
      parentId: item.parentId!,
      payload: {
        label: item.label,
        uri: item.uri,
        description: item.description,
      },
    })),
    parent: null,
  });

  return (
    <div className="flex flex-col gap-4">
      {formattedMenu.map((menuItem) => (
        <div key={menuItem.id}>
          <Link
            href={menuItem.payload.uri}
            className="text-lg font-medium"
            onClick={onSelect}
          >
            {menuItem.payload.label}
          </Link>
          {menuItem.children && (
            <div className="ml-4 mt-2 flex flex-col gap-2">
              {menuItem.children.map((child) => (
                <Link
                  key={child.id}
                  href={child.payload.uri}
                  className="text-sm text-muted-foreground"
                  onClick={onSelect}
                >
                  {child.payload.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export { Header };

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
import { SearchDrawer } from "./search-drawer";
import { useAuth } from "@/contexts/auth-context";
import { useAppContext } from "@/contexts/app-context";
import config from "@/headkit.config";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Transition } from "@headlessui/react";
import Image from "next/image";

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
  logoUrl?: string | null;
}

function Header({ menus, logoUrl }: Props) {
  const { wishlists } = useAppContext();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
        }))}
      />
      <NavigationMenu
        onValueChange={(val) => {
          setMenuOpen(!!val);
        }}
        className={cn(
          "sticky top-0 flex items-center justify-between h-20 w-full max-w-full z-20 px-5 md:px-10",
          menuOpen ? "bg-white" : "bg-white/80 hover:bg-white backdrop-blur-xs"
        )}
      >
        <Transition show={menuOpen}>
          <div className="fixed inset-0 z-0 top-[130px] bg-black/50 backdrop-blur-xs transition duration-300 ease-in-out data-closed:opacity-0 data-leave:opacity-0" />
        </Transition>

        <NavigationMenuList>
          <NavigationMenuItem className="mr-4 hover:opacity-75">
            <NavigationMenuLink asChild>
              <Link href="/" className="cursor-pointer">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt="Logo"
                    width={0}
                    height={0}
                    className="h-9 w-auto max-w-[160px] md:max-w-[200px]"
                  />
                ) : (
                  <Icon.logo className="h-9 w-auto max-w-[160px] md:max-w-[200px]" />
                )}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <div className="hidden md:flex">
            {primaryMenu && (
              <MenuSection menuItems={primaryMenu.menuItems.nodes} />
            )}
          </div>
        </NavigationMenuList>

        {/* Main Right Menu */}
        <NavigationMenuList className="space-x-0">
          <div className="hidden md:flex">
            {mainRightMenu && (
              <MenuSection menuItems={mainRightMenu.menuItems.nodes} />
            )}
          </div>
          <NavigationMenuItem>
            <SearchDrawer />
          </NavigationMenuItem>
          <NavigationMenuItem>
            <div className="relative">
              <Link href={isAuthenticated ? "/account/wishlist" : "/account"}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:inline-flex pr-0! relative justify-end"
                  aria-label="Wishlist"
                >
                  <Icon.heartOutline className="h-6 w-6 stroke-purple-800 stroke-2 hover:stroke-purple-500" />
                  {isAuthenticated && wishlists.length > 0 && (
                    <span className="absolute right-0 top-[10px] z-10 h-[14px] w-[14px] rounded-full bg-purple-500 text-center text-[12px] font-medium leading-4 text-white">
                      {wishlists.length}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <div className="relative">
              <Link href="/account">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:inline-flex pr-0! relative justify-end"
                  aria-label="Account"
                >
                  <Icon.user className="h-6 w-6 stroke-purple-800 stroke-2 hover:stroke-purple-500" />
                  {isAuthenticated && (
                    <span className="absolute right-0 top-[10px] z-10 h-[14px] w-[14px] rounded-full bg-purple-500 text-center text-[12px] font-medium leading-4 text-white flex items-center justify-center">
                      <Icon.check className="h-2 w-2" />
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <CartDrawer />
          </NavigationMenuItem>
          <NavigationMenuItem className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="pr-0">
                  <Icon.hamburger className="stroke-purple-800 w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetTitle hidden />
                <SheetDescription hidden />
                <nav className="flex flex-col gap-4 mt-20">
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
                  <div className="flex gap-4">
                    <Link
                      href={isAuthenticated ? "/account/wishlist" : "/account"}
                      onClick={() => setOpen(false)}
                    >
                      <div className="relative">
                        <Icon.heartOutline className="h-6 w-6 stroke-purple-800 stroke-2" />
                        {isAuthenticated && wishlists.length > 0 && (
                          <span className="absolute right-0 top-2 z-10 h-[14px] w-[14px] rounded-full bg-purple-500 text-center text-[12px] font-medium leading-4 text-white">
                            {wishlists.length}
                          </span>
                        )}
                      </div>
                    </Link>
                    <Link href="/account" onClick={() => setOpen(false)}>
                      <div className="relative">
                        <Icon.user className="h-6 w-6 stroke-purple-800 stroke-2" />
                        {isAuthenticated && (
                          <span className="absolute right-0 top-[10px] z-10 h-[14px] w-[14px] rounded-full bg-purple-500 text-center text-[12px] font-medium leading-4 text-white">
                            <Icon.check className="h-2 w-2" />
                          </span>
                        )}
                      </div>
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </>
  );
}

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
              <NavigationMenuContent className="w-screen! rounded-none!">
                <ul className="grid gap-5 w-full">
                  {menuItem.children.map((child) => (
                    <MenuItem key={child.id} menuItem={child} />
                  ))}
                </ul>
              </NavigationMenuContent>
            </>
          ) : (
            <NavigationMenuLink
              href={menuItem.payload.uri}
              className={`${navigationMenuTriggerStyle()} ${
                menuItem.payload.uri.replace(/\/$/, "") ===
                config.sale.link.replace(/\/$/, "")
                  ? "text-pink-500!"
                  : ""
              }`}
            >
              {menuItem.payload.label}
            </NavigationMenuLink>
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
      <Link
        href={menuItem.payload.uri}
        className="font-semibold hover:text-purple-500"
      >
        {menuItem.payload.label}
      </Link>
    </NavigationMenuLink>
  </li>
);

interface PreheaderProps {
  title: string;
  links: { label: string; uri: string }[];
}

const Preheader = ({ title, links }: PreheaderProps) => {
  return (
    <div className="flex h-[30px] items-center justify-end sm:justify-between bg-purple-800 px-5 text-sm text-white md:px-10">
      <div className="hidden sm:block">{title}</div>
      <div className="flex gap-4 md:gap-8">
        {links?.map(({ label, uri }, i) => {
          return (
            <Link key={i} href={uri} className="underline">
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const MobileMenuSection = ({
  menuItems,
  onSelect,
}: MenuSectionProps & { onSelect?: () => void }) => {
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
      {formattedMenu.map((menuItem, index) => (
        <div key={index}>
          {menuItem.children && menuItem.children.length > 0 ? (
            <Collapsible>
              <CollapsibleTrigger className="text-xl font-semibold flex w-full justify-between items-center group">
                {menuItem.payload.label}
                <span className="text-xl group-data-[state=open]:hidden">
                  <Icon.chevronDown size={20} />
                </span>
                <span className="text-xl hidden group-data-[state=open]:block rotate-180">
                  <Icon.chevronDown size={20} />
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent className="flex flex-col gap-2">
                {menuItem.children.map((child) => (
                  <Link
                    key={child.id}
                    href={child.payload.uri}
                    className="text-muted-foreground first-of-type:pt-4 text-lg"
                    onClick={onSelect}
                  >
                    {child.payload.label}
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <Link
              href={menuItem.payload.uri}
              className={`text-xl font-semibold ${
                menuItem.payload.uri.replace(/\/$/, "") ===
                config.sale.link.replace(/\/$/, "")
                  ? "text-pink-500"
                  : ""
              }`}
              onClick={onSelect}
            >
              {menuItem.payload.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
};

export { Header };

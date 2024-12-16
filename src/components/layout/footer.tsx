import Link from "next/link";
import { Icon } from "../icon";
import { MenuLocationEnum } from "@/lib/headkit/generated";

interface FooterProps {
  menus: Record<
    MenuLocationEnum,
    {
      name: string;
      menuItems: {
        nodes: {
          id: string;
          label: string;
          uri: string;
          target?: string | null;
        }[];
      };
    }
  >;
}

const Footer = ({ menus }: FooterProps) => {
  const footerMenu = menus[MenuLocationEnum.Footer];
  const footer2Menu = menus[MenuLocationEnum.Footer_2];
  const footerPolicyMenu = menus[MenuLocationEnum.FooterPolicy];

  return (
    <footer className="mt-8 border-t-2 border-t-[#E2E2DF]">
      <div className="container">
        <div className="grid gap-x-24 gap-y-8 py-10 md:grid-cols-3 md:py-14">
          {/* Logo and Description */}
          <div className="flex flex-col justify-between">
            <div className="flex">
              <div className="shrink-0 pr-4">
                <Link href="/" className="mr-4" aria-label="home">
                  <div className="relative h-auto w-full max-w-[60px] hover:opacity-70">
                    <Icon.brandmark className="fill-purple-800" />
                  </div>
                </Link>
              </div>
              <div className="leading-5 text-purple-800">
                HeadKit is the Headless eCommerce Starter Kit for WooCommerce.
                Reduce your time to market building a Headless eCommerce site
                and launch or re-launch with a high-performance modernized
                solution.
              </div>
            </div>
            <div className="mt-4 flex gap-5">
              {["facebook", "instagram", "discord", "linkedin", "youtube"].map(
                (platform, i) => {
                  const IconPlatform = Icon[platform as keyof typeof Icon];
                  return (
                    <a
                      key={i}
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconPlatform
                        size={24}
                        className="fill-purple-800 hover:opacity-70"
                      />
                    </a>
                  );
                }
              )}
            </div>
          </div>

          {/* Footer Menus */}
          <div className="grid grid-cols-2 gap-8 text-purple-800">
            <FooterMenuSection
              title={footerMenu?.name}
              items={footerMenu?.menuItems?.nodes}
            />
            <FooterMenuSection
              title={footer2Menu?.name}
              items={footer2Menu?.menuItems?.nodes}
            />
          </div>

          {/* Payment Icons */}
          <div className="flex flex-col justify-between">
            <div className="mt-4 flex flex-wrap gap-3 md:justify-end">
              {["visa", "mastercard"].map((icon, i) => {
                const IconPayment = Icon[icon as keyof typeof Icon];
                return (
                  <IconPayment
                    key={i}
                    className="h-6 w-auto hover:opacity-70"
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Bottom Section */}
        <div className="py-8 text-sm text-[#76766B]">
          <div className="flex flex-col justify-between md:flex-row">
            <div className="flex flex-col md:flex-row">
              <div className="mb-2 mr-4">© {footerPolicyMenu?.name}</div>
              <div className="mb-2 flex items-center gap-[6px]">
                {footerPolicyMenu?.menuItems?.nodes.map((item) => (
                  <Link
                    className="underline hover:text-purple-500"
                    key={item.id}
                    href={item.uri}
                    target={item.target || "_self"}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              Built with
              <Link
                href="https://www.tigerheart.com/"
                target="_blank"
                aria-label="headkit"
                className="group ml-1 flex"
              >
                <span className="group-hover:text-purple-500 underline">
                  HeadKit
                </span>
                <div className="ml-2">
                  <Icon.brandmark className="h-5 w-5 grayscale group-hover:grayscale-0" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

interface FooterMenuSectionProps {
  title?: string;
  items?: {
    id: string;
    label: string;
    uri: string;
    target?: string | null;
  }[];
}

const FooterMenuSection = ({ title, items }: FooterMenuSectionProps) => (
  <div>
    {title && <div className="mb-[6px] text-lg font-semibold">{title}</div>}
    <div className="flex flex-col justify-center">
      {items?.map((item) => (
        <Link
          className="w-fit hover:underline"
          key={item.id}
          href={item.uri}
          target={item.target || "_self"}
        >
          {item.label}
        </Link>
      ))}
    </div>
  </div>
);

export { Footer };

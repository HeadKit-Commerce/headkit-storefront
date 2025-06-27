import {
  CoreGroup,
  CoreHeading,
  CoreParagraph,
  CoreButton,
  WoocommerceHandpickedProducts,
  WoocommerceProductOnSale,
  WoocommerceProductNew,
  ProductContentFullWithGroupFragment,
} from "@/lib/headkit/generated";

export interface ButtonContent {
  text: string;
  linkTarget: string;
  url: string;
}

export interface BlockContent {
  title: string;
  description: string;
  button: ButtonContent | null;
  products: {
    nodes: ProductContentFullWithGroupFragment[];
  } | null;
}

export interface ProcessedGroup {
  cssClassNames: string[];
  clientId: string;
  section: string;
  content: BlockContent;
}

export const processBlockEditor = (
  blocks: (
    | CoreGroup
    | CoreHeading
    | CoreParagraph
    | CoreButton
    | WoocommerceHandpickedProducts
    | WoocommerceProductOnSale
    | WoocommerceProductNew
  )[]
): ProcessedGroup[] => {
  if (!blocks) {
    return [];
  }
  const result: ProcessedGroup[] = [];
  let currentGroup: ProcessedGroup | null = null;
  let validIds = new Set<string>();

  blocks.forEach((block) => {
    const isCoreGroupWithHeadkitClass =
      block.__typename === "CoreGroup" &&
      block.cssClassNames &&
      block.cssClassNames.some((className) =>
        className?.startsWith("headkit-")
      );

    // If we find a new CoreGroup with headkit class
    if (isCoreGroupWithHeadkitClass) {
      // Push the current group to result if it exists
      if (currentGroup) {
        result.push(currentGroup);
      }

      // Find section class or set default
      const sectionClass =
        block.cssClassNames?.find((className) =>
          className?.startsWith("section-")
        ) || "section-1";

      // Start a new group
      currentGroup = {
        cssClassNames: (block.cssClassNames || []).filter(
          (className): className is string => className !== null
        ),
        clientId: block.clientId || "",
        section: sectionClass,
        content: {
          title: "",
          description: "",
          button: null,
          products: null,
        },
      };

      // Add this group's ID and its immediate children to valid IDs
      validIds = new Set([block.clientId || ""]);
    }
    // For all other blocks
    else if (currentGroup) {
      // Add parent's ID to validIds if it's a direct child of a tracked block
      if (validIds.has(block.parentClientId || "")) {
        validIds.add(block.clientId || "");
      }

      // Process content if block is in our valid tree
      if (validIds.has(block.parentClientId || "")) {
        if (block.__typename === "CoreHeading") {
          currentGroup.content.title = block.attributes?.content || "";
        } else if (block.__typename === "CoreParagraph") {
          currentGroup.content.description += `<p>${block.attributes?.content}</p>`;
        } else if (block.__typename === "CoreButton") {
          currentGroup.content.button = {
            text: block.attributes?.text || "",
            linkTarget: block.attributes?.linkTarget || "",
            url: block.attributes?.url || "",
          };
        }
        // Handle product blocks
        else if (
          ["WoocommerceProductOnSale", "WoocommerceProductNew", "WoocommerceHandpickedProducts"].includes(
            block.__typename!
          ) &&
          (
            block as
              | WoocommerceHandpickedProducts
              | WoocommerceProductOnSale
              | WoocommerceProductNew
          ).products
        ) {
          currentGroup.content.products = {
            nodes:
              (
                block as
                  | WoocommerceHandpickedProducts
                  | WoocommerceProductOnSale
                  | WoocommerceProductNew
              )?.products?.nodes?.filter(
                (node): node is NonNullable<typeof node> =>
                  node !== null && node !== undefined
              ) || [],
          };
        }
      }
    }
  });

  // Push the last group if it exists
  if (currentGroup) {
    result.push(currentGroup);
  }

  return result;
};

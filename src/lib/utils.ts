import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const currencyFormatter = ({
  price,
  lang,
  currency,
}: {
  price: number;
  lang?: string;
  currency?: string;
}) => {
  return new Intl.NumberFormat(lang, {
    style: "currency",
    currency,
  }).format(price);
};

export const getFloatVal = (string: string) => {
  if (!string) return 0;
  return Number(string.split(" ")[0].replace(/[^0-9.-]+/g, ""));
};

export const addAlphaToHex = (hex: string, alpha: number): string => {
  // Convert the alpha value from decimal to hexadecimal
  const alphaHex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");

  // Check if the provided hexadecimal color is in the short format (e.g., #RGB)
  if (hex.length === 4) {
    // Expand the short format to the full format (e.g., #RRGGBB)
    hex = hex.replace(
      /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
      (_, r, g, b) => r + r + g + g + b + b
    );
  }

  // Check if the provided hexadecimal color is in the full format (e.g., #RRGGBB)
  if (hex.length === 7) {
    // Add the alpha component to the color
    return `#${hex.slice(1)}${alphaHex}`;
  }

  // If the provided hexadecimal color is not recognized, return it as is
  return hex;
};

export const removeHtmlTags = (string: string) => {
  // Remove HTML tags
  let sanitizedStr = string.replace(/<\/?[^>]+(>|$)/g, "");
  // Remove escape sequences like \r, \n, \t
  sanitizedStr = sanitizedStr.replace(/[\r\n\t]+/g, "");
  return sanitizedStr;
};

export const formatShippingPrice = (
  shippingTotal: string,
  shippingTax: string,
  pricesIncludeTax?: boolean,
  currency?: string,
  lang?: string
) => {
  return pricesIncludeTax
    ? getFloatVal(shippingTotal) + getFloatVal(shippingTax) === 0
      ? "Free"
      : currencyFormatter({
          price: getFloatVal(shippingTotal) + getFloatVal(shippingTax),
          currency,
          lang,
        })
    : getFloatVal(shippingTotal) === 0
    ? "Free"
    : currencyFormatter({
        price: getFloatVal(shippingTotal),
        currency,
        lang,
      });
};


export const processText = (
  inputText: string
): {
  text: string;
  highlightedText: string;
} => {
  if (!inputText) return { text: "", highlightedText: "" };
  const startDelimiter = "{";
  const endDelimiter = "}";

  const startIndex = inputText.indexOf(startDelimiter);
  const endIndex = inputText.indexOf(endDelimiter);

  if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
    return { text: inputText, highlightedText: "" };
  }

  const text = inputText.substring(0, startIndex).trim();
  const highlightedText = inputText.substring(startIndex + 1, endIndex).trim();

  return { text, highlightedText };
};
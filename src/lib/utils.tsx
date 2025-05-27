import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Icon } from "@/components/icon";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const currencyFormatter = ({
  price,
  lang = "en-AU",
  currency = "AUD",
}: {
  price: number;
  lang?: string;
  currency?: string | null | undefined;
}) => {
  return new Intl.NumberFormat(lang, {
    style: "currency",
    currency: currency || "AUD",
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

interface PaymentMethodDisplay {
  icon: React.ReactNode;
  text: string;
}

export const getPaymentMethodDisplay = (metaData?: Array<{ key: string; value: string }>): PaymentMethodDisplay => {
  try {
    const paymentMethodData = metaData?.find(item => item.key === '_stripe_payment_method')?.value;

    if (!paymentMethodData) {
      return {
        icon: <></>,
        text: "Unknown payment method"
      };
    }

    const paymentMethod = JSON.parse(paymentMethodData);

    // Handle different payment method types
    switch (paymentMethod.type) {
      case 'link':
        return {
          icon: <Icon.stripe className="h-auto w-6 shrink-0" />,
          text: `Stripe Link (${paymentMethod.link.email})`
        };

      case 'card': {
        // Handle different card brands
        const brand = paymentMethod.card?.brand || 'unknown';
        const last4 = paymentMethod.card?.last4 ?? '****';
        
        // Handle different card brands
        const cardIcons = {
          visa: <Icon.visa className="h-auto w-6 shrink-0" />,
          mastercard: <Icon.mastercard className="h-auto w-6 shrink-0" />,
          amex: <Icon.amex className="h-auto w-6 shrink-0" />,
          default: <Icon.stripe className="h-auto w-6 shrink-0" />
        };

        // Check if it's Apple Pay
        if (paymentMethod.card?.wallet?.type === 'apple_pay') {
          return {
            icon: (
              <div className="flex gap-2">
                <Icon.applePay className="h-auto w-6 shrink-0" />
                {cardIcons[brand as keyof typeof cardIcons] || cardIcons.default}
              </div>
            ),
            text: `Apple Pay (${brand} ending in ${last4})`
          };
        }

        return {
          icon: cardIcons[brand as keyof typeof cardIcons] || cardIcons.default,
          text: `${brand.charAt(0).toUpperCase() + brand.slice(1)} ending in ${last4}`
        };
      }

      default:
        return {
          icon: <></>,
          text: `Payment method: ${paymentMethod.type}`
        };
    }
  } catch (error) {
    // Fallback for parsing errors
    console.error("Error parsing payment method data:", error);
    return {
      icon: <></>,
      text: "Invalid payment method data"
    };
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}

/**
 * Converts a string to snake_case
 * @example
 * snakeCase('Hello World') // => 'hello_world'
 * snakeCase('helloWorld') // => 'hello_world'
 * snakeCase('hello-world') // => 'hello_world'
 */
export function snakeCase(str: string): string {
  return str
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1_$2') // Convert camelCase to snake_case
    .replace(/[\s-]+/g, '_') // Replace spaces and hyphens with underscores
    .toLowerCase();
} 

export const removeTrailingSlash = (str: string) => {
  return str.replace(/\/$/, '');
}
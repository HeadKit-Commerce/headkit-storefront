export interface Address {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
}

export interface LineItem {
  databaseId: number;
  quantity: number;
  total: string;
  subtotal: string;
  subtotalTax: string;
  totalTax: string;
  product?: {
    node: {
      title: string;
      id: string;
      productId: number;
      name: string;
      type: string;
      onSale: boolean;
      slug: string;
      image?: {
        sourceUrl: string;
        altText: string;
      };
    };
  };
  variation?: {
    node: {
      attributes?: {
        nodes: Array<{
          id: string;
          label: string;
          name: string;
          value: string;
        }>;
      };
      name: string;
      type: string;
      image?: {
        sourceUrl: string;
        altText: string;
      };
    };
  };
}

// Keep OrderItem for backward compatibility
export interface OrderItem {
  databaseId: number;
  quantity: number;
  total: string;
  product?: {
    node: {
      name: string;
    };
  };
}

export interface Order {
  databaseId: number;
  date: string;
  status: string;
  total: string;
  paymentMethod?: string;
  currency?: string;
  pricesIncludeTax?: boolean;
  shippingTotal?: string;
  shippingTax?: string;
  totalTax?: string;
  discountTotal?: string;
  discountTax?: string;
  subtotal?: string;
  metaData?: Array<{
    key: string;
    value: string;
  }>;
  shippingLines?: {
    nodes: Array<{
      methodTitle: string;
    }>;
  };
  lineItems?: {
    nodes: LineItem[];
  };
  shipping?: Address;
  billing?: Address;
  // Keep these for backward compatibility
  shippingAddress?: Address;
  billingAddress?: Address;
}

export interface WishlistItem {
  databaseId: number;
  product: {
    node: {
      name: string;
      price: string;
      image?: {
        sourceUrl: string;
      };
      link: string;
    };
  };
}

export interface Wishlist {
  databaseId: number;
  items: {
    nodes: WishlistItem[];
  };
  name: string;
  status: string;
} 
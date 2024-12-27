export interface Address {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

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
  lineItems?: {
    nodes: OrderItem[];
  };
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
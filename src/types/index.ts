// Product types
export interface ProductVariant {
  id: string;
  size: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  bestseller?: boolean;
  shortDescription?: string;
  variants?: ProductVariant[];
}

// Cart types
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant: string | null; // Remove undefined from the type
}
  

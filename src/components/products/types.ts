// src/components/products/types.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string | null;
  category: string;
  rating: number;
  reviews: number;
  stock: number;
  bestseller?: boolean;
  featured?: boolean;
  description?: string;
  variants?: Array<{
    id: string;
    size: string;
    price: number;
    stock: number;
    originalPrice?: number;
  }>;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string | null;
}
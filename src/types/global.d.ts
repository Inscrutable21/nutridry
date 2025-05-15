// Define global types for the application

// Product type definition
interface Product {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  rating: number;
  reviews: number;
  stock: number;
  bestseller: boolean;
  featured?: boolean;
  new?: boolean;
  salePrice?: number;
  benefits?: string[];
  features?: string[];
  usageSuggestions?: string[];
  nutritionalInfo?: Record<string, string>;
  specs?: Record<string, string>;
  variants?: SizeVariant[];
}

// Size variant type definition
interface SizeVariant {
  id?: string;
  size: string;
  price: number;
  originalPrice?: number;
  stock: number;
}

// Cart item type definition
interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  variantId?: string;
}

// User type definition
interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
}

// Export types for use in other files
export type { Product, SizeVariant, CartItem, User };

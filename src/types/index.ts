// src/types/index.ts
export interface SizeVariant {
  size: string;
  price: number;
  stock?: number;
}

// Define ProductVariant type
export interface ProductVariant {
  id?: string;
  size: string;
  price: number;
  originalPrice?: number | null;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  price: number; // Default/base price
  sizeVariants?: SizeVariant[]; // Optional size variants with different prices
  variants?: ProductVariant[]; // Now using the defined ProductVariant type
  image: string | null; // Allow null for image
  images?: string[];
  category: string;
  rating: number;
  reviews: number;
  stock: number;
  bestseller?: boolean;
  featured?: boolean;
  new?: boolean;
  description?: string;
  longDescription?: string;
  benefits?: string[];
  features?: string[];
  usageSuggestions?: string[];
  nutritionalInfo?: Record<string, string | number>;
  specs?: Record<string, string | number>;
}

// Export the CartItem type as well for consistency
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string | null;
}
  

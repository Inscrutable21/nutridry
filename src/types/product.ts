// Product schema definition
export interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  stock: number;
  bestseller: boolean;
  featured?: boolean;
  description: string;
  longDescription?: string;
  benefits?: string[];
  nutritionalInfo?: Record<string, string>;
  features?: string[];
  specs?: Record<string, string>;
  usageSuggestions?: string[];
  variants?: Array<{
    id: string;
    size: string;
    price: number;
    originalPrice?: number;
    stock: number;
  }>;
}

// Categories for dropdown selection
export const productCategories = [
  'Fruits',
  'Vegetables',
  'Spices & Herbs',
  'Superfoods',
  'Herbs & Floral',
  'Herbs & Tea',
  'Spices & Seasonings'
];

// src/components/products/ProductGrid.tsx
import ProductCard from './ProductCard'
import { Product } from '@/types/product' // Import the Product type from the correct location

// Create an enhanced product type that matches what ProductCard expects
interface EnhancedProduct extends Product {
  bestseller: boolean; // Ensure this is required
  description: string; // Ensure this is required
  image: string; // Ensure this is a string, not string | null
}

export default function ProductGrid({ products }: { products: Product[] }) {
  // Transform products to ensure all required properties are present
  const enhancedProducts: EnhancedProduct[] = products.map(product => ({
    ...product,
    bestseller: product.bestseller === undefined ? false : product.bestseller,
    description: product.description || '',
    image: product.image || '/placeholder.jpg', // Ensure image is always a string
  }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {enhancedProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

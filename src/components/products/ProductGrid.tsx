// src/components/products/ProductGrid.tsx
import ProductCard from './ProductCard'
import { Product } from '@/types' // Import the Product type

// Create an enhanced product type that matches ProductWithVariants
interface EnhancedProduct extends Product {
  bestseller: boolean; // Ensure this is required
  description: string; // Ensure this is required
}

export default function ProductGrid({ products }: { products: Product[] }) {
  // Transform products to ensure all required properties are present
  const enhancedProducts: EnhancedProduct[] = products.map(product => ({
    ...product,
    bestseller: product.bestseller === undefined ? false : product.bestseller,
    description: product.description || '',
  }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {enhancedProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

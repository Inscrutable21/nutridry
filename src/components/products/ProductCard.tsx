// src/components/products/ProductCard.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/types/product';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  // Find the minimum price variant if variants exist
  const getMinPriceVariant = () => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce(
        (prev, current) => (prev.price < current.price ? prev : current),
        product.variants[0]
      );
    }
    return null;
  };
  
  // Get the minimum price variant
  const minPriceVariant = getMinPriceVariant();
  
  return (
    <div 
      className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative h-64 bg-gray-100">
          {product.image ? (
            <Image 
              src={product.image} 
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400">No image</span>
            </div>
          )}
          
          {product.bestseller && (
            <span className="absolute top-2 left-2 bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded-md">
              Bestseller
            </span>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
        <div className="flex items-center">
          <span className="text-amber-600 font-medium">
            ₹{minPriceVariant ? minPriceVariant.price.toFixed(2) : product.price.toFixed(2)}
          </span>
          {minPriceVariant?.originalPrice && (
            <>
              <span className="text-gray-500 text-sm line-through ml-2">
                ₹{minPriceVariant.originalPrice.toFixed(2)}
              </span>
              <span className="text-green-600 text-xs ml-2">
                {Math.round((1 - minPriceVariant.price / minPriceVariant.originalPrice) * 100)}% off
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

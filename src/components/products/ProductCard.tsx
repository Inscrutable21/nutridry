// src/components/products/ProductCard.tsx
'use client'

import { memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import customImageLoader from '@/lib/image-loader'
import { toast } from 'react-hot-toast'

// Explicitly type the product parameter
const ProductCard = memo(function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart()
  
  // Precompute values to avoid recalculations during render
  const productUrl = `/products/${product.id}`
  const imageUrl = product.image || '/placeholder.jpg'
  const formattedPrice = product.price.toFixed(2)
  
  const handleAddToCart = () => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || '/placeholder.jpg',
      quantity: 1,
      variant: product.variants && product.variants.length > 0 ? product.variants[0].size : null
    }
    
    addToCart(cartItem)
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md h-full flex flex-col product-card">
      <Link href={productUrl} className="block relative aspect-square overflow-hidden">
        <Image 
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform hover:scale-105"
          loader={customImageLoader}
          loading="lazy"
          priority={false}
        />
        {product.bestseller && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded">
            Bestseller
          </span>
        )}
      </Link>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
          {product.shortDescription || product.category}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <span className="font-semibold text-gray-900 dark:text-white">
            ₹{product.price.toLocaleString()}
          </span>
          <button 
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
              toast.success(`${product.name} added to cart`);
            }}
            className="p-2 text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-full transition-colors"
            aria-label="Add to cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
})

// Add this default export
export default ProductCard

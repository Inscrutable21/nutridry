// src/components/products/ProductCard.tsx
'use client'

import { memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import customImageLoader from '@/lib/image-loader'

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
    <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md h-full flex flex-col">
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
      
      <div className="p-3 flex-grow flex flex-col justify-between">
        <div>
          <Link href={productUrl} className="block">
            <h3 className="text-gray-800 font-medium text-sm mb-1 hover:text-green-600 transition-colors truncate">
              {product.name}
            </h3>
          </Link>
          
          <div className="flex items-center mb-2">
            <div className="flex text-amber-400 mr-1">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i} 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                  stroke="currentColor"
                  className="w-3 h-3"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500">({product.reviews})</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-auto">
          <span className="text-amber-600 font-medium">
            ₹{formattedPrice}
          </span>
          
          <button 
            onClick={handleAddToCart}
            className="text-green-600 hover:text-green-700 p-1"
            aria-label={`Add ${product.name} to cart`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
})

export default ProductCard

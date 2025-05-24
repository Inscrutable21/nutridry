'use client'

import { memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import customImageLoader from '@/lib/image-loader'

// A more compact version of ProductCard specifically for the homepage
const HomeProductCard = memo(function HomeProductCard({ product }: { product: any }) {
  const { addToCart } = useCart()
  
  const productUrl = `/products/${product.id}`  // Changed from /product/ to /products/
  const imageUrl = product.image || '/placeholder.jpg'
  const formattedPrice = product.price.toFixed(2)
  
  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || '/placeholder.jpg',
      quantity: 1,
      variant: product.variants && product.variants.length > 0 ? product.variants[0].size : null
    })
  }
  
  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden transition-all hover:shadow-md h-full flex flex-col max-w-[262px]">
      <Link href={productUrl} className="block relative aspect-square overflow-hidden">
        <Image 
          src={imageUrl}
          alt={product.name}
          fill
          sizes="262px"
          className="object-cover transition-transform hover:scale-105"
          loader={customImageLoader}
          loading="lazy"
        />
      </Link>
      
      <div className="p-4 flex-grow flex flex-col justify-between">
        <Link href={productUrl} className="block">
          <h3 className="text-gray-800 font-medium text-base leading-tight mb-2.5 hover:text-green-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex justify-between items-center mt-3.5">
          <span className="text-gray-900 font-medium text-lg">₹{formattedPrice}</span>
          
          <button 
            onClick={handleAddToCart}
            className="text-green-600 hover:text-green-700 p-1.5"
            aria-label={`Add ${product.name} to cart`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
})

export default HomeProductCard






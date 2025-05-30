'use client'

import { memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import customImageLoader from '@/lib/image-loader'
import { toast } from 'react-hot-toast'
import { CartItem } from '@/types/index'

// A more compact version of ProductCard specifically for the homepage
const HomeProductCard = memo(function HomeProductCard({ product }: { product: any }) {
  const { addToCart } = useCart()
  
  const productUrl = `/products/${product.id}`
  const imageUrl = product.image || '/placeholder.jpg'
  const formattedPrice = `₹${product.price.toFixed(2)}`

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    
    // Get the latest price from variants if available
    const currentPrice = product.variants && product.variants.length > 0
      ? product.variants[0].price
      : product.price;
    
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: currentPrice,
      image: product.image || '/placeholder.jpg',
      quantity: 1,
      variant: product.variants && product.variants.length > 0 ? product.variants[0].size : null
    }
    
    addToCart(cartItem);
    
    toast.success(`${product.name} added to cart`);
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm overflow-hidden transition-all hover:shadow-md h-full flex flex-col max-w-[262px] product-card">
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
        {product.bestseller && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded">
            Bestseller
          </span>
        )}
      </Link>
      
      <div className="p-4 flex-grow flex flex-col justify-between">
        <Link href={productUrl} className="block">
          <h3 className="text-gray-800 dark:text-white font-medium text-base leading-tight mb-2.5 hover:text-green-600 dark:hover:text-green-500 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex justify-between items-center mt-3.5">
          <span className="text-gray-900 dark:text-white font-medium text-lg">₹{formattedPrice}</span>
          
          <button 
            onClick={handleAddToCart}
            className="text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 p-1.5"
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








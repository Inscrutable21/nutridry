'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/products/ProductCard'
import { Product } from '@/types' // Import the Product type
import useSWR from 'swr'

// Define a type that matches ProductWithVariants
interface EnhancedProduct extends Product {
  bestseller: boolean; // Ensure this is required, not optional
  description: string; // Ensure this is required, not optional
  image: string; // Change from string | null to just string
  variants?: {
    id: string; // Make id required, not optional
    size: string;
    price: number;
    originalPrice?: number; // Remove null type to match Product type
    stock: number;
  }[];
}

// Define the fetcher function with proper typing
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
})

export default function TopProducts() {
  const [activeCategory, setActiveCategory] = useState('All')
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const [showLeftButton, setShowLeftButton] = useState(false)
  const [showRightButton, setShowRightButton] = useState(true)
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchEndX, setTouchEndX] = useState(0)

  // Fallback products in case of API failure
  const getFallbackProducts = (): EnhancedProduct[] => {
    return [
      {
        id: '1',
        name: 'Dried Amla',
        description: 'Premium quality dried amla with natural goodness.',
        price: 12.99,
        image: '/products/1.jpg',
        category: 'Fruits',
        rating: 4.5,
        reviews: 24,
        bestseller: true,
        stock: 15
      },
      {
        id: '2',
        name: 'Organic Wheatgrass',
        description: 'Pure organic wheatgrass packed with nutrients.',
        price: 14.99,
        image: '/products/2.jpg',
        category: 'Superfoods',
        rating: 4.8,
        reviews: 32,
        bestseller: true,
        stock: 20
      },
      {
        id: '3',
        name: 'Dehydrated Red Onion Flakes',
        description: 'Conveniently sliced and dehydrated red onion flakes.',
        price: 9.49,
        image: '/products/3.jpg',
        category: 'Vegetables',
        rating: 4.2,
        reviews: 18,
        bestseller: true,
        stock: 25
      }
    ];
  };
  
  // Use SWR for data fetching with caching
  const { data, error: swrError, isLoading } = useSWR<{products: Product[]}>('/api/products?bestseller=true&limit=8', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 120000, // 2 minutes
    fallbackData: { products: getFallbackProducts() } // Your fallback data
  })

  // Transform the data to ensure all required properties are present
  const transformedProducts: EnhancedProduct[] = data?.products.map(product => ({
    ...product,
    bestseller: product.bestseller === undefined ? true : product.bestseller, // Default to true for top products
    description: product.description || '', // Default to empty string
    image: product.image || '/placeholder.jpg', // Ensure image is always a string
    variants: product.variants?.map(variant => ({
      ...variant,
      id: variant.id || `${product.id}-${variant.size}`, // Ensure id is always set
      originalPrice: variant.originalPrice === null ? undefined : variant.originalPrice // Convert null to undefined
    })),
  })) || [];

  // Use the transformed data
  const products = transformedProducts;
  const error = swrError ? swrError.message : null;

  const categories = ['All', ...new Set(products.map(product => product.category))];

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(product => product.category === activeCategory);
  
  // Check if scroll buttons should be shown
  useEffect(() => {
    const checkScrollButtons = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
        setShowLeftButton(scrollLeft > 0)
        setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10)
      }
    }
    
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollButtons)
      window.addEventListener('resize', checkScrollButtons)
      checkScrollButtons()
      
      return () => {
        container.removeEventListener('scroll', checkScrollButtons)
        window.removeEventListener('resize', checkScrollButtons)
      }
    }
  }, [])
  
  // Scroll handlers
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8
      scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    }
  }
  
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }
  
  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX)
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX)
  }
  
  const handleTouchEnd = () => {
    if (touchStartX - touchEndX > 150) {
      // Swipe left
      scrollRight()
    }
    
    if (touchStartX - touchEndX < -150) {
      // Swipe right
      scrollLeft()
    }
  }
  
  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-playfair text-center mb-4">Bestsellers</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8">
            Our most popular products that customers love.
          </p>
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bestsellers...</p>
        </div>
      </section>
    )
  }
  
  if (error && filteredProducts.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-playfair text-center mb-4">Bestsellers</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-4">
            Our most popular products that customers love.
          </p>
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </section>
    )
  }
  
  if (filteredProducts.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-playfair text-center mb-4">Bestsellers</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Our most popular products that customers love.
          </p>
          <p className="text-center text-gray-500">No bestseller products found in this category.</p>
        </div>
      </section>
    )
  }
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl md:text-4xl font-playfair text-center mb-4">Bestsellers</h2>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8">
          Our most popular products that customers love.
        </p>
        
        {/* Category filters */}
        <div className="flex justify-center mb-8 overflow-x-auto pb-2">
          <div className="flex space-x-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  activeCategory === category
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Error notification if using fallback data */}
        {error && (
          <div className="mb-6 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm text-center">
            {error}
          </div>
        )}
        
        {/* Product slider */}
        <div className="relative" ref={sliderRef}>
          {/* Left scroll button */}
          {showLeftButton && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white w-10 h-10 rounded-full shadow-md md:flex items-center justify-center text-gray-600 hover:text-amber-600 border border-gray-200 -ml-5 focus:outline-none focus:ring-2 focus:ring-amber-500 hidden"
              aria-label="Scroll left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar snap-x"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {filteredProducts.map(product => (
              <div key={product.id} className="min-w-[280px] sm:min-w-[320px] flex-shrink-0 snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          
          {/* Right scroll button */}
          {showRightButton && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white w-10 h-10 rounded-full shadow-md md:flex items-center justify-center text-gray-600 hover:text-amber-600 border border-gray-200 -mr-5 focus:outline-none focus:ring-2 focus:ring-amber-500 hidden"
              aria-label="Scroll right"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
        
        {/* View all button */}
        <div className="text-center mt-8">
          <Link href="/products" className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-full transition-colors inline-flex items-center space-x-2">
            <span>View All Bestsellers</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

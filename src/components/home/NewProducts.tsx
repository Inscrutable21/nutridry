'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/products/ProductCard'

// Update the Product interface to match ProductWithVariants
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  stock: number;
  bestseller: boolean; // Changed from optional to required
  featured?: boolean;
  new?: boolean;
  description: string; // Changed from optional to required
  variants?: Array<{
    id: string;
    size: string;
    price: number;
    stock: number;
    originalPrice?: number;
  }>;
  salePrice?: number;
}

export default function NewProducts() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftButton, setShowLeftButton] = useState(false)
  const [showRightButton, setShowRightButton] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  
  // Fetch new arrivals (featured products) from API
  useEffect(() => {
    const fetchNewArrivals = async () => {
      if (retryCount > 2) {
        // Fall back to static data after 3 retries
        setProducts(getFallbackProducts());
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Add cache busting to prevent stale responses
        const cacheBuster = new Date().getTime();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // Increase to 15-second timeout
        
        const response = await fetch(`/api/products?featured=true&limit=6&cacheBust=${cacheBuster}`, {
          signal: controller.signal,
          // Add cache control headers
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch new arrivals: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.products && data.products.length > 0) {
          // Ensure all required properties are set
          const productsWithDefaults = data.products.map((product: any) => ({
            ...product,
            bestseller: product.bestseller === undefined ? false : product.bestseller,
            description: product.description || '', // Set default empty string for description
            // Add any other required properties that might be undefined
          }));
          setProducts(productsWithDefaults);
          setError(null);
        } else {
          // If no products returned, use fallback data
          setProducts(getFallbackProducts());
        }
      } catch (err) {
        console.error('Error fetching new arrivals:', err);
        
        // Check specifically for timeout/abort errors
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            setError('Request timed out. Loading limited product selection.');
            setRetryCount(prev => prev + 1);
            
            // After first timeout, use fallback data but keep trying in background
            setProducts(getFallbackProducts());
          } else {
            setError('Failed to load new arrivals');
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewArrivals();
  }, [retryCount]);
  
  // Function to check if scroll buttons should be shown
  const checkScrollButtons = () => {
    if (!scrollContainerRef.current) return
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setShowLeftButton(scrollLeft > 0)
    setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10)
  }
  
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollButtons)
      window.addEventListener('resize', checkScrollButtons)
      
      // Initial check
      checkScrollButtons()
      
      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollButtons)
        window.removeEventListener('resize', checkScrollButtons)
      }
    }
  }, [])
  
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollContainer = scrollContainerRef.current
      const scrollDistance = scrollContainer.clientWidth * 0.8
      scrollContainer.scrollBy({ left: -scrollDistance, behavior: 'smooth' })
    }
  }
  
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollContainer = scrollContainerRef.current
      const scrollDistance = scrollContainer.clientWidth * 0.8
      scrollContainer.scrollBy({ left: scrollDistance, behavior: 'smooth' })
    }
  }
  
  // Fallback products in case of API failure
  const getFallbackProducts = (): Product[] => {
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
        featured: true,
        bestseller: false, // Explicitly set bestseller
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
        featured: true,
        bestseller: false, // Explicitly set bestseller
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
        featured: true,
        bestseller: false, // Explicitly set bestseller
        stock: 25
      }
    ];
  };
  
  // Add a function to ensure all products have required properties
  const ensureRequiredProps = (products: any[]): Product[] => {
    return products.map(product => ({
      ...product,
      bestseller: product.bestseller === undefined ? false : product.bestseller,
      description: product.description || '',
      // Add any other required properties
    }));
  };
  
  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h2 className="text-3xl md:text-4xl font-playfair mb-2">New Arrivals</h2>
              <p className="text-gray-600 font-serif">The latest additions to our collection</p>
            </div>
            
            <Link href="/products" className="px-4 py-2 text-sm border border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white rounded-full transition-colors hidden md:block">
              View All Products
            </Link>
          </div>
          
          <div className="flex justify-center">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    )
  }
  
  if (error && products.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h2 className="text-3xl md:text-4xl font-playfair mb-2">New Arrivals</h2>
              <p className="text-gray-600 font-serif">The latest additions to our collection</p>
            </div>
          </div>
          <p className="text-center text-red-500 mb-4">{error}</p>
          <div className="text-center">
            <button 
              onClick={() => setRetryCount(prev => prev + 1)} 
              className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    )
  }
  
  if (products.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h2 className="text-3xl md:text-4xl font-playfair mb-2">New Arrivals</h2>
              <p className="text-gray-600 font-serif">The latest additions to our collection</p>
            </div>
          </div>
          <p className="text-center text-gray-500">No new arrivals found at the moment.</p>
        </div>
      </section>
    )
  }
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h2 className="text-3xl md:text-4xl font-playfair mb-2">New Arrivals</h2>
            <p className="text-gray-600 font-serif">The latest additions to our collection</p>
          </div>
          
          <Link href="/products" className="px-4 py-2 text-sm border border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white rounded-full transition-colors">
            View All Products
          </Link>
        </div>
        
        {/* Mobile view - show error as notification if we're using fallback data */}
        {error && (
          <div className="mb-4 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm text-center md:block lg:hidden">
            {error}
          </div>
        )}
        
        <div className="relative">
          {/* Scroll button - left */}
          {showLeftButton && (
            <button
              onClick={scrollLeft}
              className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md ${
                showLeftButton ? 'block' : 'hidden'
              }`}
              aria-label="Scroll left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          {/* Product slider */}
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar snap-x"
          >
            {products.map((product) => (
              <div key={product.id} className="min-w-[280px] sm:min-w-[320px] flex-shrink-0 snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          
          {/* Scroll button - right */}
          {showRightButton && (
            <button
              onClick={scrollRight}
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md ${
                showRightButton ? 'block' : 'hidden'
              }`}
              aria-label="Scroll right"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Mobile-only view all link */}
        <div className="mt-8 text-center md:hidden">
          <Link href="/products" className="px-6 py-2 text-sm bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  )
}

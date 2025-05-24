'use client'

import { useState, useEffect, useRef } from 'react'
import HomeProductCard from '@/components/products/HomeProductCard'
import { Product } from '@/types'
import Link from 'next/link'

export default function NewProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftButton, setShowLeftButton] = useState(false)
  const [showRightButton, setShowRightButton] = useState(true)

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
    const fetchNewArrivals = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      try {
        const cacheBuster = process.env.NODE_ENV === 'development' ? `&cacheBust=${Date.now()}` : '';
        
        // Use Promise.race for timeout instead of setTimeout + abort
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            if (isMounted) {
              reject(new Error('Request timeout'));
            }
          }, 15000);
        });
        
        // Race between the fetch and the timeout
        const response = await Promise.race([
          fetch(`/api/products?featured=true&limit=6${cacheBuster}`, {
            signal: controller.signal,
            next: { revalidate: 3600 }
          }),
          timeoutPromise
        ]) as Response;
        
        if (!isMounted) return;
        
        if (!response.ok) {
          throw new Error(`Failed to fetch new arrivals: ${response.status}`);
        }
        
        const data = await response.json() as { products: Product[] };
        if (!isMounted) return;
        
        setProducts(data.products || []);
      } catch (error) {
        if (!isMounted) return;
        console.error('Error fetching new arrivals:', error);
        setError('Failed to load new products');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchNewArrivals();
    
    // Cleanup function
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [retryCount]);

  // Use products directly in your component rendering
  // No need for enhancedProducts variable

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
  
  // Scroll functions
  const scrollLeft = () => {
    if (!scrollContainerRef.current) return
    
    const container = scrollContainerRef.current
    container.scrollBy({ left: -300, behavior: 'smooth' })
  }
  
  const scrollRight = () => {
    if (!scrollContainerRef.current) return
    
    const container = scrollContainerRef.current
    container.scrollBy({ left: 300, behavior: 'smooth' })
  }
  
  // Removed the unused ensureRequiredProps function
  
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
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
  
  // Transform products to ensure all required properties are present
  const displayProducts = products.map(product => ({
    ...product,
    bestseller: product.bestseller === undefined ? false : product.bestseller,
    description: product.description || '',
    image: product.image || '/placeholder.jpg', // Ensure image is always a string
  }));

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">New Arrivals</h2>
          <Link href="/products/new" className="text-green-600 hover:text-green-700 font-medium">
            View All
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="relative">
            <button 
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-50"
              aria-label="Scroll left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto space-x-6 pb-4 snap-x"
            >
              {displayProducts.map((product) => (
                <div key={product.id} className="min-w-[262px] flex-shrink-0 snap-start">
                  <HomeProductCard product={product} />
                </div>
              ))}
            </div>
            
            <button 
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-50"
              aria-label="Scroll right"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

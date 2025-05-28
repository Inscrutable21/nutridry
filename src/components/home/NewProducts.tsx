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
        
        const data = await response.json();
        
        if (!isMounted) return;
        
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
          setError(null);
        } else {
          setProducts([]);
          setError("No new arrivals found");
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error("Error fetching new arrivals:", err);
        setError(err.message || "Failed to load new arrivals");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchNewArrivals();
    
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [retryCount]);
  
  // Add the handleScroll function
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };
  
  // Function to scroll left
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  // Function to scroll right
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  // Check scroll buttons visibility on mount and when products change
  useEffect(() => {
    if (scrollContainerRef.current) {
      handleScroll();
    }
  }, [products]);
  
  const displayProducts = products.slice(0, 6);
  
  return (
    <section className="py-12 new-arrivals-section">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">New Arrivals</h2>
          <Link href="/products/new" className="text-green-600 hover:text-green-700 font-medium">
            View All
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-100 dark:bg-gray-800 rounded-lg h-80 animate-pulse product-card">
                <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-t-lg"></div>
                <div className="p-4">
                  <div className="bg-gray-200 dark:bg-gray-700 h-4 w-3/4 mb-2 rounded"></div>
                  <div className="bg-gray-200 dark:bg-gray-700 h-4 w-1/2 mb-4 rounded"></div>
                  <div className="bg-gray-200 dark:bg-gray-700 h-6 w-1/3 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            {showLeftButton && (
              <button 
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-md rounded-full p-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Scroll left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto scrollbar-hide gap-4 pb-4 scroll-smooth"
              onScroll={handleScroll}
            >
              {displayProducts.map(product => (
                <div key={product.id} className="min-w-[250px] flex-shrink-0 product-card">
                  <HomeProductCard product={product} />
                </div>
              ))}
            </div>
            
            {showRightButton && (
              <button 
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-md rounded-full p-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Scroll right"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

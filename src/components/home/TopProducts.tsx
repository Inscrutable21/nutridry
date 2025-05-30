'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import HomeProductCard from '@/components/products/HomeProductCard'
import { Product } from '@/types'

export default function TopProducts() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const [showLeftButton, setShowLeftButton] = useState(false)
  const [showRightButton, setShowRightButton] = useState(true)
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchEndX, setTouchEndX] = useState(0)

  // Fetch bestseller products from API
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
    const fetchBestsellers = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      try {
        const cacheBuster = process.env.NODE_ENV === 'development' ? `&cacheBust=${Date.now()}` : '';
        
        // Increased timeout to 15 seconds
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            if (isMounted) {
              reject(new Error('Request timeout'));
            }
          }, 15000); // Increased to 15 seconds
        });
        
        // Race between the fetch and the timeout
        const response = await Promise.race([
          fetch(`/api/products?bestseller=true&limit=6${cacheBuster}`, {
            signal: controller.signal,
            next: { revalidate: 3600 }
          }),
          timeoutPromise
        ]) as Response;

        if (!isMounted) return;

        if (!response.ok) {
          throw new Error(`Failed to fetch bestsellers: ${response.status}`);
        }

        const data = await response.json();
        if (!isMounted) return;
        
        if (data.products && data.products.length > 0) {
          const productsWithDefaults = data.products.slice(0, 6).map((product: any) => ({
            ...product,
            bestseller: true,
            description: product.description || '',
            image: product.image || '/placeholder.jpg',
            category: product.category || 'Default',
            rating: product.rating || 0,
            reviews: product.reviews || 0,
            stock: product.stock || 0
          }));
          
          setProducts(productsWithDefaults);
          setError(null);
        } else {
          setProducts([]);
          setError("No bestseller products found");
        }
      } catch (err) {
        if (!isMounted) return;
        
        console.error('Error fetching bestsellers:', err);
        setError('Unable to load bestsellers at this time');
        setProducts([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchBestsellers();
    
    // Cleanup function
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [])

  // Filter products based on active category
  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(product => product.category === activeCategory)

  // Get unique categories from products
  const categories = ['All', ...new Set(products.map(product => product.category))]

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
  
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setShowLeftButton(scrollLeft > 0)
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  if (isLoading) {
    return (
      <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-playfair text-center mb-4 text-gray-900 dark:text-white">Bestsellers</h2>
          <p className="text-gray-600 dark:text-gray-300 text-center max-w-2xl mx-auto mb-8">
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
      <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-playfair text-center mb-4 text-gray-900 dark:text-white">Bestsellers</h2>
          <p className="text-gray-600 dark:text-gray-300 text-center max-w-2xl mx-auto mb-4">
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
      <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-playfair text-center mb-4 text-gray-900 dark:text-white">Bestsellers</h2>
          <p className="text-gray-600 dark:text-gray-300 text-center max-w-2xl mx-auto mb-12">
            Our most popular products that customers love.
          </p>
          <p className="text-center text-gray-500">No bestseller products found in this category.</p>
        </div>
      </section>
    )
  }
  
  return (
    <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl md:text-4xl font-playfair text-center mb-4 text-gray-900 dark:text-white">Bestsellers</h2>
        <p className="text-gray-600 dark:text-gray-300 text-center max-w-2xl mx-auto mb-8">
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
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Remove any border-bottom, hr, or divider that might be here */}
        
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
            className="flex overflow-x-auto scrollbar-hide gap-4 pb-4 scroll-smooth snap-x"
            onScroll={handleScroll}
          >
            {filteredProducts.map(product => (
              <div key={product.id} className="min-w-[300px] w-[300px] flex-shrink-0 snap-start">
                <HomeProductCard product={product} />
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

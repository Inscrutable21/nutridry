'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import ProductCard from '@/components/products/ProductCard';
import { useInView } from 'react-intersection-observer';

// Update the Product type to match ProductWithVariants
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  stock: number;
  bestseller: boolean;
  featured?: boolean;
  new?: boolean;
  description: string;
  variants?: Array<{
    id: string;
    size: string;
    price: number;
    stock: number;
    originalPrice?: number;
  }>;
  salePrice?: number;
}

const categories = ['All', 'Fruits', 'Vegetables', 'Spices & Herbs', 'Superfoods', 'Herbs & Floral', 'Herbs & Tea', 'Spices & Seasonings']
const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' }
]

// Create a client component that uses useSearchParams
function ProductsContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')
  
  const [activeCategory, setActiveCategory] = useState(categoryParam || 'All')
  const [sortBy, setSortBy] = useState('featured')
  
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [filterOpen, setFilterOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const { ref: loadMoreRef, inView } = useInView()

  // Add retry mechanism for failed requests
  const retryFetch = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  // Reset retry count when category changes
  useEffect(() => {
    setRetryCount(0);
  }, [activeCategory]);

  // Retry effect
  useEffect(() => {
    if (retryCount > 0) {
      fetchProducts(page);
    }
  }, [retryCount]);

  // Fetch products from API
  const fetchProducts = useCallback(async (pageNum = 1) => {
    let isMounted = true;
    const controller = new AbortController();
    
    if (pageNum === 1) setIsLoading(true);
    try {
      // Build the API URL with query parameters - reduce limit for faster loading
      let url = `/api/products?limit=12&page=${pageNum}&`; // Reduced from 20 to 12 for faster loading
      if (activeCategory !== 'All') {
        url += `category=${encodeURIComponent(activeCategory)}&`;
      }
      
      // Add cache busting parameter only in development
      if (process.env.NODE_ENV === 'development') {
        url += `cacheBust=${Date.now()}`;
      }
      
      // Reduced timeout to 10 seconds
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          if (isMounted) {
            reject(new Error('Request timeout'));
          }
        }, 10000); // Reduced from 15000 to 10000
      });
      
      const response = await Promise.race([
        fetch(url, {
          signal: controller.signal,
          next: { revalidate: 3600 }
        }),
        timeoutPromise
      ]) as Response;
      
      if (!isMounted) return;
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json() as { products: Product[], pagination: any };
      if (!isMounted) return;
      
      if (pageNum === 1) {
        setProducts(data.products || []);
      } else {
        setProducts(prev => [...prev, ...data.products]);
      }
      
      // Check if we have more products to load
      setHasMore(data.pagination.page < data.pagination.pages);
      setError(null);
      
    } catch (err) {
      if (!isMounted) return;
      
      console.error('Error fetching products:', err);
      setError('Unable to load products at this time. Please try again later.');
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
    
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [activeCategory]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
    setPage(1);
    fetchProducts(1);
    
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [activeCategory, fetchProducts]);

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage);
    }
  }, [inView, hasMore, isLoading, fetchProducts]); // Remove 'page' from dependencies
  
  // Filter products by price range
  const filteredProducts = products.filter(product => {
    const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
    return priceMatch;
  });
  
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'rating':
        return b.rating - a.rating
      default: // 'featured'
        if (a.bestseller && !b.bestseller) return -1
        if (!a.bestseller && b.bestseller) return 1
        return b.rating - a.rating
    }
  })
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={retryFetch}
          className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <>
      {/* Filters and Sort Section */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Categories - Mobile Friendly */}
        <div className={`lg:w-1/4 ${filterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 categories-sidebar">
            <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Categories</h2>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                    activeCategory === category
                      ? 'bg-amber-500 text-white dark:bg-amber-600'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {/* Price Filter */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 categories-sidebar">
            <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Price Range</h2>
            {/* ...existing price filter... */}
          </div>
        </div>
        
        {/* Products Grid */}
        <div className="lg:w-3/4">
          {/* Sort Controls with Filter Toggle */}
          <div className="flex justify-between items-center mb-6 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
            <div className="flex items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
            
            {/* Mobile Filter Toggle - Improved */}
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="lg:hidden px-3 py-2 bg-amber-500 text-white rounded-md text-sm flex items-center"
            >
              <span>{filterOpen ? 'Hide Filters' : 'Show Filters'}</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>
            </button>
          </div>
          
          {/* Products Grid */}
          {error ? (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md mb-6">
              {error}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 p-4 rounded-md">
              No products found matching your criteria. Try adjusting your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          {/* Load More */}
          {hasMore && !error && (
            <div ref={loadMoreRef} className="flex justify-center mt-8">
              {isLoading && (
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Main component that wraps the content with Suspense
export default function ProductsPage() {
  return (
    <div className="pt-24 pb-16 bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 md:px-6">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-playfair mb-2 text-gray-900 dark:text-white">Shop Our Collection</h1>
          <p className="text-gray-600 dark:text-gray-300">Discover our premium dehydrated fruits and vegetables designed for healthy living.</p>
        </header>
        
        <Suspense fallback={<div className="flex justify-center py-10 text-gray-600 dark:text-gray-300">Loading products...</div>}>
          <ProductsContent />
        </Suspense>
      </div>
      
      {/* Add mobile-specific styles */}
      <style jsx global>{`
        @media (max-width: 1024px) {
          .categories-sidebar {
            margin-bottom: 1rem;
            border-radius: 0.5rem;
            overflow: hidden;
          }
          
          .categories-sidebar button {
            padding: 0.75rem 1rem;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  )
}

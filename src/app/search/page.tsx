'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductGrid from '@/components/products/ProductGrid'
import Link from 'next/link'

// Define a type for the product structure
type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  stock: number;
  bestseller?: boolean;
  featured?: boolean;
  description?: string;
  createdAt?: string; // Add this optional property
}

// Create a client component that uses useSearchParams
function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [sortBy, setSortBy] = useState('featured')
  
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' }
  ]
  
  // Update the fetchSearchResults function in the useEffect
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setSearchResults([])
        return
      }
      
      setIsLoading(true)
      setError(null)
      
      try {
        // Use the search query parameter directly in the API call
        const response = await fetch(`/api/products?q=${encodeURIComponent(query)}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        
        const data = await response.json()
        setSearchResults(data.products)
      } catch (err) {
        console.error('Error searching products:', err)
        setError('Failed to search products. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSearchResults()
  }, [query])
  
  // Sort search results
  const sortedResults = [...searchResults].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        // Handle case when createdAt might be undefined
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default: // 'featured'
        if (a.bestseller && !b.bestseller) return -1;
        if (!a.bestseller && b.bestseller) return 1;
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
    }
  })

  // Ensure all products have required properties before passing to ProductGrid
  const enhancedProducts = sortedResults.map(product => ({
    ...product,
    bestseller: product.bestseller === undefined ? false : product.bestseller,
    description: product.description || '',
    image: product.image || '/placeholder.jpg'
  }));  
  
  const categories = ['Fruits', 'Vegetables', 'Spices & Herbs', 'Superfoods', 'Herbs & Floral', 'Herbs & Tea']
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }
  
  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-playfair mb-2">Search Results</h1>
        {query ? (
          <p className="text-gray-600">
            {searchResults.length} results for &ldquo;{query}&rdquo;
          </p>
        ) : (
          <p className="text-gray-600">
            Please enter a search term to find products
          </p>
        )}
      </header>
      
      {searchResults.length > 0 ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-600">Showing {sortedResults.length} products</p>
            
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-2 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-amber-600"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <ProductGrid products={enhancedProducts} />
        </>
      ) : query ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h2 className="mt-4 text-2xl font-medium text-gray-900">No results found</h2>
          <p className="mt-2 text-gray-600 max-w-md mx-auto mb-6">
            We couldn&apos;t find any products matching &ldquo;{query}&rdquo;. Try different keywords or browse our categories.
          </p>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Browse Categories</h3>
            <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
              {categories.map(category => (
                <Link 
                  key={category}
                  href={`/products?category=${category}`} 
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-800 transition-colors"
                >
                  {category}
                </Link>
              ))}
              <Link href="/products" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-full transition-colors">
                All Products
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h2 className="mt-4 text-xl font-medium text-gray-900">Search for products</h2>
          <p className="mt-2 text-gray-600 max-w-md mx-auto">
            Enter a search term in the search box above to find products from our collection of premium dehydrated fruits and vegetables.
          </p>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Popular Searches</h3>
            <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
              <Link href="/search?q=amla" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-800 transition-colors">
                Amla
              </Link>
              <Link href="/search?q=leaf" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-800 transition-colors">
                Leaf
              </Link>
              <Link href="/search?q=flakes" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-800 transition-colors">
                Flakes
              </Link>
              <Link href="/search?q=dried" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-800 transition-colors">
                Dried
              </Link>
              <Link href="/search?q=dehydrated" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-800 transition-colors">
                Dehydrated
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Main page component with Suspense boundary
export default function SearchPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <Suspense fallback={<div className="flex justify-center py-10">Loading search results...</div>}>
          <SearchContent />
        </Suspense>
      </div>
    </div>
  )
}
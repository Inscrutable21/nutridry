"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import React from 'react'
import ProductCard from '@/components/products/ProductCard'

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
  const [products, setProducts] = useState<Product[]>([]) // Add type annotation
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null) // Add type annotation
  
  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam)
    }
  }, [categoryParam])
  
  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Build the API URL with query parameters
        let url = '/api/products?limit=100&'; // Increase limit to show all products
        if (activeCategory !== 'All') {
          url += `category=${encodeURIComponent(activeCategory)}&`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        
        // Ensure all required properties are set
        interface ProductData {
          id: string;
          name: string;
          price: number;
          image?: string;
          category: string;
          rating?: number;
          reviews?: number;
          stock?: number;
          bestseller?: boolean;
          featured?: boolean;
          description?: string;
          variants?: Array<{
            id: string;
            size: string;
            price: number;
            stock?: number;
            originalPrice?: number;
          }>;
          // Add other specific properties you need
          [key: string]: unknown; // Use unknown instead of any for safety
        }

        const productsWithDefaults = data.products.map((product: ProductData) => ({
          ...product,
          bestseller: product.bestseller === undefined ? false : product.bestseller,
          description: product.description || '', // Set default empty string for description
          // Add any other required properties that might be undefined
        }));
        
        setProducts(productsWithDefaults);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory]);
  
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
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Filters - Desktop */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-24 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="font-medium text-lg mb-4">Filters</h2>
          
          <div className="mb-6">
            <h3 className="font-medium mb-3">Categories</h3>
            <ul className="space-y-2">
              {categories.map(category => (
                <li key={category}>
                  <button
                    onClick={() => setActiveCategory(category)}
                    className={`text-sm ${
                      activeCategory === category 
                        ? 'text-amber-600 font-medium' 
                        : 'text-gray-700 hover:text-amber-600'
                    }`}
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium mb-3">Price Range</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">₹{priceRange[0]}</span>
              <span className="text-sm text-gray-600">₹{priceRange[1]}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
          </div>
          
          <button className="w-full py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-md transition-colors text-sm">
            Apply Filters
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-grow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center mb-4 sm:mb-0 lg:hidden px-4 py-2 border border-gray-300 rounded-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
            </svg>
            Filters
          </button>
          
          <div className="flex items-center ml-auto">
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
        
        {/* Mobile Filters */}
        {filterOpen && (
          <div className="lg:hidden bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
            <div className="mb-4">
              <h3 className="font-medium mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      activeCategory === category 
                        ? 'bg-amber-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium mb-3">Price Range</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">₹{priceRange[0]}</span>
                <span className="text-sm text-gray-600">₹{priceRange[1]}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
            </div>
            
            <button 
              className="w-full py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-md transition-colors text-sm"
              onClick={() => setFilterOpen(false)}
            >
              Apply Filters
            </button>
          </div>
        )}
        
        <p className="text-sm text-gray-600 mb-6">Showing {sortedProducts.length} products</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Main component that wraps the content with Suspense
export default function ProductsPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-playfair mb-2">Shop Our Collection</h1>
          <p className="text-gray-600">Discover our premium dehydrated fruits and vegetables designed for healthy living.</p>
        </header>
        
        <Suspense fallback={<div className="flex justify-center py-10">Loading products...</div>}>
          <ProductsContent />
        </Suspense>
      </div>
    </div>
  )
}

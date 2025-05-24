"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductList from '@/components/admin/ProductList';
import AdminHeader from '@/components/admin/AdminHeader';

export default function BestsellersPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/products?bestseller=true&limit=100');
      if (!response.ok) {
        throw new Error('Failed to fetch bestseller products');
      }
      const data = await response.json();
      setProducts(data.products);
    } catch (err) {
      console.error('Error fetching bestseller products:', err);
      setError('Failed to load bestseller products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Bestseller Products</h1>
          <Link 
            href="/admin/products" 
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
          >
            All Products
          </Link>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading bestseller products...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <button 
                onClick={fetchProducts}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <ProductList products={products} onRefresh={fetchProducts} />
          )}
        </div>
      </main>
    </div>
  );
}

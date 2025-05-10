'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductList from '@/components/admin/ProductList';
import AdminHeader from '@/components/admin/AdminHeader';

export default function NewArrivalsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/products?featured=true');
      if (!response.ok) {
        throw new Error('Failed to fetch featured products');
      }
      const data = await response.json();
      console.log('Featured products response:', data); // Add this debug line
      setProducts(data.products);
    } catch (err) {
      console.error('Error fetching featured products:', err);
      setError('Failed to load featured products. Please try again.');
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
          <h1 className="text-2xl font-bold">New Arrivals</h1>
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
              <p className="text-gray-500">Loading new arrivals...</p>
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
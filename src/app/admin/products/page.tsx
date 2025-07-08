"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductList from '@/components/admin/ProductList';
import AdminHeader from '@/components/admin/AdminHeader';
import ExcelProductUploader from '@/components/admin/ExcelProductUploader';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Add cache-busting parameter to prevent stale cache issues
      const cacheBuster = new Date().getTime();
      const response = await fetch(`/api/products?limit=100&cacheBust=${cacheBuster}`, {
        // Set longer timeout
        signal: AbortSignal.timeout(30000)
      });
      
      // Parse the response data first
      const data = await response.json();
      
      // Then check if the response was ok
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }
      
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      let errorMessage = 'Failed to fetch products';
      
      if (error instanceof Error) {
        if (error.name === 'TimeoutError' || error.name === 'AbortError') {
          errorMessage = 'Request timed out. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-retry on timeout, with backoff
  useEffect(() => {
    if (error && error.includes('timed out') && retryCount < 2) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        fetchProducts();
      }, 3000 * (retryCount + 1)); // Exponential backoff
      
      return () => clearTimeout(timer);
    }
  }, [error, retryCount]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRetry = () => {
    setRetryCount(0);
    fetchProducts();
  };

  const toggleBulkUpload = () => {
    setShowBulkUpload(!showBulkUpload);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold dark:text-white">Products</h1>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={toggleBulkUpload}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              {showBulkUpload ? 'Hide Bulk Upload' : 'Bulk Upload'}
            </button>
            <Link 
              href="/admin/products/new" 
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors"
            >
              Add New Product
            </Link>
          </div>
        </div>
        
        {showBulkUpload && (
          <div className="mb-6">
            <ExcelProductUploader />
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-800/30 rounded-lg p-4 sm:p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 dark:border-emerald-400 mb-3"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading products...</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">This may take a moment</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 dark:text-red-400">{error}</p>
              <button 
                onClick={handleRetry}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <ProductList products={products} onProductsChange={fetchProducts} />
          )}
        </div>
      </main>
    </div>
  );
}
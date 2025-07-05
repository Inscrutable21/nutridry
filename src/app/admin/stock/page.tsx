'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Variant {
  id: string;
  size: string;
  stock: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string;
    category: string;
  };
}

export default function StockManagement() {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [editingVariant, setEditingVariant] = useState<string | null>(null);
  const [stockValue, setStockValue] = useState<number>(0);
  const [updateStatus, setUpdateStatus] = useState('');

  useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    // Don't show loading indicator on manual refresh if data is already there
    if (variants.length === 0) {
        setLoading(true);
    }
    setError('');
    
    try {
      // Add a timestamp to bust any potential intermediate caches
      const response = await fetch(`/api/stock?t=${Date.now()}`);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Server responded with status: ${response.status}`);
      }
      
      if (!data.variants) {
        throw new Error('Invalid response format: missing variants data');
      }
      
      setVariants(data.variants);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError('Failed to load stock data: ' + message);
      console.error('Error fetching stock data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (variantId: string) => {
    if (isUpdating) return; // Prevent double clicks
    
    setIsUpdating(true);
    setError('');
    setUpdateStatus('');

    try {
      const response = await fetch('/api/stock/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variantId,
          stock: stockValue
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to update stock on the server.');
      }
      
      // KEY FIX: Refetch data from server to ensure UI is in sync
      await fetchStockData(); 
      
      setUpdateStatus(data.message || 'Stock updated successfully');
      setEditingVariant(null);
      
      setTimeout(() => setUpdateStatus(''), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to update stock: ${message}`);
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredVariants = variants.filter(variant => 
    variant.product.name.toLowerCase().includes(filter.toLowerCase()) ||
    variant.product.category.toLowerCase().includes(filter.toLowerCase()) ||
    variant.size.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Stock Management</h1>
        <button 
          onClick={fetchStockData}
          disabled={loading || isUpdating}
          className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Refreshing...' : 'Refresh Stock'}
        </button>
      </div>
      
      {updateStatus && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {updateStatus}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Filter by product name, category or size..."
          className="w-full md:w-1/2 px-4 py-2 border rounded-md"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size/Variant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVariants.map((variant) => (
                <tr key={variant.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 relative">
                        <Image
                          src={variant.product.image || '/placeholder.jpg'}
                          alt={variant.product.name}
                          fill
                          className="object-cover rounded-md"
                          sizes="40px"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{variant.product.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {variant.product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {variant.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{variant.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingVariant === variant.id ? (
                      <input
                        type="number"
                        min="0"
                        value={stockValue}
                        onChange={(e) => setStockValue(parseInt(e.target.value, 10) || 0)}
                        className="w-20 px-2 py-1 border rounded-md"
                        autoFocus
                      />
                    ) : (
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        variant.stock > 10 
                          ? 'bg-green-100 text-green-800' 
                          : variant.stock > 0 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {variant.stock}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingVariant === variant.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateStock(variant.id)}
                          className="text-green-600 hover:text-green-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                          disabled={isUpdating}
                        >
                          {isUpdating ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditingVariant(null)}
                          className="text-gray-600 hover:text-gray-900 disabled:text-gray-400"
                          disabled={isUpdating}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingVariant(variant.id);
                          setStockValue(variant.stock);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400"
                        disabled={isUpdating}
                      >
                        Edit Stock
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
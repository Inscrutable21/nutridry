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
    setLoading(true);
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

  const handleEditStock = (variant: Variant) => {
    setEditingVariant(variant.id);
    setStockValue(variant.stock);
  };

  const handleUpdateStock = async (variantId: string) => {
    if (stockValue < 0) {
      setError('Stock cannot be negative');
      return;
    }
    
    setIsUpdating(true);
    setError('');

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

  const handleCancelEdit = () => {
    setEditingVariant(null);
  };

  const filteredVariants = variants.filter(variant => {
    const searchTerm = filter.toLowerCase();
    return (
      variant.product.name.toLowerCase().includes(searchTerm) ||
      variant.product.category.toLowerCase().includes(searchTerm) ||
      variant.size.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Stock Management</h1>
        <button 
          onClick={fetchStockData}
          disabled={loading || isUpdating}
          className="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 bg-amber-500 text-white text-sm rounded-md hover:bg-amber-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Refreshing...' : 'Refresh Stock'}
        </button>
      </div>
      
      {updateStatus && (
        <div className="bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded mb-4 text-sm">
          {updateStatus}
        </div>
      )}
      
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Filter by product name, category or size..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
      </div>
      
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredVariants.length === 0 ? (
        <div className="bg-gray-800 text-white p-6 rounded-lg text-center">
          <p className="text-lg">No variants found</p>
          <p className="text-gray-300 mt-2">Try adjusting your filter or add product variants.</p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg shadow-md overflow-hidden">
          {/* Mobile view */}
          <div className="block md:hidden">
            {filteredVariants.map((variant) => (
              <div key={variant.id} className="p-4 border-b border-gray-700 last:border-b-0">
                <div className="flex items-center mb-3">
                  <div className="h-12 w-12 relative flex-shrink-0">
                    <Image
                      src={variant.product.image || '/placeholder.jpg'}
                      alt={variant.product.name}
                      fill
                      className="object-cover rounded-md"
                      sizes="48px"
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-white">{variant.product.name}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-700 text-white">
                        {variant.product.category}
                      </span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-700 text-white">
                        Size: {variant.size}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <span className="text-xs text-gray-300">Price:</span>
                    <p className="text-sm text-white">₹{variant.price.toFixed(2)}</p>
                  </div>
                  
                  <div>
                    {editingVariant === variant.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          value={stockValue}
                          onChange={(e) => setStockValue(parseInt(e.target.value, 10) || 0)}
                          className="w-16 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded-md text-white"
                        />
                        <button
                          onClick={() => handleUpdateStock(variant.id)}
                          disabled={isUpdating}
                          className="p-1 bg-green-600 text-white rounded-md text-xs"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 bg-red-600 text-white rounded-md text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          variant.stock > 10 ? 'bg-green-900 text-green-200' : 
                          variant.stock > 0 ? 'bg-yellow-900 text-yellow-200' : 
                          'bg-red-900 text-red-200'
                        }`}>
                          {variant.stock}
                        </span>
                        <button
                          onClick={() => handleEditStock(variant)}
                          className="p-1 bg-blue-600 text-white rounded-md text-xs"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredVariants.map((variant) => (
                  <tr key={variant.id} className="bg-gray-900 hover:bg-gray-800">
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
                          <div className="text-sm font-medium text-white">{variant.product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {variant.product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {variant.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      ₹{variant.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingVariant === variant.id ? (
                        <input
                          type="number"
                          min="0"
                          value={stockValue}
                          onChange={(e) => setStockValue(parseInt(e.target.value, 10) || 0)}
                          className="w-20 px-2 py-1 border rounded-md bg-gray-700 border-gray-600 text-white"
                          autoFocus
                        />
                      ) : (
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          variant.stock > 10 
                            ? 'bg-green-900 text-green-200' 
                            : variant.stock > 0 
                              ? 'bg-yellow-900 text-yellow-200' 
                              : 'bg-red-900 text-red-200'
                        }`}>
                          {variant.stock}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {editingVariant === variant.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateStock(variant.id)}
                            disabled={isUpdating}
                            className={`px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 ${
                              isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {isUpdating ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditStock(variant)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
        </div>
      )}
    </div>
  );
}


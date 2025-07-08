// Force dark mode styling for the admin product list
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Product = {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  image: string;
  category: string;
  stock: number;
  bestseller: boolean;
  featured: boolean;
};

type ProductListProps = {
  products: Product[];
  showActions?: boolean;
  onRefresh?: () => void;
  onProductsChange?: () => Promise<void>;
};

export default function ProductList({ products, showActions = true, onRefresh, onProductsChange }: ProductListProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setIsDeleting(id);
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete product');
        }

        if (onProductsChange) {
          await onProductsChange();
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const toggleBestseller = async (id: string, currentValue: boolean) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bestseller: !currentValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      if (onProductsChange) {
        await onProductsChange();
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
    }
  };

  const toggleFeatured = async (id: string, currentValue: boolean) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featured: !currentValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      if (onProductsChange) {
        await onProductsChange();
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-800 text-white rounded-md">
        <p>No products found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* Mobile view (visible on small screens) */}
      <div className="md:hidden space-y-4">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="p-4 rounded-lg shadow-sm bg-gray-800 text-white"
          >
            <div className="flex items-center mb-3">
              <div className="h-12 w-12 relative flex-shrink-0">
                <Image
                  src={product.image || '/placeholder.png'}
                  alt={product.name}
                  fill
                  className="rounded-md object-cover"
                />
              </div>
              <div className="ml-3 flex-1">
                <Link href={`/admin/products/${product.id}`} className="font-medium text-white hover:text-green-400">
                  {product.name}
                </Link>
                <p className="text-sm text-gray-300">{product.category}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm">
                  ₹{product.price.toFixed(2)}
                </div>
                {product.salePrice && (
                  <div className="text-xs text-red-400">
                    Sale: ₹{product.salePrice.toFixed(2)}
                  </div>
                )}
              </div>
              <div>
                <span
                  className={`text-sm font-medium ${
                    product.stock > 10
                      ? 'text-green-400'
                      : product.stock > 0
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}
                >
                  {product.stock}
                </span>
              </div>
            </div>
            
            {showActions && (
              <div className="flex flex-wrap gap-2 mt-3">
                <Link 
                  href={`/admin/products/${product.id}`}
                  className="px-2 py-1 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Edit
                </Link>
                <button
                  onClick={() => toggleBestseller(product.id, product.bestseller)}
                  className={`px-2 py-1 text-xs rounded-md ${
                    product.bestseller
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  Bestseller
                </button>
                <button
                  onClick={() => toggleFeatured(product.id, product.featured)}
                  className={`px-2 py-1 text-xs rounded-md ${
                    product.featured
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  New Arrival
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  disabled={isDeleting === product.id}
                  className={`px-2 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700 ${
                    isDeleting === product.id ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isDeleting === product.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop view (visible on medium screens and up) */}
      <table className="min-w-full hidden md:table border-separate border-spacing-0">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider rounded-tl-lg">
              Product
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Category
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Price
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Stock
            </th>
            {showActions && (
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Status
              </th>
            )}
            {showActions && (
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider rounded-tr-lg">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr 
              key={product.id} 
              className={`bg-gray-900 hover:bg-gray-800 ${
                index === products.length - 1 ? 'last-row' : ''
              }`}
            >
              {/* Product column */}
              <td className="px-4 py-4 whitespace-nowrap text-white">
                <div className="flex items-center">
                  <div className="h-10 w-10 relative flex-shrink-0">
                    <Image
                      src={product.image || '/placeholder.png'}
                      alt={product.name}
                      fill
                      className="rounded-md object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <Link href={`/admin/products/${product.id}`} className="text-sm font-medium text-white hover:text-green-400">
                      {product.name}
                    </Link>
                  </div>
                </div>
              </td>
              
              {/* Category column */}
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-700 text-white">
                  {product.category}
                </span>
              </td>
              
              {/* Price column */}
              <td className="px-4 py-4 whitespace-nowrap text-white">
                <div className="text-sm">
                  ₹{product.price.toFixed(2)}
                </div>
                {product.salePrice && (
                  <div className="text-xs text-red-400">
                    Sale: ₹{product.salePrice.toFixed(2)}
                  </div>
                )}
              </td>
              
              {/* Stock column */}
              <td className="px-4 py-4 whitespace-nowrap">
                <span
                  className={`text-sm font-medium ${
                    product.stock > 10
                      ? 'text-green-400'
                      : product.stock > 0
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}
                >
                  {product.stock}
                </span>
              </td>
              
              {/* Status column */}
              {showActions && (
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleBestseller(product.id, product.bestseller)}
                      className={`px-2 py-1 text-xs rounded-md ${
                        product.bestseller
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-700 text-white'
                      }`}
                    >
                      Bestseller
                    </button>
                    <button
                      onClick={() => toggleFeatured(product.id, product.featured)}
                      className={`px-2 py-1 text-xs rounded-md ${
                        product.featured
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-white'
                      }`}
                    >
                      New Arrival
                    </button>
                  </div>
                </td>
              )}
              
              {/* Actions column */}
              {showActions && (
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <Link 
                      href={`/admin/products/${product.id}`}
                      className="px-2 py-1 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={isDeleting === product.id}
                      className={`px-2 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700 ${
                        isDeleting === product.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isDeleting === product.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <style jsx>{`
        .last-row td:first-child {
          border-bottom-left-radius: 0.5rem;
        }
        .last-row td:last-child {
          border-bottom-right-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
}

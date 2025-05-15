// src/components/admin/ProductList.tsx
'use client';

import { useState } from 'react';
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
  onProductsChange?: () => Promise<void>; // Add this line to support the prop used in admin page
};

export default function ProductList({ products, showActions = true, onRefresh, onProductsChange }: ProductListProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setIsDeleting(id);
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete product');
        }

        // Use onProductsChange if provided, otherwise fall back to onRefresh or router.refresh
        if (onProductsChange) {
          await onProductsChange();
        } else if (onRefresh) {
          onRefresh();
        } else {
          router.refresh();
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Update the toggleBestseller and toggleFeatured functions similarly
  const toggleBestseller = async (id: string, currentValue: boolean) => {
    try {
      // Try PATCH first, then fall back to PUT if needed
      let response;
      try {
        response = await fetch(`/api/products/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bestseller: !currentValue }),
        });
        
        if (response.status === 405) {
          // If PATCH is not allowed, try PUT
          throw new Error('Method not allowed');
        }
      } catch (patchError) {
        // Fall back to PUT if PATCH fails
        console.log('PATCH failed, trying PUT instead:', 
          patchError instanceof Error ? patchError.message : String(patchError));
        response = await fetch(`/api/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id,
            bestseller: !currentValue,
            // We need to include these required fields for PUT
            name: 'placeholder', 
            description: 'placeholder',
            category: 'placeholder'
          }),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      if (onProductsChange) {
        await onProductsChange();
      } else if (onRefresh) {
        onRefresh();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating product:', error instanceof Error ? error.message : String(error));
      alert('Failed to update product. Please try again.');
    }
  };

  const toggleFeatured = async (id: string, currentValue: boolean) => {
    try {
      console.log(`Toggling featured for product ${id} from ${currentValue} to ${!currentValue}`);
      
      // Try PATCH first, then fall back to PUT if needed
      let response;
      try {
        response = await fetch(`/api/products/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ featured: !currentValue }),
        });
        
        if (response.status === 405) {
          // If PATCH is not allowed, try PUT
          throw new Error('Method not allowed');
        }
      } catch (patchError) {
        // Fall back to PUT if PATCH fails
        console.log('PATCH failed, trying PUT instead:', 
          patchError instanceof Error ? patchError.message : String(patchError));
        response = await fetch(`/api/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id,
            featured: !currentValue,
            // We need to include these required fields for PUT
            name: 'placeholder', 
            description: 'placeholder',
            category: 'placeholder'
          }),
        });
      }
  
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
  
      const updatedProduct = await response.json();
      console.log('Updated product:', updatedProduct);
  
      if (onProductsChange) {
        await onProductsChange();
      } else if (onRefresh) {
        onRefresh();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating product:', error instanceof Error ? error.message : String(error));
      alert('Failed to update product. Please try again.');
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-md">
        <p className="text-gray-500">No products found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock
            </th>
            {showActions && (
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            )}
            {showActions && (
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="px-4 py-4 whitespace-nowrap">
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
                    <Link href={`/admin/products/${product.id}`} className="text-sm font-medium text-gray-900 hover:text-green-600">
                      {product.name}
                    </Link>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                  {product.category}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                {product.salePrice ? (
                  <div>
                    <span className="text-sm text-gray-900">₹{product.salePrice}</span>
                    <span className="ml-2 text-xs text-gray-500 line-through">₹{product.price}</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-900">₹{product.price}</span>
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span
                  className={`text-sm ${
                    product.stock > 10
                      ? 'text-green-800'
                      : product.stock > 0
                      ? 'text-amber-600'
                      : 'text-red-600'
                  }`}
                >
                  {product.stock}
                </span>
              </td>
              {showActions && (
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleBestseller(product.id, product.bestseller)}
                      className={`px-2 py-1 text-xs rounded-md ${
                        product.bestseller
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Bestseller
                    </button>
                    <button
                      onClick={() => toggleFeatured(product.id, product.featured)}
                      className={`px-2 py-1 text-xs rounded-md ${
                        product.featured
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      New Arrival
                    </button>
                  </div>
                </td>
              )}
              {showActions && (
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={isDeleting === product.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
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
    </div>
  );
}

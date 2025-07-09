'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function CancelledOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCancelledOrders = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/orders?status=cancelled');
        
        if (!response.ok) {
          throw new Error('Failed to fetch cancelled orders');
        }
        
        const data = await response.json();
        setOrders(data.orders);
      } catch (error) {
        console.error('Error fetching cancelled orders:', error);
        setError('Failed to load cancelled orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCancelledOrders();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Cancelled Orders</h1>
        <Link 
          href="/admin/orders" 
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-sm transition-colors text-white"
        >
          Back to All Orders
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-900 p-4 rounded-lg text-white">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-gray-800 text-white p-6 rounded-lg text-center">
          <p className="text-lg">No cancelled orders found</p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-800">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {format(new Date(order.createdAt), 'MMM d, yyyy • h:mm a')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{order.user.name}</div>
                      <div className="text-xs text-gray-400">{order.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      ₹{order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <Link 
                        href={`/admin/orders/${order.id}`}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        View Details
                      </Link>
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
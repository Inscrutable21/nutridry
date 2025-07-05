'use client';

import { useState, useEffect, useRef } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';

// Define types for our data
interface DashboardStats {
  productCount: number;
  featuredCount: number;
  bestsellerCount: number;
}

interface OrderUser {
  name: string | null;
  email: string;
  mobile?: string;
}

interface Order {
  id: string;
  user: OrderUser | null;
  createdAt: string;
  total: number;
  status: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    productCount: 0,
    featuredCount: 0,
    bestsellerCount: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Create an AbortController for this effect run.
    // It will be used to cancel the fetch request if the component unmounts.
    const controller = new AbortController();

    const fetchDashboardData = async () => {
      setIsLoading(true);
      
      // Helper function for fallback logic to avoid repetition
      const loadFallbackData = () => {
        try {
          const cachedData = localStorage.getItem('dashboard-stats');
          if (cachedData) {
            setStats(JSON.parse(cachedData));
            setError('Using cached data. Failed to load fresh data');
          } else {
            setError('Failed to load dashboard data');
          }
        } catch (cacheError) {
          setError('Failed to load dashboard data');
        }
      };

      try {
        const results = await Promise.allSettled([
          fetch('/api/admin/dashboard-stats', {
            signal: controller.signal, // Pass the signal to the fetch request
            headers: { 'Cache-Control': 'no-store' }
          }).then(res => {
            if (!res.ok) throw new Error(`Stats API returned ${res.status}`);
            return res.json();
          })
        ]);

        // **FIX:** After any `await`, check if the component has unmounted.
        // If it has, the signal will be aborted, and we must not proceed
        // to set state, which would cause a React warning.
        if (controller.signal.aborted) {
          return;
        }
        
        // Process stats result
        if (results[0].status === 'fulfilled') {
          setStats(results[0].value);
          setError(''); // Clear any previous errors on success
        } else {
          // **FIX:** This block is now only reached for genuine errors, not aborts.
          // The error message "Component unmounted" will no longer be logged.
          console.error('Stats request failed:', results[0].reason);
          loadFallbackData();
        }
      } catch (error) {
        // This catch block is for unexpected errors. We still check the abort signal.
        if (!controller.signal.aborted) {
          console.error('Dashboard error:', error);
          loadFallbackData();
        }
      } finally {
        // Only update loading state if the component is still mounted.
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchDashboardData();
    
    // **FIX:** The cleanup function simply aborts the controller.
    // This will cancel the fetch request if it's still in flight.
    return () => {
      controller.abort();
    };
  }, []);

  // Save stats to localStorage when they change
  useEffect(() => {
    if (stats.productCount > 0) {
      try {
        localStorage.setItem('dashboard-stats', JSON.stringify(stats));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    }
  }, [stats]);

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMM yyyy, hh:mm a');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
              <p className="text-yellow-700">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-yellow-600 hover:text-yellow-800"
              >
                Try again
              </button>
            </div>
            
            {/* Still show stats if we have them from cache */}
            {stats.productCount > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-semibold text-gray-700">Products</h2>
                  <p className="text-3xl font-bold mt-2">{stats.productCount}</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-semibold text-gray-700">Featured Products</h2>
                  <p className="text-3xl font-bold mt-2">{stats.featuredCount}</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-semibold text-gray-700">Bestsellers</h2>
                  <p className="text-3xl font-bold mt-2">{stats.bestsellerCount}</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-700">Products</h2>
              <p className="text-3xl font-bold mt-2">{stats.productCount}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-700">Featured Products</h2>
              <p className="text-3xl font-bold mt-2">{stats.featuredCount}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-700">Bestsellers</h2>
              <p className="text-3xl font-bold mt-2">{stats.bestsellerCount}</p>
            </div>
          </div>
        )}
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/admin/products/new"
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-lg text-center transition-colors"
            >
              Add New Product
            </Link>
            <Link
              href="/admin/products"
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center transition-colors"
            >
              Manage Products
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <ShoppingBag size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Recent Orders</h3>
                <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">
                  View all
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin h-8 w-8 border-4 border-green-500 rounded-full border-t-transparent"></div>
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent orders</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 text-left">Order ID</th>
                    <th className="py-3 px-4 text-left">Customer</th>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Total</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4">{order.id.slice(0, 8)}</td>
                      <td className="py-3 px-4">{order.user?.name || 'N/A'}</td>
                      <td className="py-3 px-4">{formatDate(order.createdAt)}</td>
                      <td className="py-3 px-4">₹{order.total.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/admin/orders/${order.id}`} className="text-blue-600 hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
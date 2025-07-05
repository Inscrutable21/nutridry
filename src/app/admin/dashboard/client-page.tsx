'use client';

import { useEffect, useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ClientDashboard() {
  const [stats, setStats] = useState({
    productCount: 0,
    featuredCount: 0,
    bestsellerCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Set initial loading state
    setLoading(true);
    
    // Create an AbortController to cancel the request if it takes too long
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/admin/dashboard-stats', {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (res.status === 401) {
          router.push('/admin/login');
          return;
        }
        
        if (!res.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await res.json();
        setStats(data);
      } catch (error: unknown) {
        console.error('Dashboard error:', error);
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            setError('Request timed out. Using cached data.');
            // Try to get cached data from localStorage
            const cachedData = localStorage.getItem('dashboard-stats');
            if (cachedData) {
              try {
                setStats(JSON.parse(cachedData));
              } catch (e) {
                console.error('Error parsing cached data:', e);
              }
            }
          } else {
            setError(`Failed to load dashboard data: ${error.message}`);
          }
        } else {
          setError('Failed to load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      // Only abort if the controller is not already aborted
      if (!controller.signal.aborted) {
        controller.abort();
      }
    };
  }, [router]);

  // Save stats to localStorage when they change
  useEffect(() => {
    if (stats.productCount > 0) {
      localStorage.setItem('dashboard-stats', JSON.stringify(stats));
    }
  }, [stats]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Try again
            </button>
          </div>
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
      </main>
    </div>
  );
}

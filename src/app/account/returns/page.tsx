'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

type Return = {
  id: string;
  orderId: string;
  reason: string;
  description?: string;
  images: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
};

export default function ReturnsPage() {
  const { isAuthenticated, loading } = useAuth();
  const [returns, setReturns] = useState<Return[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      fetchReturns();
    }
  }, [loading, isAuthenticated]);

  const fetchReturns = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/returns');
      
      if (!response.ok) {
        throw new Error('Failed to fetch returns');
      }
      
      const data = await response.json();
      setReturns(data.returns);
    } catch (error) {
      console.error('Error fetching returns:', error);
      toast.error('Failed to load returns');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: 'bg-yellow-500', text: 'Pending Verification' },
      approved: { color: 'bg-green-500', text: 'Approved' },
      rejected: { color: 'bg-red-500', text: 'Rejected' },
      completed: { color: 'bg-blue-500', text: 'Completed' },
    };
    
    const { color, text } = statusMap[status] || { color: 'bg-gray-500', text: status };
    
    return (
      <span className={`${color} text-white text-xs px-2 py-1 rounded-full`}>
        {text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Please log in to view your returns</h2>
          <Link 
            href="/login" 
            className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Returns</h1>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : returns.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">No Returns Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">You haven't requested any returns yet.</p>
          <Link 
            href="/account/orders" 
            className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            View My Orders
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {returns.map((returnItem) => (
            <div 
              key={returnItem.id} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Return #{returnItem.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Requested on {format(new Date(returnItem.createdAt), 'MMM d, yyyy')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      For Order #{returnItem.orderId.slice(0, 8)}
                    </p>
                  </div>
                  <div>
                    {getStatusBadge(returnItem.status)}
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Reason for Return</h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {returnItem.reason === 'wrong_item' ? 'Wrong Item Received' : 
                     returnItem.reason === 'defective' ? 'Defective Product' : 
                     returnItem.reason === 'other' ? 'Other Reason' : returnItem.reason}
                  </p>
                  {returnItem.description && (
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      {returnItem.description}
                    </p>
                  )}
                </div>
                
                {returnItem.images.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Uploaded Images</h4>
                    <div className="flex space-x-4">
                      {returnItem.images.map((image, index) => (
                        <div key={index} className="relative h-24 w-24 rounded-md overflow-hidden">
                          <Image 
                            src={image} 
                            alt={`Return image ${index + 1}`} 
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-6">
                  <Link 
                    href={`/account/returns/${returnItem.id}`}
                    className="text-amber-500 hover:text-amber-600 font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
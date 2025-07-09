'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

type Return = {
  id: string;
  orderId: string;
  userId: string;
  reason: string;
  description?: string;
  images: string[];
  status: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
  };
};

export default function AdminReturnDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const returnId = params.id;
  
  const [returnData, setReturnData] = useState<Return | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchReturnDetails();
  }, [returnId]);

  const fetchReturnDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/returns/${returnId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch return details');
      }
      
      const data = await response.json();
      setReturnData(data.return);
      setAdminNotes(data.return.adminNotes || '');
    } catch (error) {
      console.error('Error fetching return details:', error);
      toast.error('Failed to load return details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/admin/returns/${returnId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          adminNotes,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update return status');
      }
      
      toast.success(`Return ${newStatus} successfully`);
      fetchReturnDetails();
    } catch (error) {
      console.error('Error updating return status:', error);
      toast.error('Failed to update return status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'wrong_item': return 'Wrong Item Received';
      case 'defective': return 'Defective Product';
      case 'other': return 'Other Reason';
      default: return reason;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!returnData) {
    return (
      <div className="p-6">
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-white mb-2">Return not found</h3>
          <p className="text-gray-400 mb-4">The requested return could not be found.</p>
          <Link 
            href="/admin/returns" 
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors"
          >
            Back to Returns
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">
          Return #{returnData.id.slice(0, 8)}
        </h1>
        <Link 
          href="/admin/returns" 
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors text-sm"
        >
          Back to Returns
        </Link>
      </div>
      
      <div className="bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm text-gray-400">
                Requested on {format(new Date(returnData.createdAt), 'MMM d, yyyy')}
              </p>
              <p className="text-sm text-gray-400">
                Last updated on {format(new Date(returnData.updatedAt), 'MMM d, yyyy')}
              </p>
            </div>
            <div>
              <span className={`
                px-2 py-1 text-xs rounded-full
                ${returnData.status === 'pending' ? 'bg-yellow-500 text-white' : ''}
                ${returnData.status === 'approved' ? 'bg-green-500 text-white' : ''}
                ${returnData.status === 'rejected' ? 'bg-red-500 text-white' : ''}
                ${returnData.status === 'completed' ? 'bg-blue-500 text-white' : ''}
              `}>
                {returnData.status.charAt(0).toUpperCase() + returnData.status.slice(1)}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-medium text-gray-300 mb-2">Customer Information</h4>
              <p className="text-white">{returnData.user.name}</p>
              <p className="text-gray-400">{returnData.user.email}</p>
              <div className="mt-4">
                <Link 
                  href={`/admin/orders/${returnData.orderId}`}
                  className="text-blue-400 hover:text-blue-300"
                >
                  View Original Order #{returnData.orderId.slice(0, 8)}
                </Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-300 mb-2">Return Details</h4>
              <div className="mb-2">
                <span className="text-gray-400">Reason:</span>
                <span className="text-white ml-2">{getReasonText(returnData.reason)}</span>
              </div>
              {returnData.description && (
                <div>
                  <span className="text-gray-400">Description:</span>
                  <p className="text-white mt-1">{returnData.description}</p>
                </div>
              )}
            </div>
          </div>
          
          {returnData.images.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-300 mb-2">Uploaded Images</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {returnData.images.map((image, index) => (
                  <div key={index} className="relative h-40 rounded-md overflow-hidden">
                    <Image 
                      src={image} 
                      alt={`Return image ${index + 1}`} 
                      fill
                      className="object-cover"
                      unoptimized={true} // Important for base64 images
                    />
                    <a 
                      href={image} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.preventDefault();
                        // Create a new window with just the image
                        const newWindow = window.open('', '_blank');
                        if (newWindow) {
                          newWindow.document.write(`
                            <html>
                              <head>
                                <title>Return Image ${index + 1}</title>
                                <style>
                                  body {
                                    margin: 0;
                                    padding: 0;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                    min-height: 100vh;
                                    background-color: #1f2937;
                                  }
                                  img {
                                    max-width: 100%;
                                    max-height: 100vh;
                                    object-fit: contain;
                                  }
                                </style>
                              </head>
                              <body>
                                <img src="${image}" alt="Return Image ${index + 1}" />
                              </body>
                            </html>
                          `);
                        }
                      }}
                    >
                      <span className="text-white">View Full Size</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mb-6">
            <h4 className="font-medium text-gray-300 mb-2">Admin Notes</h4>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              rows={4}
              placeholder="Add notes about this return request..."
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3">
            {returnData.status === 'pending' && (
              <>
                <button
                  onClick={() => handleStatusChange('rejected')}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Reject Return'}
                </button>
                <button
                  onClick={() => handleStatusChange('approved')}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Approve Return'}
                </button>
              </>
            )}
            
            {returnData.status === 'approved' && (
              <button
                onClick={() => handleStatusChange('completed')}
                disabled={isUpdating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Mark as Completed'}
              </button>
            )}
            
            {(returnData.status === 'rejected' || returnData.status === 'completed') && (
              <button
                onClick={() => handleStatusChange('pending')}
                disabled={isUpdating}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Reopen Return'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';import Image from 'next/image';
import { format } from 'date-fns';import { toast } from 'react-hot-toast';
type Return = {
  id: string;  orderId: string;
  userId: string;  reason: string;
  description?: string;  images: string[];
  status: string;  createdAt: string;
  updatedAt: string;  user: {
    name: string;    email: string;
  };};
export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<Return[]>([]);  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  useEffect(() => {    fetchReturns();
  }, [activeTab]);
  const fetchReturns = async () => {    try {
      setIsLoading(true);      const response = await fetch(`/api/admin/returns?status=${activeTab}`);
            if (!response.ok) {
        throw new Error('Failed to fetch returns');      }
            const data = await response.json();
      setReturns(data.returns);    } catch (error) {
      console.error('Error fetching returns:', error);      toast.error('Failed to load returns');
    } finally {      setIsLoading(false);
    }  };
  const handleStatusChange = async (returnId: string, newStatus: string) => {
    try {      const response = await fetch(`/api/admin/returns/${returnId}`, {
        method: 'PATCH',        headers: {
          'Content-Type': 'application/json',        },
        body: JSON.stringify({ status: newStatus }),      });
            if (!response.ok) {
        throw new Error('Failed to update return status');      }
            toast.success(`Return ${newStatus} successfully`);
      fetchReturns();    } catch (error) {
      console.error('Error updating return status:', error);      toast.error('Failed to update return status');
    }  };
  const getReasonText = (reason: string) => {
    switch (reason) {      case 'wrong_item': return 'Wrong Item Received';
      case 'defective': return 'Defective Product';      case 'other': return 'Other Reason';
      default: return reason;    }
  };
  return (    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Return Requests</h1>      
      <div className="mb-6">        <div className="border-b border-gray-700">
          <nav className="-mb-px flex space-x-8">            <button
              onClick={() => setActiveTab('pending')}              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'              }`}
            >              Pending
            </button>            <button
              onClick={() => setActiveTab('approved')}              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'approved'                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'              }`}
            >              Approved
            </button>            <button
              onClick={() => setActiveTab('rejected')}              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rejected'                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'              }`}
            >              Rejected
            </button>            <button
              onClick={() => setActiveTab('completed')}              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'completed'                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'              }`}
            >              Completed
            </button>          </nav>
        </div>      </div>
            {isLoading ? (
        <div className="flex justify-center py-12">          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>      ) : returns.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-6 text-center">          <h3 className="text-lg font-medium text-white mb-2">No return requests found</h3>
          <p className="text-gray-400">There are no {activeTab} return requests at this time.</p>        </div>
      ) : (        <div className="space-y-6">
          {returns.map((returnItem) => (            <div key={returnItem.id} className="bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-6">                <div className="flex justify-between items-start mb-4">
                  <div>                    <h3 className="text-lg font-semibold text-white">
                      Return #{returnItem.id.slice(0, 8)}                    </h3>
                    <p className="text-sm text-gray-400">                      Requested on {format(new Date(returnItem.createdAt), 'MMM d, yyyy')}
                    </p>                    <p className="text-sm text-gray-400">
                      For Order #{returnItem.orderId.slice(0, 8)}                    </p>
                  </div>                  <div>
                    <span className={`                      px-2 py-1 text-xs rounded-full
                      ${returnItem.status === 'pending' ? 'bg-yellow-500 text-white' : ''}                      ${returnItem.status === 'approved' ? 'bg-green-500 text-white' : ''}
                      ${returnItem.status === 'rejected' ? 'bg-red-500 text-white' : ''}                      ${returnItem.status === 'completed' ? 'bg-blue-500 text-white' : ''}
                    `}>                      {returnItem.status.charAt(0).toUpperCase() + returnItem.status.slice(1)}
                    </span>                  </div>
                </div>                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">                  <div>
                    <h4 className="font-medium text-gray-300 mb-2">Customer</h4>                    <p className="text-white">{returnItem.user.name}</p>
                    <p className="text-gray-400">{returnItem.user.email}</p>                  </div>
                                    <div>
                    <h4 className="font-medium text-gray-300 mb-2">Reason for Return</h4>                    <p className="text-white">{getReasonText(returnItem.reason)}</p>
                    {returnItem.description && (                      <p className="text-gray-400 mt-2">{returnItem.description}</p>
                    )}                  </div>
                </div>                
                {returnItem.images.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-300 mb-2">Uploaded Images</h4>
                    <div className="flex space-x-4">
                      {returnItem.images.map((image, index) => (
                        <div key={index} className="relative h-24 w-24 rounded-md overflow-hidden">
                          <Image 
                            src={image} 
                            alt={`Return image ${index + 1}`} 
                            fill
                            className="object-cover"
                            unoptimized={true} // Important for base64 images
                          />
                          <a 
                            href="#"
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
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity"
                          >
                            <span className="text-white text-sm">View</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center mt-6">                  <Link 
                    href={`/admin/orders/${returnItem.orderId}`}                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >                    View Original Order
                  </Link>                  
                  {returnItem.status === 'pending' && (                    <div className="flex space-x-3">
                      <button                        onClick={() => handleStatusChange(returnItem.id, 'approved')}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"                      >
                        Approve                      </button>
                      <button                        onClick={() => handleStatusChange(returnItem.id, 'rejected')}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"                      >
                        Reject                      </button>
                    </div>                  )}
                                    {returnItem.status === 'approved' && (
                    <button                      onClick={() => handleStatusChange(returnItem.id, 'completed')}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"                    >
                      Mark as Completed                    </button>
                  )}                </div>
              </div>            </div>
          ))}        </div>
      )}    </div>
  );
}



































































































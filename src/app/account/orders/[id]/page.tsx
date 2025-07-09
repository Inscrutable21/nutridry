'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'

type OrderItem = {
  id?: string;  // Make id optional since some items might not have it
  productId?: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant: string | null;
}

type Order = {
  id: string;
  userId: string;
  items: OrderItem[];
  addressId: string;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  address: {
    name: string;
    phone: string;
    address: string;
    locality: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    alternatePhone?: string;
  };
}

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const unwrappedParams = use(params);
  const orderId = unwrappedParams.id;

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      setIsCancelling(true);
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel order');
      }
      
      // Update the order status locally
      setOrder(prev => prev ? {...prev, status: 'cancelled'} : null);
      toast.success('Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReturnOrder = async () => {
    if (!confirm('Are you sure you want to initiate a return for this order?')) return;
    
    // Instead of submitting the return request directly,
    // redirect to the dedicated return request page
    router.push(`/account/orders/${orderId}/return`);
  };

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push(`/login?redirect=/account/orders/${orderId}`);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/orders/${orderId}`);
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push(`/login?redirect=/account/orders/${orderId}`);
            return;
          }
          throw new Error('Failed to fetch order details');
        }
        
        const data = await response.json();
        setOrder(data.order);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Failed to load order details. Please try again later.');
        toast.error('Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated && orderId) {
      fetchOrderDetails();
    }
  }, [isAuthenticated, orderId, router]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'return_requested':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const canCancelOrder = (status: string) => {
    return ['pending', 'processing'].includes(status);
  };

  const canReturnOrder = (status: string) => {
    return status === 'delivered';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 dark:bg-gray-900">
      <div className="mb-6">
        <Link 
          href="/account/orders" 
          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 flex items-center gap-1"
        >
          ← Back to My Orders
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-green-500 rounded-full border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md text-red-800 dark:text-red-200 mb-6">
          {error}
        </div>
      ) : !order ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <h3 className="text-lg font-medium mb-2 dark:text-white">Order not found</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link 
            href="/account/orders" 
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
          >
            Back to My Orders
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold dark:text-white">Order #{order.id.slice(0, 8)}</h2>
                <p className="text-gray-500 dark:text-gray-400">Placed on {formatDate(order.createdAt)}</p>
              </div>
              <div>
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeClass(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <h3 className="font-medium mb-2 dark:text-white">Order Status</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {['pending', 'processing', 'shipped', 'delivered', 'completed'].map((status, index) => (
                  <div 
                    key={status}
                    className={`flex items-center ${index < ['pending', 'processing', 'shipped', 'delivered', 'completed'].indexOf(order.status) + 1 ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                      index < ['pending', 'processing', 'shipped', 'delivered', 'completed'].indexOf(order.status) + 1 
                        ? 'bg-green-100 text-green-600 border-2 border-green-600 dark:bg-green-900 dark:text-green-300 dark:border-green-500' 
                        : 'bg-gray-100 text-gray-400 border-2 border-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600'
                    }`}>
                      {index < ['pending', 'processing', 'shipped', 'delivered', 'completed'].indexOf(order.status) + 1 ? '✓' : index + 1}
                    </div>
                    <span className="text-sm">
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                    {index < 4 && (
                      <div className={`h-0.5 w-8 mx-2 ${
                        index < ['pending', 'processing', 'shipped', 'delivered', 'completed'].indexOf(order.status) 
                          ? 'bg-green-600 dark:bg-green-500' 
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              
              {/* Order action buttons */}
              <div className="mt-4 flex flex-wrap gap-3">
                {canCancelOrder(order.status) && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={isCancelling}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex items-center"
                  >
                    {isCancelling ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                        Cancelling...
                      </>
                    ) : (
                      'Cancel Order'
                    )}
                  </button>
                )}
                
                {canReturnOrder(order.status) && (
                  <button
                    onClick={handleReturnOrder}
                    disabled={isReturning}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex items-center"
                  >
                    {isReturning ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      'Return Order'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="font-semibold mb-3 dark:text-white">Shipping Address</h3>
              <p className="font-medium dark:text-white">{order.address.name}</p>
              <p className="dark:text-gray-300">{order.address.address}, {order.address.locality}</p>
              <p className="dark:text-gray-300">{order.address.city}, {order.address.state} - {order.address.pincode}</p>
              {order.address.landmark && <p className="dark:text-gray-300">Landmark: {order.address.landmark}</p>}
              <p className="dark:text-gray-300">Phone: {order.address.phone}</p>
              {order.address.alternatePhone && <p className="dark:text-gray-300">Alt. Phone: {order.address.alternatePhone}</p>}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="font-semibold mb-3 dark:text-white">Payment Information</h3>
              <p className="dark:text-gray-300"><span className="text-gray-600 dark:text-gray-400">Method:</span> {
                order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                order.paymentMethod === 'upi' ? 'UPI Payment' : 
                order.paymentMethod
              }</p>
              <p className="dark:text-gray-300"><span className="text-gray-600 dark:text-gray-400">Subtotal:</span> ₹{order.subtotal.toFixed(2)}</p>
              <p className="dark:text-gray-300"><span className="text-gray-600 dark:text-gray-400">Shipping:</span> {order.shippingCost === 0 ? 'Free' : `₹${order.shippingCost.toFixed(2)}`}</p>
              <p className="font-medium mt-2 dark:text-white"><span className="text-gray-600 dark:text-gray-400">Total:</span> ₹{order.total.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="font-semibold mb-4 dark:text-white">Order Items</h3>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {order.items.map((item, index) => (
                <div 
                  key={`order-item-${index}-${item.productId || item.variantId || item.name}`} 
                  className="py-4 flex items-center"
                >
                  <div className="flex-1">
                    <p className="font-medium dark:text-white">{item.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.variant && `Variant: ${item.variant}`}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.quantity} × ₹{item.price.toFixed(2)} = ₹{(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}







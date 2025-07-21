'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { use } from 'react'
import Link from 'next/link'

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
  DeliveryCost: number;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
    mobile: string;
  };
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

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params); // Unwrap the params promise
  const orderId = unwrappedParams.id;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log(`Fetching order details for ID: ${orderId}`);
        
        const response = await fetch(`/api/orders/${orderId}`);
        
        if (!response.ok) {
          console.error(`Error response: ${response.status} ${response.statusText}`);
          
          if (response.status === 401) {
            router.push('/admin/login');
            return;
          }
          
          const errorText = await response.text();
          console.error(`Error response body: ${errorText}`);
          
          let errorMessage = 'Failed to fetch order details';
          try {
            const errorData = JSON.parse(errorText);
            if (errorData && errorData.error) {
              errorMessage = errorData.error;
            }
          } catch (e) {
            // If we can't parse the error JSON, use the default message
          }
          
          setError(errorMessage);
          return;
        }
        
        const data = await response.json();
        console.log('Order data received:', data);
        
        if (!data || !data.order) {
          setError('Invalid response format from server');
          return;
        }
        
        setOrder(data.order);
      } catch (error) {
        console.error('Error fetching order details:', error);
        
        if (error instanceof Error) {
          setError(error.message || 'Failed to load order details');
        } else {
          setError('Failed to load order details');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    if (orderId) {
      fetchOrderDetails();
    } else {
      setError('Order ID is missing');
      setIsLoading(false);
    }
  }, [orderId, router]);
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return;
    
    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      const data = await response.json();
      setOrder(data.order);
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-green-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">{error}</p>
        <Link 
          href="/admin/orders"
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Back to Orders
        </Link>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-300">Order not found</p>
        <Link 
          href="/admin/orders"
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Back to Orders
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Order Details</h1>
        <Link 
          href="/admin/orders"
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
        >
          Back to Orders
        </Link>
      </div>
      
      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Order #{order.id.slice(0, 8)}</h2>
            <p className="text-gray-300">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center">
            <span className={`px-3 py-1 rounded-full text-sm ${
              order.status === 'completed' ? 'bg-green-600 text-white' :
              order.status === 'pending' ? 'bg-amber-600 text-white' :
              order.status === 'processing' ? 'bg-blue-600 text-white' :
              order.status === 'shipped' ? 'bg-purple-600 text-white' :
              order.status === 'delivered' ? 'bg-green-600 text-white' :
              'bg-red-600 text-white'
            }`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-white font-medium mb-2">Update Order Status</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateOrderStatus('pending')}
              disabled={updatingStatus || order.status === 'pending'}
              className={`px-3 py-1 rounded-md text-sm ${
                order.status === 'pending' 
                  ? 'bg-amber-600 text-white cursor-not-allowed' 
                  : 'bg-gray-700 text-white hover:bg-amber-600'
              } ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Pending
            </button>
            <button
              onClick={() => updateOrderStatus('processing')}
              disabled={updatingStatus || order.status === 'processing'}
              className={`px-3 py-1 rounded-md text-sm ${
                order.status === 'processing' 
                  ? 'bg-blue-600 text-white cursor-not-allowed' 
                  : 'bg-gray-700 text-white hover:bg-blue-600'
              } ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Processing
            </button>
            <button
              onClick={() => updateOrderStatus('shipped')}
              disabled={updatingStatus || order.status === 'shipped'}
              className={`px-3 py-1 rounded-md text-sm ${
                order.status === 'shipped' 
                  ? 'bg-purple-600 text-white cursor-not-allowed' 
                  : 'bg-gray-700 text-white hover:bg-purple-600'
              } ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Shipped
            </button>
            <button
              onClick={() => updateOrderStatus('delivered')}
              disabled={updatingStatus || order.status === 'delivered'}
              className={`px-3 py-1 rounded-md text-sm ${
                order.status === 'delivered' 
                  ? 'bg-green-600 text-white cursor-not-allowed' 
                  : 'bg-gray-700 text-white hover:bg-green-600'
              } ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Delivered
            </button>
            <button
              onClick={() => updateOrderStatus('completed')}
              disabled={updatingStatus || order.status === 'completed'}
              className={`px-3 py-1 rounded-md text-sm ${
                order.status === 'completed' 
                  ? 'bg-green-600 text-white cursor-not-allowed' 
                  : 'bg-gray-700 text-white hover:bg-green-600'
              } ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Completed
            </button>
            <button
              onClick={() => updateOrderStatus('cancelled')}
              disabled={updatingStatus || order.status === 'cancelled'}
              className={`px-3 py-1 rounded-md text-sm ${
                order.status === 'cancelled' 
                  ? 'bg-red-600 text-white cursor-not-allowed' 
                  : 'bg-gray-700 text-white hover:bg-red-600'
              } ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Cancelled
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="font-semibold mb-3 text-white">Customer Information</h3>
          <p className="text-white"><span className="text-gray-300">Name:</span> {order.user.name}</p>
          <p className="text-white"><span className="text-gray-300">Email:</span> {order.user.email}</p>
          <p className="text-white"><span className="text-gray-300">Phone:</span> {order.user.mobile || 'N/A'}</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="font-semibold mb-3 text-white">Delivery Address</h3>
          <p className="text-white">{order.address.name}</p>
          <p className="text-white">{order.address.address}, {order.address.locality}</p>
          <p className="text-white">{order.address.city}, {order.address.state} - {order.address.pincode}</p>
          {order.address.landmark && <p className="text-white">Landmark: {order.address.landmark}</p>}
          <p className="text-white">Phone: {order.address.phone}</p>
          {order.address.alternatePhone && <p className="text-white">Alt. Phone: {order.address.alternatePhone}</p>}
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h3 className="font-semibold mb-4 text-white">Order Items</h3>
        <div className="divide-y divide-gray-700">
          {order.items.map((item: OrderItem, index: number) => (
            <div 
              key={`order-item-${index}-${item.productId || item.variantId || item.name}`} 
              className="py-4 flex items-center"
            >
              <div className="ml-4 flex-1">
                <p className="font-medium text-white">{item.name}</p>
                <p className="text-sm text-gray-300">
                  {item.variant && `Variant: ${item.variant}`}
                </p>
                <p className="text-sm text-gray-300">
                  {item.quantity} × ₹{item.price.toFixed(2)} = ₹{(item.quantity * item.price).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="font-semibold mb-4 text-white">Payment Information</h3>
        <p className="text-white"><span className="text-gray-300">Payment Method:</span> {
          order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
          order.paymentMethod === 'upi' ? 'UPI Payment' : 
          order.paymentMethod
        }</p>
        
        <div className="mt-4 border-t border-gray-700 pt-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-300">Subtotal</span>
            <span className="text-white">₹{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-300">Delivery</span>
            <span className="text-white">{order.DeliveryCost === 0 ? 'Free' : `₹${order.DeliveryCost.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-700">
            <span className="text-white">Total</span>
            <span className="text-white">₹{order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}





'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { use } from 'react'
import Link from 'next/link'

type OrderItem = {
  id: string;
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
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
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
        <p className="text-red-500 mb-4">{error}</p>
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
        <p className="text-gray-500">Order not found</p>
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
        <h1 className="text-2xl font-bold">Order Details</h1>
        <Link 
          href="/admin/orders"
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back to Orders
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold">Order #{order.id.slice(0, 8)}</h2>
            <p className="text-gray-500">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center">
            <span className={`px-3 py-1 rounded-full text-sm ${
              order.status === 'completed' ? 'bg-green-100 text-green-800' :
              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
              order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
          <div className="flex flex-wrap gap-2">
            {['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => updateOrderStatus(status)}
                disabled={updatingStatus || order.status === status}
                className={`px-3 py-1 text-sm rounded-full ${
                  order.status === status
                    ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold mb-3">Customer Information</h3>
          <p><span className="text-gray-600">Name:</span> {order.user.name}</p>
          <p><span className="text-gray-600">Email:</span> {order.user.email}</p>
          <p><span className="text-gray-600">Phone:</span> {order.user.mobile || 'N/A'}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold mb-3">Shipping Address</h3>
          <p>{order.address.name}</p>
          <p>{order.address.address}, {order.address.locality}</p>
          <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
          {order.address.landmark && <p>Landmark: {order.address.landmark}</p>}
          <p>Phone: {order.address.phone}</p>
          {order.address.alternatePhone && <p>Alt. Phone: {order.address.alternatePhone}</p>}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="font-semibold mb-4">Order Items</h3>
        <div className="divide-y divide-gray-200">
          {order.items.map((item: OrderItem) => (
            <div key={item.id} className="py-4 flex items-center">
              <div className="w-16 h-16 relative flex-shrink-0">
                <Image
                  src={item.image || '/images/placeholder.png'}
                  alt={item.name}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div className="ml-4 flex-grow">
                <h4 className="font-medium">{item.name}</h4>
                {item.variant && <p className="text-sm text-gray-500">Variant: {item.variant}</p>}
                <p className="text-sm text-gray-500">Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-semibold mb-4">Payment Information</h3>
        <p><span className="text-gray-600">Payment Method:</span> {order.paymentMethod}</p>
        
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>₹{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Shipping</span>
            <span>{order.shippingCost === 0 ? 'Free' : `₹${order.shippingCost.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-200">
            <span>Total</span>
            <span>₹{order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}



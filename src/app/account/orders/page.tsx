'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'

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
  items: OrderItem[];
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: string;
  createdAt: string;
  address: {
    name: string;
    city: string;
    state: string;
  };
}

export default function MyOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push('/login?redirect=/account/orders');
      return;
    }

    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/user/orders');
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login?redirect=/account/orders');
            return;
          }
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        setOrders(data.orders || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load your orders. Please try again later.');
        toast.error('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, router]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">My Orders</h1>
        <p className="text-gray-600">View and track your order history</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-green-500 rounded-full border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-800 mb-6">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No orders yet</h3>
          <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
          <Link 
            href="/products" 
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h3 className="text-lg font-medium">Order #{order.id.slice(0, 8)}</h3>
                    <p className="text-gray-500">Placed on {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeClass(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <Link 
                      href={`/account/orders/${order.id}`}
                      className="text-green-600 hover:text-green-800 font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Items</h4>
                    <div className="space-y-2">
                      {order.items.slice(0, 2).map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-12 h-12 relative flex-shrink-0">
                            <Image
                              src={item.image || '/images/placeholder.png'}
                              alt={item.name}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              {item.quantity} × ₹{item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-sm text-gray-500">
                          +{order.items.length - 2} more items
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Shipping</h4>
                    <p className="text-sm">{order.address.name}</p>
                    <p className="text-sm text-gray-500">
                      {order.address.city}, {order.address.state}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Payment</h4>
                    <p className="text-sm">
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                       order.paymentMethod === 'upi' ? 'UPI Payment' : 
                       order.paymentMethod}
                    </p>
                    <p className="text-sm font-medium mt-1">
                      Total: ₹{order.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

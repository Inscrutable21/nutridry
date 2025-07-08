'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

// Define the shape of your Order object. Adjust fields as necessary.
interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  items: {
    name: string;
    image: string;
    // other item properties
  }[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const response = await fetch('/api/orders');
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => 
    order.id.includes(searchTerm) || 
    order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    order.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Orders</h1>
        <div className="w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by order ID or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>
      
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-gray-800 text-white p-6 rounded-lg text-center">
          <p className="text-lg">No orders found</p>
          <p className="text-gray-300 mt-2">Try adjusting your search or check back later.</p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg shadow-md overflow-hidden">
          {/* Mobile view */}
          <div className="block md:hidden">
            {filteredOrders.map((order) => (
              <div key={order.id} className="p-4 border-b border-gray-700 last:border-b-0">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Link href={`/admin/orders/${order.id}`} className="text-sm font-medium text-blue-400 hover:text-blue-300">
                      Order #{order.id.slice(0, 8)}
                    </Link>
                    <p className="text-xs text-gray-300 mt-1">
                      {format(new Date(order.createdAt), 'MMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    order.status === 'completed' ? 'bg-green-900 text-green-200' :
                    order.status === 'pending' ? 'bg-yellow-900 text-yellow-200' :
                    order.status === 'processing' ? 'bg-blue-900 text-blue-200' :
                    order.status === 'shipped' ? 'bg-purple-900 text-purple-200' :
                    order.status === 'delivered' ? 'bg-green-900 text-green-200' :
                    'bg-red-900 text-red-200'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                
                <div className="mb-3">
                  <p className="text-sm text-white">{order.user.name}</p>
                  <p className="text-xs text-gray-300">{order.user.email}</p>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-white">₹{order.total.toFixed(2)}</p>
                  <Link 
                    href={`/admin/orders/${order.id}`}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="bg-gray-900 hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {format(new Date(order.createdAt), 'MMM d, yyyy')}
                      <div className="text-xs text-gray-400">
                        {format(new Date(order.createdAt), 'h:mm a')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{order.user.name}</div>
                      <div className="text-xs text-gray-300">{order.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      ₹{order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'completed' ? 'bg-green-900 text-green-200' :
                        order.status === 'pending' ? 'bg-yellow-900 text-yellow-200' :
                        order.status === 'processing' ? 'bg-blue-900 text-blue-200' :
                        order.status === 'shipped' ? 'bg-purple-900 text-purple-200' :
                        order.status === 'delivered' ? 'bg-green-900 text-green-200' :
                        'bg-red-900 text-red-200'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
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




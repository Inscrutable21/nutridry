'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Bell } from 'react-feather';
import Link from 'next/link';

export default function AdminHeader() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await fetch('/api/admin/auth', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Logged out successfully');
        router.push('/admin/login');
      } else {
        toast.error('Failed to logout');
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Add cache-busting parameter to prevent caching
        const response = await fetch(`/api/admin/notifications?t=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          // Clear old notifications and set new ones
          setNotifications(data.notifications || []);
          setUnreadCount(data.notifications?.length || 0);
        } else {
          console.error('Error fetching notifications:', response.status);
          setNotifications([]);
          setUnreadCount(0);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    // Fetch immediately on mount
    fetchNotifications();
    
    // Poll more frequently (every 15 seconds instead of every minute)
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
        
        <div className="flex items-center space-x-4">
          <div className="relative" ref={notificationRef}>
            <button
              className="p-2 rounded-full hover:bg-gray-200 relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 max-h-96 overflow-y-auto">
                <div className="p-3 border-b border-gray-200">
                  <h3 className="font-semibold">Notifications</h3>
                </div>
                
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No new notifications
                  </div>
                ) : (
                  <div>
                    {notifications.map((notification) => (
                      <Link 
                        key={notification.id}
                        href={`/admin/orders/${notification.id}`}
                        className="block p-4 hover:bg-gray-50 border-b border-gray-100"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{notification.message}</p>
                            <p className="text-sm text-gray-500">
                              Amount: ₹{notification.amount.toFixed(2)}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {formatNotificationTime(notification.createdAt)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                
                <div className="p-2 text-center border-t border-gray-200">
                  <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">
                    View all orders
                  </Link>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </header>
  );
}

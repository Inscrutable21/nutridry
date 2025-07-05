'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ShoppingBag, Package } from 'react-feather';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'All Products', href: '/admin/products' },
    { name: 'Add New Product', href: '/admin/products/new' },
    { name: 'Bestsellers', href: '/admin/products/bestsellers' },
    { name: 'New Arrivals', href: '/admin/products/new-arrivals' },
    
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: ShoppingBag,
    },
    {
      name: 'Stock Management',
      href: '/admin/stock',
      icon: Package,
    },
  ];

  return (
    <>
      {/* Mobile header with hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-emerald-800 text-white z-50 flex justify-between items-center p-4">
        <Link href="/admin/dashboard" className="text-xl font-bold">TheNutriDry</Link>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white focus:outline-none"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            // X icon for close
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Hamburger icon
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu - slides in from left */}
      <div 
        className={`fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition duration-200 ease-in-out z-40 md:static md:inset-auto md:translate-x-0 flex flex-col`}
      >
        <aside className="bg-emerald-800 text-white w-64 min-h-screen flex flex-col">
          {/* Logo section - hidden on mobile as it's in the header */}
          <div className="p-4 hidden md:block">
            <Link href="/admin/dashboard">
              <h2 className="text-xl font-bold text-center py-2">TheNutriDry</h2>
            </Link>
            <p className="text-xs text-center text-emerald-200 mb-6">Admin Panel</p>
          </div>

          {/* Add padding on mobile to account for fixed header */}
          <div className="md:hidden h-16"></div>

          <nav className="mt-6 flex-grow">
            <ul>
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className={`flex items-center px-6 py-3 text-sm ${
                      pathname === item.href
                        ? 'bg-emerald-700 text-white'
                        : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
                    } transition-colors`}
                    onClick={() => setIsMobileMenuOpen(false)} // Close menu when clicking a link on mobile
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="p-4 bg-emerald-900 mt-auto">
            <Link 
              href="/" 
              className="flex items-center justify-center px-4 py-2 text-xs text-emerald-200 hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Back to Website
            </Link>
          </div>
        </aside>
      </div>

      {/* Overlay to close menu when clicking outside on mobile */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </>
  );
}

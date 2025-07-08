'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const { items = [] } = useCart() || {};
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash on Delivery');
  
  // Get payment method from URL or localStorage
  useEffect(() => {
    // Try to get payment method from URL params or localStorage
    const params = new URLSearchParams(window.location.search);
    const method = params.get('method');
    
    if (method) {
      switch(method) {
        case 'cod':
          setPaymentMethod('Cash on Delivery');
          break;
        case 'online':
          setPaymentMethod('Online Payment');
          break;
        case 'upi':
          setPaymentMethod('UPI Payment');
          break;
        default:
          setPaymentMethod('Cash on Delivery');
      }
    } else {
      // Try localStorage as fallback
      const savedMethod = localStorage.getItem('paymentMethod');
      if (savedMethod) {
        setPaymentMethod(savedMethod);
        localStorage.removeItem('paymentMethod'); // Clear after use
      }
    }
  }, []);
  
  // Redirect to home if accessed directly without checkout
  useEffect(() => {
    if (items.length > 0) {
      router.push('/checkout');
    }
  }, [items, router]);
  
  return (
    <div className="pt-20 pb-16 min-h-screen bg-neutral-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-sm text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-playfair mb-4 text-gray-900 dark:text-white">Order Placed Successfully!</h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Thank you for your order. We've received your order details and will process it shortly.
          </p>
          
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            <span className="font-medium dark:text-gray-200">Payment Method:</span> {paymentMethod}
          </p>
          
          <div className="space-y-4">
            <Link 
              href="/products"
              className="inline-block bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-md transition-colors"
            >
              Continue Shopping
            </Link>
            
            <div>
              <Link 
                href="/"
                className="inline-block text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
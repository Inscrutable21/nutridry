'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentMethod = searchParams.get('method')
  const [countdown, setCountdown] = useState(10)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  
  // Handle countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setShouldRedirect(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])
  
  // Handle redirect separately
  useEffect(() => {
    if (shouldRedirect) {
      // Use window.location for a full page navigation instead of router.push
      window.location.href = '/'
    }
  }, [shouldRedirect])
  
  return (
    <div className="min-h-screen pt-20 pb-16 flex items-center justify-center bg-neutral-50 dark:bg-gray-900">
      <div className="max-w-md w-full mx-auto p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          {/* Inline SVG */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-16 w-16 text-green-500 mx-auto mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={1.5}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Thank you for your purchase. We've received your order and will process it right away.
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <span className="font-medium">Payment Method:</span> {
                paymentMethod === 'cod' ? 'Cash on Delivery' : 
                paymentMethod === 'upi' ? 'UPI Payment' : 
                paymentMethod
              }
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">Order Status:</span> Processing
            </p>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We've sent a confirmation email with your order details.
            You can also track your order in your account.
          </p>
          
          <div className="flex flex-col space-y-3">
            <Link 
              href="/account/orders" 
              className="inline-block w-full py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors text-center"
            >
              View My Orders
            </Link>
            
            <Link 
              href="/" 
              className="inline-block w-full py-2 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-center"
            >
              Continue Shopping
            </Link>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            Redirecting to home page in {countdown} seconds...
          </p>
        </div>
      </div>
    </div>
  )
}



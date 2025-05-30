import React from 'react';
import { PageHeader } from '@/components/layout'

export default function ShippingPage() {
  return (
    <div className="pb-16 bg-neutral-50 dark:bg-gray-900">
      <PageHeader title="Shipping Policy" />
      
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8">
          <div className="prose max-w-none dark:prose-invert">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Shipping Information</h2>
            
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              At TheNutriDry, we strive to deliver your premium dehydrated products to you as quickly and efficiently as possible. Please review our shipping policies below.
            </p>
            
            <h3 className="text-xl font-medium text-gray-800 dark:text-white mt-6 mb-3">Domestic Shipping</h3>
            
            <ul className="list-disc pl-5 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Orders are processed and shipped within 1-2 business days.</li>
              <li>Standard shipping typically takes 5-7 business days, depending on your location.</li>
              <li>Express shipping options are available at checkout for faster delivery (2-3 business days).</li>
              <li>Free standard shipping is available on orders over ₹999.</li>
              <li>Shipping charges are calculated based on weight, dimensions, and delivery address.</li>
            </ul>
            
            <h3 className="text-xl font-medium text-gray-800 dark:text-white mt-6 mb-3">International Shipping</h3>
            
            <ul className="list-disc pl-5 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
              <li>We currently ship to select international destinations.</li>
              <li>International orders typically take 10-15 business days for delivery.</li>
              <li>Import duties, taxes, and customs clearance fees are the responsibility of the recipient.</li>
              <li>International shipping rates are calculated at checkout based on destination and package weight.</li>
            </ul>
            
            <h3 className="text-xl font-medium text-gray-800 dark:text-white mt-6 mb-3">Order Tracking</h3>
            
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Once your order ships, you will receive a confirmation email with tracking information. You can track your order status through your account dashboard or by clicking the tracking link in your shipping confirmation email.
            </p>
            
            <h3 className="text-xl font-medium text-gray-800 dark:text-white mt-6 mb-3">Shipping Delays</h3>
            
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              While we strive to meet all estimated delivery times, occasional delays may occur due to:
            </p>
            
            <ul className="list-disc pl-5 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Adverse weather conditions</li>
              <li>Public holidays</li>
              <li>Customs processing for international orders</li>
              <li>Carrier service disruptions</li>
            </ul>
            
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              We will make every effort to communicate any known delays that might affect your order.
            </p>
            
            <h3 className="text-xl font-medium text-gray-800 dark:text-white mt-6 mb-3">Address Accuracy</h3>
            
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Please ensure your shipping address is accurate and complete at checkout. We are not responsible for orders sent to incorrect addresses provided by customers. Address changes after an order is placed may not be possible once processing has begun.
            </p>
            
            <h3 className="text-xl font-medium text-gray-800 dark:text-white mt-6 mb-3">Contact Us</h3>
            
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              If you have any questions about shipping or need assistance tracking your order, please contact our customer service team at <a href="mailto:info.nutridry@gmail.com" className="text-amber-600 hover:text-amber-800 dark:text-amber-500 dark:hover:text-amber-400">info.nutridry@gmail.com</a> or call us at +91 9984001117.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 

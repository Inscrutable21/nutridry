import React from 'react';
import { PageHeader } from '@/components/layout'

export default function WarrantyPage() {
  return (
    <div className="pb-16 bg-neutral-50 dark:bg-gray-900">
      <PageHeader title="Delivery & Return Policy" />
      
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8">
          <div className="prose max-w-none dark:prose-invert">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Delivery Information</h2>
            
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              <strong>Standard Delivery Time:</strong> Orders are typically delivered within 3 to 7 business days from the date of dispatch.
            </p>
            
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              <strong>Shipping Coverage:</strong> We currently deliver across India only.
            </p>
            
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              <strong>Free Shipping:</strong> Applicable on orders valued at ₹499 or above.
            </p>
            
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              <strong>Shipping Charges:</strong> A flat fee of ₹99 is charged on orders below ₹499.
            </p>
            
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              <strong>Order Processing Time:</strong> All orders are processed and dispatched within 1–2 business days.
            </p>
            
            <h3 className="text-xl font-medium text-gray-800 dark:text-white mt-6 mb-3">Order Tracking</h3>
            
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              You can view your tracking information in the 'My Orders' section of your account once your order has been shipped.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mt-8 mb-4">Return Policy</h2>
            
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              At The Nutri Dry, we prioritize quality and customer satisfaction. However, due to the consumable nature of our products, returns are accepted only under specific conditions.
            </p>
            
            <h3 className="text-xl font-medium text-gray-800 dark:text-white mt-6 mb-3">Eligibility for Return</h3>
            
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              A return request will be considered only if:
            </p>
            
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              The product is sealed and unopened
            </p>
            
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              And the issue falls under one of the following:
            </p>
            
            <ul className="list-disc pl-5 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
              <li>You received a defective product</li>
              <li>The product is expired</li>
              <li>An incorrect item was delivered</li>
            </ul>
            
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Return requests must be submitted within 7 days of receiving the order.
            </p>
            
            <h3 className="text-xl font-medium text-gray-800 dark:text-white mt-6 mb-3">Ineligible Returns</h3>
            
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              We do not accept returns if:
            </p>
            
            <ul className="list-disc pl-5 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
              <li>The product has been opened or used</li>
              <li>The return is requested after 7 days of delivery</li>
              <li>The item was delivered correctly and in good condition</li>
            </ul>
            
            <h3 className="text-xl font-medium text-gray-800 dark:text-white mt-6 mb-3">How to Request a Return</h3>
            
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              To initiate a return:
            </p>
            
            <ol className="list-decimal pl-5 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Log in to your account and navigate to the 'My Orders' section</li>
              <li>Select the product(s) you wish to return</li>
              <li>Upload clear images of the product showing the issue (e.g., damaged, expired, incorrect)</li>
              <li>Submit your return request for review</li>
            </ol>
            
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              You can monitor the status of your return in the 'My Returns' section of your profile.
            </p>
            
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Once your request is reviewed and approved, we will process either a replacement or a refund, based on the issue.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
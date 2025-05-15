import React from 'react';
import { PageHeader } from '@/components/layout'

export default function WarrantyPage() {
  return (
    <div className="pb-16">
      <PageHeader title="Warranty & Returns" />
      
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-6 md:p-8">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Warranty Policy</h2>
            
            <p className="mb-4">
              At TheNutriDry, we stand behind the quality of our products. Our warranty and returns policies are designed to ensure your complete satisfaction with your purchase.
            </p>
            
            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Product Quality Guarantee</h3>
            
            <p className="mb-4">
              All TheNutriDry products are backed by our quality guarantee. We guarantee that our products will arrive in good condition and match the description provided on our website. If your product doesn&apos;t meet these standards, we will replace it or offer a refund according to our return policy.
            </p>
            
            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Return Policy</h3>
            
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>Returns are accepted within 30 days of delivery.</li>
              <li>Products must be unused, in their original packaging, and in the same condition you received them.</li>
              <li>To initiate a return, please contact our customer service team with your order number and reason for return.</li>
              <li>Once your return is approved, we will provide instructions for shipping the item back.</li>
              <li>Return shipping costs are the responsibility of the customer unless the return is due to our error (damaged or incorrect item).</li>
            </ul>
            
            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Refund Process</h3>
            
            <p className="mb-4">
              After receiving and inspecting your return, we will process your refund. The time it takes for the refund to appear in your account depends on your payment method:
            </p>
            
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>Credit/debit card refunds typically take 5-7 business days to process.</li>
              <li>Bank transfers may take 7-10 business days.</li>
              <li>Store credit is applied immediately upon processing the return.</li>
            </ul>
            
            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Damaged or Defective Products</h3>
            
            <p className="mb-4">
              If you receive a damaged or defective product:
            </p>
            
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>Contact us within 48 hours of receiving your order.</li>
              <li>Provide photos of the damaged product and packaging.</li>
              <li>We will arrange for a replacement or refund at no additional cost to you.</li>
            </ul>
            
            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Exchanges</h3>
            
            <p className="mb-4">
              We are happy to exchange products within 30 days of purchase. To request an exchange, please contact our customer service team with your order number and the item you wish to exchange.
            </p>
            
            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Contact Us</h3>
            
            <p className="mb-4">
              If you have any questions about our warranty or return policy, please contact our customer service team at <a href="mailto:support@thenutridry.com" className="text-amber-600 hover:text-amber-800">support@thenutridry.com</a> or call us at +91 98765 43210.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 

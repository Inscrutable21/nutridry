import React from 'react';

export const metadata = {
  title: 'Refund Policy | TheNutriDry',
  description: 'Refund policy for TheNutriDry products.',
};

export default function RefundPolicyPage() {
  return (
    <div className="pt-24 pb-16 bg-neutral-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-playfair mb-6 text-gray-900 dark:text-white">Refund policy</h1>
          
          <div className="prose prose-green max-w-none dark:prose-invert">
            <p className="text-gray-700 dark:text-gray-300">The NUtridry operates under AL AHAD TRADING COMPANY and is committed to ensuring customer satisfaction. If you are not entirely satisfied with your purchase, we&apos;re here to help.</p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-800 dark:text-white">Refunds</h2>
            <p className="text-gray-700 dark:text-gray-300">To be eligible for a refund, your item must be unused and in the same condition that you received it. It must also be in the original packaging.</p>
            <p className="text-gray-700 dark:text-gray-300">Refund requests must be submitted within 7 days of receiving the product.</p>
            <p className="text-gray-700 dark:text-gray-300">To initiate a refund, please contact us at <span className="text-amber-600 dark:text-amber-500">info.nutridry@gmail.com</span>.</p>
            <p className="text-gray-700 dark:text-gray-300">Once we receive your request, we will notify you of the status of your refund after inspection of the returned product.</p>
            <p className="text-gray-700 dark:text-gray-300">If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within 7-10 business days.</p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-800 dark:text-white">Exchanges</h2>
            <p className="text-gray-700 dark:text-gray-300">We only replace items if they are defective or damaged. If you need to exchange it for the same item, please contact us.</p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-800 dark:text-white">Shipping Costs</h2>
            <p className="text-gray-700 dark:text-gray-300">You will be responsible for paying for your own shipping costs for returning your item.</p>
            <p className="text-gray-700 dark:text-gray-300">Shipping costs are non-refundable.</p>
            <p className="text-gray-700 dark:text-gray-300">If you receive a refund, the cost of return shipping will be deducted from your refund.</p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-800 dark:text-white">Non-Refundable Items</h2>
            <p className="text-gray-700 dark:text-gray-300">Perishable goods such as food items are exempt from being returned, except in the case of damage or defect.</p>
            <p className="text-gray-700 dark:text-gray-300">Any opened or used items cannot be refunded.</p>
            
            <p className="mt-8 text-gray-700 dark:text-gray-300">If you have any questions regarding our refund policy, feel free to reach out to us at:</p>
            
            <div className="mt-4">
              <p className="font-semibold text-gray-800 dark:text-white">AL AHAD TRADING COMPANY</p>
              <p className="text-gray-700 dark:text-gray-300">122/3, Awadh Vihar Colony, Near Amausi Intl. Airport, Kanpur Road, Lucknow, Uttar Pradesh-226023</p>
              <p className="text-gray-700 dark:text-gray-300">Email Id:- <span className="text-amber-600 dark:text-amber-500">info.nutridry@gmail.com</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

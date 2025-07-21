'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-hot-toast'
import AddressManager from '@/components/user/AddressManager'

type SavedAddress = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  pincode: string;
  locality: string;
  city: string;
  state: string;
  landmark: string | null;
  alternatePhone: string | null;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items = [], cartTotal = 0, clearCart = () => {} } = useCart() || {};
  const { user, isAuthenticated } = useAuth() || {};
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null);
  
  // Fixed payment method - COD only
  const paymentMethod = 'cod';
  
  // Calculate Delivery cost
  const DeliveryCost = cartTotal >= 499 ? 0 : 99;
  const orderTotal = cartTotal + DeliveryCost;
  
  // Handle address selection from AddressManager
  const handleAddressSelect = (address: SavedAddress) => {
    setSelectedAddress(address);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Check if cart is empty and log the items
      console.log('Cart items:', items);
      
      if (!items || items.length === 0) {
        toast.error('Your cart is empty. Please add items before checkout.');
        setIsSubmitting(false);
        return;
      }
      
      // Log the items being sent to the API
      console.log('Sending items to API:', items);
      
      // When preparing the order items, ensure images have absolute URLs
      const validatedItems = items.map(item => {
        // Create a copy to avoid mutating the original
        const validatedItem = { ...item };
        
        // Ensure image URLs are absolute
        if (validatedItem.image) {
          // If image doesn't start with http or /, add /
          if (!validatedItem.image.startsWith('http') && !validatedItem.image.startsWith('/')) {
            validatedItem.image = '/' + validatedItem.image;
          }
          
          // Fix common image path issues
          if (validatedItem.image.startsWith('/products/') && !validatedItem.image.startsWith('/images/products/')) {
            validatedItem.image = '/images' + validatedItem.image;
          }
        } else {
          // If no image, use placeholder
          validatedItem.image = '/placeholder.jpg';
        }
        
        return validatedItem;
      });

      // Ensure all required fields are present and log them for debugging
      if (!user?.id) {
        console.error('Missing user ID');
        throw new Error('Missing user ID');
      }
      
      if (!selectedAddress?.id) {
        console.error('Missing address ID');
        throw new Error('Missing address ID');
      }
      
      if (!paymentMethod) {
        console.error('Missing payment method');
        throw new Error('Missing payment method');
      }
      
      if (!items || items.length === 0) {
        console.error('Empty items array');
        throw new Error('Empty items array');
      }
      
      // Log the request payload for debugging
      const orderPayload = {
        userId: user.id,
        items: validatedItems, // Use the validated items with proper image URLs
        addressId: selectedAddress.id,
        paymentMethod,
        subtotal: cartTotal,
        DeliveryCost,
        total: orderTotal,
      };
      
      console.log('Sending order payload:', orderPayload);
      
      // Use the validated items for the API request
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });
      
      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        console.error('Order API error:', errorData);
        throw new Error(`Failed to save order: ${errorData.error || 'Unknown error'}`);
      }
      
      // Clear cart after successful order
      clearCart();
      
      // Redirect to success page with payment method
      router.push(`/checkout/success?method=${paymentMethod}`);
    } catch (error) {
      console.error('Error processing order:', error);
      toast.error('Failed to process order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="pt-20 pb-16 min-h-screen bg-neutral-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Delivery Address Section */}
          <div className="lg:w-2/3">
            <div className="rounded-lg shadow-sm overflow-hidden mb-6 bg-white dark:bg-gray-800">
              <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-base md:text-lg font-medium text-gray-900 dark:text-white">Delivery Address</h2>
              </div>
              
              <div className="p-4 md:p-6">
                <AddressManager 
                  onAddressSelect={handleAddressSelect}
                  selectedAddressId={selectedAddress?.id || null}
                  userData={user}
                  isAuthenticated={isAuthenticated}
                />
              </div>
            </div>
            
            {/* Payment Method Section - COD Only */}
            <div className="rounded-lg shadow-sm overflow-hidden mb-6 bg-white dark:bg-gray-800">
              <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-base md:text-lg font-medium text-gray-900 dark:text-white">Payment Method</h2>
              </div>
              
              <div className="p-4 md:p-6">
                <div className="flex items-center p-3 border rounded-md bg-green-50 dark:bg-green-900/30 border-green-500 dark:border-green-700">
                  <div className="w-5 h-5 rounded-full border-2 border-green-500 dark:border-green-400 flex items-center justify-center mr-3">
                    <div className="w-3 h-3 rounded-full bg-green-500 dark:bg-green-400"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Cash on Delivery</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Pay when your order is delivered</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="rounded-lg shadow-sm overflow-hidden bg-white dark:bg-gray-800 dark:border dark:border-gray-700 lg:sticky lg:top-24">
              <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-base md:text-lg font-medium text-gray-900 dark:text-white">Order Summary</h2>
              </div>
              
              <div className="p-4 md:p-6">
                <div className="space-y-3 md:space-y-4 text-sm md:text-base text-gray-600 dark:text-gray-300">
                  {/* Item list */}
                  <div className="max-h-60 overflow-y-auto mb-4">
                    {items.map(item => (
                      <div key={`${item.id}-${item.variant}`} className="flex justify-between items-start mb-3">
                        <div className="flex items-start">
                          <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">
                            {item.quantity}
                          </span>
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">{item.name}</p>
                            {item.variant && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">Size: {item.variant}</p>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-dashed pt-3 mt-3 border-gray-300 dark:border-gray-700">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium text-gray-900 dark:text-white">₹{cartTotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      {DeliveryCost === 0 ? (
                        <span className="italic text-xs md:text-sm">Free</span>
                      ) : (
                        <span className="font-medium text-gray-900 dark:text-white">₹{DeliveryCost.toFixed(2)}</span>
                      )}
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span className="italic text-xs md:text-sm">Included</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3 mt-3 border-gray-300 dark:border-gray-700">
                    <div className="flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-bold text-lg text-gray-900 dark:text-white">
                        ₹{orderTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !selectedAddress}
                    className={`w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md transition-colors flex items-center justify-center ${
                      (!selectedAddress || isSubmitting) ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        Place Order
                      </>
                    )}
                  </button>
                  
                  <p className="text-xs text-center mt-3 text-gray-500 dark:text-gray-400">
                    By placing your order, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
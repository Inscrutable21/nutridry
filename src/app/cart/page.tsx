// app/cart/page.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { toast } from 'react-hot-toast'

export default function CartPage() {
  const { items = [], removeFromCart = () => {}, updateQuantity = () => {}, clearCart = () => {}, cartTotal = 0 } = useCart() || {};
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Define styles
  const primaryColor = '#2b9348'
  const primaryDark = '#1e6b33'
  
  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return;
    
    setIsProcessing(true);
    
    // Create a formatted message with all cart items
    let message = "Hello! I would like to order the following items:\n\n";
    
    items.forEach(item => {
      message += `*${item.name}* - Quantity: ${item.quantity} - Price: $${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n*Total: $${cartTotal.toFixed(2)}*\n\nPlease provide payment and delivery information. Thank you!`;
    
    // Open WhatsApp with the message
    const whatsappUrl = `https://wa.me/919984001117?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Reset processing state
    setTimeout(() => {
      setIsProcessing(false);
    }, 1000);
  }
  
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-playfair mb-2">Your Cart</h1>
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span>Cart</span>
          </div>
        </div>
        
        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-medium mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven&apos;t added any products to your cart yet. Explore our products and find something you&apos;ll love!
            </p>
            <Link 
              href="/products" 
              className="inline-flex items-center px-6 py-3 text-white rounded-full transition-colors"
              style={{ 
                backgroundColor: primaryColor,
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = primaryDark}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = primaryColor}
            >
              Browse Products
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Product</th>
                        <th className="py-4 px-6 text-center text-sm font-medium text-gray-700">Price</th>
                        <th className="py-4 px-6 text-center text-sm font-medium text-gray-700">Quantity</th>
                        <th className="py-4 px-6 text-center text-sm font-medium text-gray-700">Total</th>
                        <th className="py-4 px-6 text-center text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {items.map(item => (
                        <tr key={item.id}>
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-4">
                                {item.image && item.image.trim() !== "" ? (
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    width={80}
                                    height={80}
                                    className="h-full w-full object-cover object-center"
                                  />
                                ) : (
                                  <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                                    <span className="text-gray-400 text-xs">No image</span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center text-gray-700">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center">
                              <div className="flex border border-gray-300 rounded w-32">
                                <button 
                                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                  style={{ transition: 'background-color 0.2s' }}
                                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                                  </svg>
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                  className="w-full text-center border-x border-gray-300 py-1 focus:outline-none"
                                />
                                <button 
                                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                  style={{ transition: 'background-color 0.2s' }}
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center font-medium text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button 
                              onClick={() => {
                                removeFromCart(item.id);
                                toast.success(`${item.name} removed from cart`);
                              }}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              style={{ transition: 'color 0.2s' }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button 
                  onClick={() => {
                    clearCart();
                    toast.success('Cart cleared');
                  }}
                  className="text-gray-600 hover:text-gray-800 flex items-center transition-colors"
                  style={{ transition: 'color 0.2s' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Clear Cart
                </button>
                
                <Link 
                  href="/products" 
                  className="text-gray-600 hover:text-gray-800 flex items-center transition-colors"
                  style={{ transition: 'color 0.2s' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
                  </svg>
                  Continue Shopping
                </Link>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-medium mb-6 pb-4 border-b">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span className="font-medium">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-600">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-600">Calculated at checkout</span>
                  </div>
                </div>
                
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total</span>
                    <span className="text-xl font-bold" style={{ color: primaryColor }}>${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <button 
                  onClick={handleWhatsAppCheckout}
                  disabled={isProcessing || items.length === 0}
                  className="w-full py-3 px-4 flex items-center justify-center text-white rounded-md mb-4"
                  style={{ 
                    backgroundColor: primaryColor,
                    transition: 'background-color 0.2s',
                    opacity: isProcessing ? 0.7 : 1
                  }}
                  onMouseOver={(e) => !isProcessing && (e.currentTarget.style.backgroundColor = primaryDark)}
                  onMouseOut={(e) => !isProcessing && (e.currentTarget.style.backgroundColor = primaryColor)}
                >
                  {isProcessing ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                      </svg>
                      Checkout via WhatsApp
                    </span>
                  )}
                </button>
                
                <div className="text-sm text-gray-500 text-center">
                  <p>We&apos;ll send your order details via WhatsApp for confirmation and payment processing.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// app/cart/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { toast } from 'react-hot-toast'

export default function CartPage() {
  const { items = [], removeFromCart = () => {}, updateQuantity = () => {}, clearCart = () => {}, cartTotal = 0 } = useCart() || {};
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Check for dark mode
  useEffect(() => {
    // Check if dark mode is enabled
    const checkDarkMode = () => {
      if (typeof window !== 'undefined') {
        // Check for dark mode preference
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setIsDarkMode(isDark)
      }
    }
    
    checkDarkMode()
    
    // Listen for changes in color scheme preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
  
  // Define styles
  const primaryColor = '#2b9348'
  const primaryDark = '#1e6b33'
  
  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return;
    
    let message = "Hello! I would like to order the following items:\n\n";
    
    items.forEach(item => {
      message += `*${item.name}* - Quantity: ${item.quantity} - Price: ₹${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n*Total: ₹${cartTotal.toFixed(2)}*\n\nPlease provide payment and delivery information. Thank you!`;
    
    const whatsappUrl = `https://wa.me/919984001117?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Show success toast
    toast.success('Redirecting to WhatsApp...');
    
    // Clear cart after successful checkout
    setTimeout(() => {
      clearCart();
    }, 1000);
  }
  
  return (
    <div className={`pt-20 pb-16 min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-neutral-50'}`}>
      <div className="container mx-auto px-4 md:px-6">
        <header className="mb-8 md:mb-12 text-center">
          <h1 className={`text-2xl md:text-3xl lg:text-5xl font-playfair mb-2 md:mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Your Cart</h1>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto text-sm md:text-base`}>
            Review your items before proceeding to checkout.
          </p>
        </header>
        
        {items.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <div className={`inline-flex items-center justify-center w-16 h-16 md:w-24 md:h-24 rounded-full mb-4 md:mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-8 h-8 md:w-12 md:h-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
            </div>
            <h2 className={`text-xl md:text-2xl font-medium mb-2 md:mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Your cart is empty</h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6 md:mb-8 max-w-md mx-auto text-sm md:text-base`}>
              Looks like you haven't added any products to your cart yet. Browse our collection to find premium dried fruits, nuts, and more.
            </p>
            <Link 
              href="/products"
              className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 text-white font-medium rounded-md transition-colors text-sm md:text-base"
              style={{ 
                backgroundColor: primaryColor,
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = primaryDark}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = primaryColor}
            >
              Browse Products
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5 ml-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
            {/* Cart Items - Improved for mobile */}
            <div className="lg:w-2/3">
              <div className={`rounded-lg shadow-sm overflow-hidden mb-4 md:mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="overflow-x-auto">
                  {/* Mobile cart view (visible on small screens) */}
                  <div className="block sm:hidden">
                    {items.map(item => (
                      <div key={item.id} className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-start">
                          <div className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={64}
                              height={64}
                              className="h-full w-full object-contain object-center"
                            />
                          </div>
                          <div className="ml-4 flex-1">
                            <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</h3>
                            {item.variant && (
                              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Size: {item.variant}</p>
                            )}
                            <p className={`mt-1 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                            
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center border rounded-md overflow-hidden">
                                <button
                                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), item.variant)}
                                  className={`p-1 ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                                  aria-label="Decrease quantity"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                                  </svg>
                                </button>
                                <span className={`px-2 py-1 ${isDarkMode ? 'text-white' : ''}`}>{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                                  className={`p-1 ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                                  aria-label="Increase quantity"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                  </svg>
                                </button>
                              </div>
                              
                              <button
                                onClick={() => removeFromCart(item.id, item.variant)}
                                className={`p-1 rounded-md ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                                aria-label={`Remove ${item.name} from cart`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Desktop cart view (visible on medium screens and up) */}
                  <table className="w-full hidden sm:table">
                    <thead className={`border-b ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <tr>
                        <th className={`px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-500'}`}>Product</th>
                        <th className={`px-4 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-500'}`}>Quantity</th>
                        <th className={`px-4 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-500'}`}>Price</th>
                        <th className={`px-4 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-500'}`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {items.map(item => (
                        <tr key={item.id}>
                          <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`h-12 w-12 md:h-16 md:w-16 flex-shrink-0 overflow-hidden rounded-md border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  width={64}
                                  height={64}
                                  className="h-full w-full object-contain object-center"
                                />
                              </div>
                              <div className="ml-4">
                                <h3 className={`text-xs md:text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</h3>
                                {item.variant && (
                                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Size: {item.variant}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), item.variant)}
                                className={`p-1 rounded-md ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                                aria-label="Decrease quantity"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                                </svg>
                              </button>
                              <span className={`mx-2 w-6 md:w-8 text-center text-xs md:text-sm ${isDarkMode ? 'text-white' : ''}`}>{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                                className={`p-1 rounded-md ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                                aria-label="Increase quantity"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                              </button>
                            </div>
                          </td>
                          <td className={`px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-right text-xs md:text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => removeFromCart(item.id, item.variant)}
                              className={`p-1 rounded-md ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                              aria-label={`Remove ${item.name} from cart`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className={`flex justify-between items-center p-3 md:p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <button
                  onClick={clearCart}
                  className={`text-xs md:text-sm font-medium flex items-center ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 md:w-4 md:h-4 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Clear Cart
                </button>
                <Link
                  href="/products"
                  className={`text-xs md:text-sm font-medium flex items-center ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 md:w-4 md:h-4 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
                  </svg>
                  Continue Shopping
                </Link>
              </div>
            </div>
            
            {/* Order Summary - Improved for mobile */}
            <div className="lg:w-1/3 mt-4 lg:mt-0">
              <div className={`rounded-lg shadow-sm overflow-hidden ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} lg:sticky lg:top-24`}>
                <div className={`px-4 md:px-6 py-3 md:py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h2 className={`text-base md:text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Order Summary</h2>
                </div>
                
                <div className="p-4 md:p-6">
                  <div className={`space-y-3 md:space-y-4 text-sm md:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <div className="flex justify-between">
                      <span>Subtotal ({items.length} items)</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{cartTotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="italic text-xs md:text-sm">Calculated at checkout</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span className="italic text-xs md:text-sm">Calculated at checkout</span>
                    </div>
                    
                    <div className={`pt-3 md:pt-4 mt-3 md:mt-4 border-t flex justify-between items-center ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <span className={`text-base md:text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Total</span>
                      <span className={`text-lg md:text-xl font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-6">
                    <button
                      onClick={handleWhatsAppCheckout}
                      disabled={isProcessing}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 md:py-3 px-4 rounded-md transition-colors flex items-center justify-center text-sm md:text-base"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5 mr-2">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Checkout with WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

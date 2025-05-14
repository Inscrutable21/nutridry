'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import SearchBar from './SearchBar'
import { useCart } from '@/context/CartContext'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false)
  const cartDropdownRef = useRef<HTMLDivElement>(null)
  const { items, cartCount, cartTotal, removeFromCart } = useCart()
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // Close cart dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target as Node)) {
        setCartDropdownOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Define styles
  const primaryColor = '#2b9348'
  const primaryDark = '#1e6b33'
  
  // Handle WhatsApp checkout
  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return;
    
    let message = "Hello! I would like to order the following items:\n\n";
    
    items.forEach(item => {
      message += `*${item.name}* - Quantity: ${item.quantity} - Price: $${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n*Total: $${cartTotal.toFixed(2)}*\n\nPlease provide payment and delivery information. Thank you!`;
    
    const whatsappUrl = `https://wa.me/919984001117?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setCartDropdownOpen(false);
  }

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-white py-3'
      }`} 
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="relative w-[160px] h-[48px] md:w-[180px] md:h-[54px]">
              <Image 
                src="/logo.svg" 
                alt="TheNutriDry" 
                fill
                style={{ objectFit: 'contain', objectPosition: 'left' }}
                className="max-h-full"
                priority
              />
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center mx-auto space-x-8">
            <NavLink href="/" primaryColor={primaryColor}>Home</NavLink>
            <NavLink href="/products" primaryColor={primaryColor}>Shop</NavLink>
            <NavLink href="/about" primaryColor={primaryColor}>About</NavLink>
            <NavLink href="/contact" primaryColor={primaryColor}>Contact</NavLink>
          </nav>
          
          {/* Right Side Items */}
          <div className="flex items-center space-x-1 md:space-x-4">
            <div className="hidden md:block mr-2">
              <SearchBar primaryColor={primaryColor} />
            </div>
            
            <button 
              className="p-2 text-gray-700" 
              style={{ transition: 'color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.color = primaryColor}
              onMouseOut={(e) => e.currentTarget.style.color = '#374151'}
              aria-label="Favorites"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            </button>
            
            {/* Cart Icon with Dropdown */}
            <div className="relative" ref={cartDropdownRef}>
              <button 
                className="p-2 text-gray-700 relative" 
                style={{ transition: 'color 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.color = primaryColor}
                onMouseOut={(e) => e.currentTarget.style.color = '#374151'}
                onClick={() => setCartDropdownOpen(!cartDropdownOpen)}
                aria-label="Shopping Cart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                {cartCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>
              
              {/* Cart Dropdown */}
              {cartDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50">
                  <div className="p-4 border-b">
                    <h3 className="font-medium">Your Cart ({cartCount} items)</h3>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {items.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        Your cart is empty
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {items.map(item => (
                          <li key={item.id} className="flex p-4">
                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-4">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  width={64}
                                  height={64}
                                  className="h-full w-full object-contain object-center"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gray-100">
                                  <span className="text-gray-400 text-xs">No image</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium">{item.name}</h4>
                              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                              <p className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-400 hover:text-gray-600"
                              aria-label={`Remove ${item.name} from cart`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  <div className="p-4 border-t">
                    <div className="flex justify-between mb-4">
                      <span className="font-medium">Subtotal:</span>
                      <span className="font-medium">${cartTotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Link 
                        href="/cart"
                        className="text-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-sm"
                        onClick={() => setCartDropdownOpen(false)}
                      >
                        View Cart
                      </Link>
                      
                      <button 
                        onClick={handleWhatsAppCheckout}
                        className="px-4 py-2 text-white rounded-md transition-colors text-sm flex items-center justify-center"
                        style={{ backgroundColor: primaryColor, transition: 'background-color 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = primaryDark}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = primaryColor}
                        disabled={items.length === 0}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                        </svg>
                        Checkout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <button 
              className="p-2 text-gray-700" 
              style={{ transition: 'color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.color = primaryColor}
              onMouseOut={(e) => e.currentTarget.style.color = '#374151'}
              aria-label="Account"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </button>
            
            <button 
              className="md:hidden p-2 text-gray-700"
              style={{ transition: 'color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.color = primaryColor}
              onMouseOut={(e) => e.currentTarget.style.color = '#374151'}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div 
            className="md:hidden pt-4 pb-3 border-t mt-3"
            style={{
              animation: 'fadeIn 0.3s ease-out forwards',
            }}
          >
            <div className="mb-4">
              <SearchBar primaryColor={primaryColor} />
            </div>
            <nav className="flex flex-col space-y-3">
              <MobileNavLink href="/" onClick={() => setMobileMenuOpen(false)} primaryColor={primaryColor}>Home</MobileNavLink>
              <MobileNavLink href="/products" onClick={() => setMobileMenuOpen(false)} primaryColor={primaryColor}>Shop</MobileNavLink>
              <MobileNavLink href="/about" onClick={() => setMobileMenuOpen(false)} primaryColor={primaryColor}>About</MobileNavLink>
              <MobileNavLink href="/contact" onClick={() => setMobileMenuOpen(false)} primaryColor={primaryColor}>Contact</MobileNavLink>
              <MobileNavLink href="/cart" onClick={() => setMobileMenuOpen(false)} primaryColor={primaryColor}>
                <div className="flex items-center">
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span 
                      className="ml-2 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {cartCount}
                    </span>
                  )}
                </div>
              </MobileNavLink>
            </nav>
          </div>
        )}
      </div>
      
      {/* Keyframe animation for mobile menu */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  )
}

function NavLink({ href, children, primaryColor }: { href: string, children: React.ReactNode, primaryColor: string }) {
  return (
    <Link 
      href={href} 
      className="text-gray-800 font-medium relative group"
      style={{ 
        fontFamily: 'Poppins, sans-serif',
        transition: 'color 0.2s'
      }}
      onMouseOver={(e) => e.currentTarget.style.color = primaryColor}
      onMouseOut={(e) => e.currentTarget.style.color = '#1f2937'}
    >
      {children}
      <span 
        className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full" 
        style={{ 
          backgroundColor: primaryColor,
          transition: 'width 0.3s'
        }}
      ></span>
    </Link>
  )
}

function MobileNavLink({ href, children, onClick, primaryColor }: { href: string, children: React.ReactNode, onClick: () => void, primaryColor: string }) {
  return (
    <Link 
      href={href} 
      className="text-gray-800 block py-2 font-medium"
      style={{ 
        fontFamily: 'Poppins, sans-serif',
        transition: 'color 0.2s'
      }}
      onMouseOver={(e) => e.currentTarget.style.color = primaryColor}
      onMouseOut={(e) => e.currentTarget.style.color = '#1f2937'}
      onClick={onClick}
    >
      {children}
    </Link>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import SearchBar from './SearchBar'
import { useCart } from '@/context/CartContext'
// import CartDropdown from '@/components/CartDropdown'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // const [cartDropdownOpen, setCartDropdownOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  // const cartDropdownRef = useRef<HTMLDivElement>(null)
  const { items, cartCount, cartTotal } = useCart()
  const router = useRouter()
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // Close cart dropdown when clicking outside
  // useEffect(() => {
  //   function handleClickOutside(event: MouseEvent) {
  //     if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target as Node)) {
  //       setCartDropdownOpen(false)
  //     }
  //   }
  //   
  //   document.addEventListener('mousedown', handleClickOutside)
  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside)
  //   }
  // }, [])

  // Define styles
  const primaryColor = '#2b9348'
  const primaryDark = '#1e6b33'
  
  // Handle WhatsApp checkout
  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return;
    
    let message = "Hello! I would like to order the following items:\n\n";
    
    items.forEach(item => {
      message += `*${item.name}* - Quantity: ${item.quantity} - Price: ₹${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n*Total: ₹${cartTotal.toFixed(2)}*\n\nPlease provide payment and delivery information. Thank you!`;
    
    const whatsappUrl = `https://wa.me/919984001117?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    // setCartDropdownOpen(false);
  }

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white dark:bg-gray-900 shadow-md py-2' : 'bg-white dark:bg-gray-900 py-3'
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
                className="max-h-full dark:filter dark:brightness-150"
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
            {/* Desktop Search Bar */}
            <div className="hidden md:block mr-2">
              <SearchBar primaryColor={primaryColor} />
            </div>
            
            {/* Mobile Search Icon - Only visible on mobile/tablet */}
            <button 
              className="md:hidden p-2 text-gray-700 flex items-center justify-center" 
              style={{ transition: 'color 0.2s', width: '40px', height: '40px' }}
              onMouseOver={(e) => e.currentTarget.style.color = primaryColor}
              onMouseOut={(e) => e.currentTarget.style.color = '#374151'}
              onClick={() => {
                console.log('Search icon clicked');
                setSearchOpen(prev => !prev);
              }}
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
            
            {/* Favorites Icon */}
            <button 
              className="p-2 text-gray-700 flex items-center justify-center" 
              style={{ transition: 'color 0.2s', width: '40px', height: '40px' }}
              onMouseOver={(e) => e.currentTarget.style.color = primaryColor}
              onMouseOut={(e) => e.currentTarget.style.color = '#374151'}
              aria-label="Favorites"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            </button>
            
            {/* Cart Icon with Dropdown */}
            <Link 
              href="/cart" 
              className="p-2 text-gray-700 relative flex items-center justify-center" 
              style={{ transition: 'color 0.2s', width: '40px', height: '40px' }}
              onMouseOver={(e) => e.currentTarget.style.color = primaryColor}
              onMouseOut={(e) => e.currentTarget.style.color = '#374151'}
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
            </Link>
            
            <button 
              className="p-2 text-gray-700 flex items-center justify-center"
              style={{ transition: 'color 0.2s', width: '40px', height: '40px' }}
              onMouseOver={(e) => e.currentTarget.style.color = primaryColor}
              onMouseOut={(e) => e.currentTarget.style.color = '#374151'}
              aria-label="Account"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </button>
            
            <button 
              className="md:hidden p-2 text-gray-700 flex items-center justify-center"
              style={{ transition: 'color 0.2s', width: '40px', height: '40px' }}
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

        {/* Mobile Search Bar - Appears below navbar */}
        {searchOpen && (
          <div 
            className="md:hidden w-full py-3 px-2 border-t mt-2 animate-fadeIn dark:border-gray-700"
          >
            <SearchBar 
              primaryColor={primaryColor} 
              onSearch={(query: string) => {
                // Handle search
                router.push(`/products?search=${encodeURIComponent(query)}`);
                // Close search bar after search
                setSearchOpen(false);
              }} 
            />
          </div>
        )}
      </div>
      
      {/* Keyframe animation for mobile menu */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </header>
  )
}

function NavLink({ href, children, primaryColor }: { href: string, children: React.ReactNode, primaryColor: string }) {
  return (
    <Link 
      href={href} 
      className="text-gray-800 dark:text-gray-200 font-medium relative group"
      style={{ 
        fontFamily: 'Poppins, sans-serif',
        transition: 'color 0.2s'
      }}
      onMouseOver={(e) => e.currentTarget.style.color = primaryColor}
      onMouseOut={(e) => e.currentTarget.style.color = '#1f2937'}
      onMouseOutCapture={(e) => {
        if (document.documentElement.classList.contains('dark')) {
          e.currentTarget.style.color = '#e5e7eb';
        }
      }}
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

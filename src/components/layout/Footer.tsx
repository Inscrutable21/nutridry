import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300">
      <div className="container mx-auto px-4 md:px-6 py-12">
        {/* Mobile View Company Name */}
        <div className="md:hidden flex flex-col items-center mb-8">
          <Image 
            src="/logo.svg" 
            alt="TheNutriDry" 
            width={150} 
            height={50} 
            className="h-14 w-auto hover:opacity-80 transition-all duration-300"
          />
         

          
          <h2 className="text-xl font-bold mt-2">
            <span className="text-white">The</span>
            <span className="text-green-500">Nutri</span>
            <span className="text-amber-400">Dry</span>
          </h2>
        </div>
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="space-y-5 hidden md:block">
            <div className="flex flex-col items-start">
              <Image 
                src="/logo.svg" 
                alt="TheNutriDry" 
                width={180} 
                height={64} 
                className="h-16 w-auto hover:opacity-80 transition-all duration-300"
              />
              <Image 
                src="/logo1.svg" 
                alt="TheNutriDry" 
                width={180} 
                height={64} 
                className="h-16 w-auto hover:opacity-80 transition-all duration-300"
              />
              <h2 className="space-x-1 text-xl font-bold mt-2">
                <span className="text-white">The</span>
                <span className="text-green-500">NutriDry</span>
              </h2>
               <p>A Brand by Al-Ahad Trading Company</p>
            </div>
            <p className="text-sm max-w-xs leading-relaxed">
              Premium dehydrated fruits and vegetables. 100% natural, preservative-free, and nutrient-rich.
            </p>
            <div className="flex space-x-3 pt-2">
              <SocialIcon href="https://www.facebook.com/share/1UT7Jq47Lq/" icon="facebook" />
              <SocialIcon href="https://www.instagram.com/thenutridry?igsh=MTZqY2lsb3A2MHZocA==" icon="instagram" />
              <SocialIcon href="#" icon="twitter" />
            </div>
          </div>
          
          {/* Contact Details Column */}
          <div className="space-y-5">
            <h3 className="text-white font-semibold mb-5 text-lg">Contact Us</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-amber-400">Phone</p>
                <p>+91 9984001117</p>
                <p>+91 9984001113</p>
              </div>
              <div>
                <p className="font-medium text-amber-400">Email</p>
                <p>info.nutridry@gmail.com</p>
              </div>
              <div>
                <p className="font-medium text-amber-400">Location</p>
                <p className="leading-relaxed">122/3, Awadh Vihar Colony, Near Amausi Intl. Airport, Kanpur Road, Lucknow, 226023</p>
              </div>
            </div>
          </div>
          
          {/* Shop Links */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-lg">Shop</h3>
            <ul className="space-y-3 text-sm">
              <FooterLink href="/products">All Products</FooterLink>
              <FooterLink href="/products?limit=12&page=1&category=Fruits&cacheBust=1753109857841">Fruits</FooterLink>
              <FooterLink href="/products?limit=12&page=1&category=Spices%20%26%20Herbs&cacheBust=1753109899837">Spices & Herbs</FooterLink>
              <FooterLink href="/products?limit=12&page=1&category=Superfoods&cacheBust=1753109654421">Superfood</FooterLink>
              <FooterLink href="/products?limit=12&page=1&category=Herbs%20%26%20Floral&cacheBust=1753109933413">Herbs & Floral</FooterLink>
            </ul>
          </div>
          
          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-lg">Company</h3>
            <ul className="space-y-3 text-sm">
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
              <FooterLink href="/blog">Blog</FooterLink>
              <FooterLink href="/sustainability">Sustainability</FooterLink>
              <FooterLink href="/faq">FAQ</FooterLink>
            </ul>
          </div>
          
          {/* Customer Service Links */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-lg">Customer Service</h3>
            <ul className="space-y-3 text-sm">
              <FooterLink href="/Delivery">Delivery & Returns</FooterLink>
              <FooterLink href="/warranty">Product Guarantee</FooterLink>
              <FooterLink href="/bulk-order">Bulk Orders</FooterLink>
              <FooterLink href="/refund-policy">Refund Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
            </ul>
          </div>
        </div>
        
        {/* Bottom Section with Copyright and Payment Methods */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-gray-500">© 2025 TheNutriDry. All rights reserved.</p>
          <div className="flex items-center space-x-5 mt-6 md:mt-0">
            <Image 
              src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/visa.svg" 
              alt="Visa" 
              width={32} 
              height={20} 
              className="h-6 w-auto opacity-50 hover:opacity-80 transition-opacity"
            />
            <Image 
              src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/mastercard.svg" 
              alt="Mastercard" 
              width={32} 
              height={20} 
              className="h-6 w-auto opacity-50 hover:opacity-80 transition-opacity"
            />
            <Image 
              src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/applepay.svg" 
              alt="Apple Pay" 
              width={32} 
              height={20} 
              className="h-6 w-auto opacity-50 hover:opacity-80 transition-opacity"
            />
            <Image 
              src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/paypal.svg" 
              alt="PayPal" 
              width={32} 
              height={20} 
              className="h-6 w-auto opacity-50 hover:opacity-80 transition-opacity"
            />
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <li>
      <Link 
        href={href} 
        className="hover:text-amber-400 transition-colors duration-300 flex items-center group"
      >
        <span className="inline-block w-0 group-hover:w-2 transition-all duration-300 h-0.5 bg-amber-400 mr-0 group-hover:mr-2"></span>
        {children}
      </Link>
    </li>
  )
}

function SocialIcon({ href, icon }: { href: string, icon: string }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="h-9 w-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-amber-600 transition-all duration-300 transform hover:-translate-y-1"
      aria-label={icon}
    >
      <span className="sr-only">{icon}</span>
      {icon === 'facebook' && (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
        </svg>
      )}
      {icon === 'instagram' && (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
        </svg>
      )}
      {icon === 'twitter' && (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
        </svg>
      )}
    </a>
  )
}
// src/app/layout.tsx
import { Inter, Playfair_Display } from 'next/font/google'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context/AuthContext'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Preloader from '@/components/layout/Preloader'
import RecentPurchaseNotification from '@/components/RecentPurchaseNotification'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

export const metadata = {
  title: 'TheNutriDry | Premium Dehydrated Products',
  description: 'Discover premium quality dehydrated fruits and vegetables that are 100% natural with no additives or preservatives.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="flex flex-col min-h-screen bg-neutral-50">
        <Preloader />
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
            <Toaster position="top-right" />
            <RecentPurchaseNotification />
          </CartProvider>
        </AuthProvider>
        
        {/* Add a debug element to verify layout is loading */}
        <div id="layout-debug" className="sr-only">Layout loaded</div>
      </body>
    </html>
  )
}


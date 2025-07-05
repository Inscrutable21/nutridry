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
  // Check if the current path is an admin route
  const isAdminRoute = typeof window !== 'undefined' ? 
    window.location.pathname.startsWith('/admin') : false;

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <Preloader />
            {!isAdminRoute && <Navbar />}
            <main>{children}</main>
            {!isAdminRoute && <Footer />}
            {!isAdminRoute && <RecentPurchaseNotification />}
            <Toaster position="bottom-right" />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}



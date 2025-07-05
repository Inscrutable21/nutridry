// src/app/admin/layout.tsx
'use client';

import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { usePathname } from 'next/navigation';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  
  return (
    <div className={`${inter.className} min-h-screen bg-gray-100 ${isLoginPage ? '' : 'flex'}`}>
      {!isLoginPage && <AdminSidebar />}
      
      <div className={`${isLoginPage ? '' : 'flex-1 flex flex-col'}`}>
        {!isLoginPage && <AdminHeader />}
        
        <main className={isLoginPage ? '' : 'flex-1 p-6'}>
          {children}
        </main>
      </div>
      
      <Toaster position="top-right" />
    </div>
  );
}

// src/app/admin/dashboard/page.tsx
import { Suspense } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import Link from 'next/link';
// import DashboardStats from '@/components/admin/DashboardStats';

export const metadata = {
  title: 'Admin Dashboard | TheNutriDry',
  description: 'TheNutriDry admin dashboard',
};

export const dynamic = 'force-dynamic';

// Loading component for Suspense
function DashboardLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  );
}

// Separate component for fetching data
async function DashboardContent() {
  // Import here to avoid loading on server initialization
  const prisma = (await import('@/lib/prisma')).default;
  
  // Get product counts with error handling
  try {
    const [productCount, featuredCount, bestsellerCount] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { featured: true } }),
      prisma.product.count({ where: { bestseller: true } })
    ]);
    
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700">Products</h2>
            <p className="text-3xl font-bold mt-2">{productCount}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700">Featured Products</h2>
            <p className="text-3xl font-bold mt-2">{featuredCount}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700">Bestsellers</h2>
            <p className="text-3xl font-bold mt-2">{bestsellerCount}</p>
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <p className="text-red-700">Failed to load dashboard data. Please try refreshing the page.</p>
      </div>
    );
  }
}

export default async function AdminDashboardPage() {
  // Import auth here to avoid loading on server initialization
  const { requireAdmin } = await import('@/lib/auth');
  
  try {
    // Check authentication - now with await and error handling
    await requireAdmin();
  } catch (error) {
    console.error("Auth error:", error);
    // Auth redirect will happen in middleware, so we don't need to handle it here
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        <Suspense fallback={<DashboardLoading />}>
          <DashboardContent />
        </Suspense>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/admin/products/new"
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-lg text-center transition-colors"
            >
              Add New Product
            </Link>
            <Link
              href="/admin/products"
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center transition-colors"
            >
              Manage Products
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

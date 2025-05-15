// Create a cron job to warm up the cache
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const maxDuration = 60; // Changed from 300 to 60 seconds (maximum allowed on hobby plan)

// Define the type for the dashboard stats
interface DashboardStats {
  productCount: number;
  featuredCount: number;
  bestsellerCount: number;
  lastUpdated: string;
}

// Extend the global namespace to include our custom properties
declare global {
  // eslint-disable-next-line no-var
  var dashboardStats: DashboardStats | undefined;
}

// Create a type-safe reference to the global object
const globalWithDashboardStats = global as typeof global & {
  dashboardStats?: DashboardStats;
};

export async function GET() {
  try {
    // Get product counts and cache them
    const [productCount, featuredCount, bestsellerCount] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { featured: true } }),
      prisma.product.count({ where: { bestseller: true } })
    ]);
    
    // Store in a global cache with proper typing
    if (!globalWithDashboardStats.dashboardStats) {
      globalWithDashboardStats.dashboardStats = {
        productCount: 0,
        featuredCount: 0,
        bestsellerCount: 0,
        lastUpdated: ''
      };
    }
    
    // Update the stats
    globalWithDashboardStats.dashboardStats.productCount = productCount;
    globalWithDashboardStats.dashboardStats.featuredCount = featuredCount;
    globalWithDashboardStats.dashboardStats.bestsellerCount = bestsellerCount;
    globalWithDashboardStats.dashboardStats.lastUpdated = new Date().toISOString();
    
    return NextResponse.json({
      success: true,
      message: 'Cache warmed up successfully',
      stats: globalWithDashboardStats.dashboardStats
    });
  } catch (error) {
    console.error('Cache warming error:', error);
    return NextResponse.json(
      { error: 'Failed to warm up cache' },
      { status: 500 }
    );
  }
}
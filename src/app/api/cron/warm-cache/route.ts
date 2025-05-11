// Create a cron job to warm up the cache
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const maxDuration = 60; // Changed from 300 to 60 seconds (maximum allowed on hobby plan)

export async function GET() {
  try {
    // Get product counts and cache them
    const [productCount, featuredCount, bestsellerCount] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { featured: true } }),
      prisma.product.count({ where: { bestseller: true } })
    ]);
    
    // Store in a global cache with proper typing
    if (!global.dashboardStats) {
      global.dashboardStats = {
        productCount: 0,
        featuredCount: 0,
        bestsellerCount: 0,
        lastUpdated: ''
      };
    }
    
    // Update the stats
    global.dashboardStats.productCount = productCount;
    global.dashboardStats.featuredCount = featuredCount;
    global.dashboardStats.bestsellerCount = bestsellerCount;
    global.dashboardStats.lastUpdated = new Date().toISOString();
    
    return NextResponse.json({
      success: true,
      message: 'Cache warmed up successfully',
      stats: global.dashboardStats
    });
  } catch (error) {
    console.error('Cache warming error:', error);
    return NextResponse.json(
      { error: 'Failed to warm up cache' },
      { status: 500 }
    );
  }
}


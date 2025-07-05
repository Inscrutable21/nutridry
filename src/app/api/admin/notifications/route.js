import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/notifications - Get unread notifications
 * @param {import('next/server').NextRequest} request
 */
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    
    if (adminSession?.value !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Use prisma.order.findMany with fresh data
    const recentOrders = await prisma.order.findMany({
      where: {
        status: 'pending',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        total: true,
        createdAt: true,
        status: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });
    
    const notifications = recentOrders.map((order) => ({
      id: order.id,
      type: 'new_order',
      message: `New order from ${order.user?.name || 'Unknown'}`,
      amount: order.total,
      createdAt: order.createdAt,
      read: false, 
    }));
    
    // Add cache control headers to prevent caching
    return NextResponse.json(
      { notifications },
      { 
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}


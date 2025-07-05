import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

// GET /api/user/orders - Get user's orders
export async function GET(request: NextRequest) {
  try {
    // Get user ID from cookie
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('user_session');
    
    if (!userIdCookie || !userIdCookie.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = userIdCookie.value;
    
    // Get query parameters
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    
    // Get user's orders
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        address: true
      }
    });
    
    // Format orders for response
    const formattedOrders = orders.map(order => {
      // Parse items if stored as string
      const items = typeof order.items === 'string' 
        ? JSON.parse(order.items) 
        : order.items;
        
      return {
        ...order,
        items
      };
    });
    
    return NextResponse.json({ 
      orders: formattedOrders 
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}


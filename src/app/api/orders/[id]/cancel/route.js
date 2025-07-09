import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    // Get user ID from cookie
    const cookieStore = cookies();
    const userIdCookie = cookieStore.get('user_session');
    
    if (!userIdCookie || !userIdCookie.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = userIdCookie.value;
    const orderId = params.id;
    
    // Verify the order exists and belongs to the user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true, status: true }
    });
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    if (order.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Check if order can be cancelled
    if (!['pending', 'processing'].includes(order.status)) {
      return NextResponse.json(
        { error: 'This order cannot be cancelled' }, 
        { status: 400 }
      );
    }
    
    // Update order status to cancelled
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'cancelled' },
      include: {
        user: { select: { name: true, email: true, mobile: true } },
        address: true,
      },
    });

    if (typeof updatedOrder.items === 'string') {
      updatedOrder.items = JSON.parse(updatedOrder.items);
    }
    
    return NextResponse.json({ 
      order: updatedOrder, 
      message: 'Order cancelled successfully' 
    });
  } catch (error) {
    console.error(`Error cancelling order ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to cancel order' }, 
      { status: 500 }
    );
  }
}



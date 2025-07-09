import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    // Get user ID from cookie - use await
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('user_session');
    
    if (!userIdCookie || !userIdCookie.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = userIdCookie.value;
    // Await params before accessing id property
    const { id: orderId } = await params;
    
    // Handle empty request body
    let reason, description, images;
    try {
      const body = await request.json();
      reason = body.reason;
      description = body.description;
      images = body.images || [];
      
      // Validate image sizes to prevent database issues
      for (const image of images) {
        // Check if base64 image is too large (roughly 5MB)
        if (image.length > 7 * 1024 * 1024) {
          return NextResponse.json({ 
            error: 'Image size too large. Please use smaller images.' 
          }, { status: 400 });
        }
      }
    } catch (error) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    // Validate input
    if (!reason) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }
    
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
    
    // Check if order can be returned
    if (order.status !== 'delivered') {
      return NextResponse.json(
        { error: 'This order cannot be returned' }, 
        { status: 400 }
      );
    }
    
    // Create a return request
    const returnRequest = await prisma.return.create({
      data: {
        orderId,
        userId,
        reason,
        description,
        images: images || [],
        status: 'pending',
      }
    });
    
    // Update order status to return_requested
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'return_requested' },
    });
    
    return NextResponse.json({ 
      return: returnRequest, 
      message: 'Return requested successfully' 
    });
  } catch (error) {
    console.error(`Error requesting return for order:`, error);
    return NextResponse.json(
      { error: 'Failed to request return' }, 
      { status: 500 }
    );
  }
}






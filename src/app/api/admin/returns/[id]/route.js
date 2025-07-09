import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    // Verify admin authentication - use await
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    
    if (adminSession?.value !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const returnId = params.id;
    
    // Fetch the return with user information
    const returnData = await prisma.return.findUnique({
      where: { id: returnId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    
    if (!returnData) {
      return NextResponse.json({ error: 'Return not found' }, { status: 404 });
    }
    
    return NextResponse.json({ return: returnData });
  } catch (error) {
    console.error(`Error fetching return:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch return details' }, 
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    // Verify admin authentication - use await
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    
    if (adminSession?.value !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const returnId = params.id;
    const { status, adminNotes } = await request.json();
    
    // Validate input
    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }
    
    // Verify the return exists
    const returnItem = await prisma.return.findUnique({
      where: { id: returnId },
      select: { orderId: true, status: true }
    });
    
    if (!returnItem) {
      return NextResponse.json({ error: 'Return not found' }, { status: 404 });
    }
    
    // Update return status
    const updatedReturn = await prisma.return.update({
      where: { id: returnId },
      data: { 
        status,
        adminNotes: adminNotes || undefined,
      },
    });
    
    // If the return is completed, update the order status
    if (status === 'completed') {
      await prisma.order.update({
        where: { id: returnItem.orderId },
        data: { status: 'returned' },
      });
    }
    
    // If the return is rejected, update the order status back to delivered
    if (status === 'rejected' && returnItem.status === 'pending') {
      await prisma.order.update({
        where: { id: returnItem.orderId },
        data: { status: 'delivered' },
      });
    }
    
    return NextResponse.json({ 
      return: updatedReturn, 
      message: `Return ${status} successfully` 
    });
  } catch (error) {
    console.error(`Error updating return:`, error);
    return NextResponse.json(
      { error: 'Failed to update return' }, 
      { status: 500 }
    );
  }
}

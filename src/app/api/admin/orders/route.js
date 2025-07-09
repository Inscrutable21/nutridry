import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    // Get status from query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    // Build the query
    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }
    
    // Fetch orders with the specified filter
    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' }, 
      { status: 500 }
    );
  }
}
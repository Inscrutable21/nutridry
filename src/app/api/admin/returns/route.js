import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    // Verify admin authentication - use await
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    
    if (adminSession?.value !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get status from query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    // Build the query
    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }
    
    // Fetch returns with the specified filter
    const returns = await prisma.return.findMany({
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
    
    return NextResponse.json({ returns });
  } catch (error) {
    console.error('Error fetching returns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch returns' }, 
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    // Get user ID from cookie - use await
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('user_session');
    
    if (!userIdCookie || !userIdCookie.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = userIdCookie.value;
    
    // Get user's returns
    const returns = await prisma.return.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
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

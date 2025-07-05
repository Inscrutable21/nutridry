import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

// PUT /api/user/addresses/:id/default - Set an address as default
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Get user ID from cookie
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('user_session');
    
    if (!userIdCookie || !userIdCookie.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = userIdCookie.value;
    
    // Check if address belongs to user
    // @ts-ignore - Prisma types should be correctly generated
    const address = await prisma.address.findFirst({
      where: { id, userId },
    });
    
    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }
    
    // Unset any existing default address
    // @ts-ignore - Prisma types should be correctly generated
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
    
    // Set the selected address as default
    // @ts-ignore - Prisma types should be correctly generated
    await prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting default address:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


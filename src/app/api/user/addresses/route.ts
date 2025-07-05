import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

// GET /api/user/addresses - Get user's saved addresses
export async function GET(request: NextRequest) {
  try {
    // Get user ID from cookie
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('user_session');
    
    if (!userIdCookie || !userIdCookie.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = userIdCookie.value;
    
    // Get user's addresses - use a type assertion to bypass TypeScript error
    // @ts-ignore - Prisma types should be correctly generated
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
    
    return NextResponse.json({ addresses });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/user/addresses - Create a new address
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('user_session');
    
    if (!userIdCookie || !userIdCookie.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = userIdCookie.value;
    const addressData = await request.json();
    
    // If this is set as default, unset any existing default
    // @ts-ignore - Prisma types should be correctly generated
    if (addressData.isDefault) {
      // @ts-ignore - Prisma types should be correctly generated
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }
    
    // Create the new address
    // @ts-ignore - Prisma types should be correctly generated
    const address = await prisma.address.create({
      data: {
        name: addressData.name,
        email: addressData.email,
        phone: addressData.phone,
        address: addressData.address,
        pincode: addressData.pincode,
        locality: addressData.locality,
        city: addressData.city,
        state: addressData.state,
        landmark: addressData.landmark || null,
        alternatePhone: addressData.alternatePhone || null,
        isDefault: addressData.isDefault || false,
        userId,
      },
    });
    
    return NextResponse.json({ address });
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}









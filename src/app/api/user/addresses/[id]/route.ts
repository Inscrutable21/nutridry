import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

// PUT /api/user/addresses/:id - Update an address
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
    
    const addressData = await request.json();
    
   
    if (addressData.isDefault) {
   
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }
    const updatedAddress = await prisma.address.update({
      where: { id },
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
      },
    });
    
    return NextResponse.json({ address: updatedAddress });
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/user/addresses/:id - Delete an address
export async function DELETE(
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
    
    // Delete the address
    // @ts-ignore - Prisma types should be correctly generated
    await prisma.address.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}





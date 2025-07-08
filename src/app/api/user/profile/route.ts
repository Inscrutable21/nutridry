import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

// PUT /api/user/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    // Get user ID from cookie
    const cookieStore = await cookies(); // Add await here
    const userIdCookie = cookieStore.get('user_session');
    
    if (!userIdCookie || !userIdCookie.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = userIdCookie.value;
    
    // Rest of your code remains the same
    const { name, mobile } = await request.json();
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        mobile
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        isVerified: updatedUser.isVerified
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
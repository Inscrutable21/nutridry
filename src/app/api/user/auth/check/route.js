import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Check if user is logged in by verifying cookies
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');
    
    // If no cookie or empty value, user is not authenticated
    if (!sessionCookie || !sessionCookie.value || sessionCookie.value === '') {
      return NextResponse.json({
        isAuthenticated: false,
        user: null,
        message: 'Not authenticated'
      });
    }
    
    // Get user from database using the session ID
    const userId = sessionCookie.value;
    
    // If the cookie value is just 'true', return a simplified response
    if (userId === 'true') {
      return NextResponse.json({
        isAuthenticated: true,
        user: { isVerified: true },
        message: 'Authenticated'
      });
    }
    
    try {
      // Otherwise, fetch the user from the database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
          isVerified: true
        }
      });
      
      // If user not found but cookie exists, clear the cookie
      if (!user) {
        cookieStore.set({
          name: 'user_session',
          value: '',
          expires: new Date(0),
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        
        return NextResponse.json({
          isAuthenticated: false,
          user: null,
          message: 'User not found'
        });
      }
      
      return NextResponse.json({
        isAuthenticated: true,
        user,
        message: 'Authenticated'
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({
        isAuthenticated: false,
        user: null,
        message: 'Database error'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('User auth check error:', error);
    return NextResponse.json(
      { error: 'Error checking authentication status' },
      { status: 500 }
    );
  }
}


import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check if user is verified
    if (!user.isVerified) {
      return NextResponse.json(
        { success: false, message: 'Please verify your email first' },
        { status: 403 }
      );
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Set user session cookie directly without OTP
    const cookieStore = cookies();
    
    // Create the response object first
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      redirectUrl: '/',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile || null,
        isVerified: user.isVerified || false
      }
    });
    
    // Set the cookie on the response object
    response.cookies.set({
      name: 'user_session',
      value: user.id,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'strict'
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}




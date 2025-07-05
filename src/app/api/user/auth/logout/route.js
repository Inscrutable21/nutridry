import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Get the cookie store
    const cookieStore = await cookies();
    
    // Clear the user session cookie by setting it to expire immediately
    cookieStore.set({
      name: 'user_session',
      value: '',
      expires: new Date(0), // Set to epoch time (1970-01-01) to expire immediately
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}
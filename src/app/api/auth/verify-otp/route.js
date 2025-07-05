import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, otp } = body;
    
    console.log('Verifying OTP for email:', email, 'OTP:', otp);
    
    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: 400 }
      );
    }
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('Stored OTP:', user.otp, 'Expiry:', user.otpExpiry);
    }
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if OTP is valid and not expired
    if (user.otp !== otp) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification code' },
        { status: 400 }
      );
    }
    
    if (user.otpExpiry && new Date() > user.otpExpiry) {
      return NextResponse.json(
        { success: false, message: 'Verification code has expired' },
        { status: 400 }
      );
    }
    
    // Mark user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otp: null,
        otpExpiry: null
      }
    });
    
    console.log('User verified successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred during verification',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

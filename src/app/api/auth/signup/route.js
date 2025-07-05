import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';

// Initialize Resend with error handling
let resend;
try {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not defined in environment variables');
  }
  resend = new Resend(process.env.RESEND_API_KEY);
} catch (error) {
  console.error('Failed to initialize Resend:', error);
}

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, mobile } = body;
    
    // Validate input
    if (!name || !email || !password || !mobile) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Create user with pending verification status
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        mobile,
        isVerified: false,
        otp,
        otpExpiry
      }
    });
    
    // Send OTP email
    const emailResult = await resend.emails.send({
      from: 'TheNutriDry <noreply@thenutridry.com>', // Use Resend's default domain
      to: email,
      subject: 'Verify your TheNutriDry account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to TheNutriDry!</h2>
          <p>Hello ${name},</p>
          <p>Thank you for signing up. To complete your registration, please use the verification code below:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
            <strong>${otp}</strong>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <p>Best regards,<br>TheNutriDry Team</p>
        </div>
      `
    });
    
    console.log('Email sent successfully:', emailResult);
    
    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email'
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    return NextResponse.json(
      { success: false, message: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}



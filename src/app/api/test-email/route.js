import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req) {
  try {
    // Log the API key (first few characters only for security)
    const apiKey = process.env.RESEND_API_KEY || '';
    const maskedKey = apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 4);
    console.log('Using Resend API key:', maskedKey);
    
    // Send a test email using your verified domain
    const result = await resend.emails.send({
      from: 'TheNutriDry <noreply@thenutridry.com>', // Use your verified domain
      to: 'anandsinghoffical21@gmail.com', // This should be your registered email
      subject: 'Test Email from TheNutriDry',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Test Email</h2>
          <p>This is a test email to verify the Resend configuration.</p>
          <p>If you're seeing this, the email service is working correctly!</p>
          <p>Time sent: ${new Date().toISOString()}</p>
        </div>
      `
    });
    
    console.log('Test email result:', result);
    
    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      result
    });
  } catch (error) {
    console.error('Test email error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to send test email',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
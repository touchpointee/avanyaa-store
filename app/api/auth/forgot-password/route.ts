import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() });

    // Note: Always return success to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json({ message: 'If an account with that email exists, we have sent a reset link to it.' });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const tokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    user.resetToken = hashedToken;
    user.resetTokenExpiry = tokenExpiry;
    await user.save();

    // Create reset URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Avanyaa Store" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Please click the link below to reset your password:\n\n${resetUrl}\n\nThis link will expire in 30 minutes. If you did not request a password reset, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You recently requested to reset your password for your Avanyaa Store account.</p>
          <p>Click the button below to reset it. This link will expire in 30 minutes.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #265b9f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
          </div>
          <p>If you did not request a password reset, please ignore this email or reply to let us know. This password reset is only valid for the next 30 minutes.</p>
          <hr style="margin-top: 40px; border-top: 1px solid #eaeaea;" />
          <p style="font-size: 12px; color: #666;">If you're having trouble clicking the password reset button, copy and paste the URL below into your web browser:</p>
          <p style="font-size: 12px; color: #666; word-break: break-all;">${resetUrl}</p>
        </div>
      `,
    };

    if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
       await transporter.sendMail(mailOptions);
    } else {
       console.warn('⚠️ SMTP credentials missing. Emulating email sending...');
       console.log('Reset Link:', resetUrl);
    }

    return NextResponse.json({ message: 'If an account with that email exists, we have sent a reset link to it.' });
  } catch (error: any) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Failed to process request. Please try again later.' }, { status: 500 });
  }
}

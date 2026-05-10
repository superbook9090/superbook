// src/app/api/payments/teacher-registration/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { razorpayService } from '@/features/payments/services/razorpayService';
import { getTeacherRegistrationFee, getPaymentConfig } from '@/lib/settingsHelpers';
import { logApiError, type LogContext } from '@/lib/logger';

export async function POST(request: Request) {
  const logContext: LogContext = {
    method: 'POST',
    path: '/api/payments/teacher-registration',
  };

  try {
    await dbConnect();

    const { name, email, password, inviteCode } = await request.json();

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get payment configuration
    const paymentConfig = await getPaymentConfig();
    const fee = await getTeacherRegistrationFee();

    if (!paymentConfig.teacherRegistrationRequired || fee <= 0) {
      return NextResponse.json(
        { message: 'Payment not required for teacher registration' },
        { status: 400 }
      );
    }

    // Create Razorpay order for teacher registration
    const orderResponse = await razorpayService.createOrder({
      userId: email, // Use email as temporary user ID since user doesn't exist yet
      courseId: 'teacher-registration', // Special course ID for registration
      amount: fee,
      currency: paymentConfig.currency,
      receipt: `teacher-registration-${email}-${Date.now()}`,
      notes: {
        purpose: 'teacher-registration',
        name,
        email,
        password, // Store password temporarily for post-payment registration
        inviteCode: inviteCode || '',
        registrationData: JSON.stringify({
          name,
          email,
          password,
          inviteCode: inviteCode || '',
          role: 'teacher'
        })
      }
    });

    return NextResponse.json({
      message: 'Teacher registration payment order created',
      order: orderResponse,
      fee: fee,
      currency: paymentConfig.currency,
    }, { status: 201 });

  } catch (error) {
    logApiError(error as Error, 'POST', '/api/payments/teacher-registration', logContext);
    return NextResponse.json(
      { message: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}

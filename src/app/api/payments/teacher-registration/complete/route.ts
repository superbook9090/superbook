// src/app/api/payments/teacher-registration/complete/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { razorpayService } from '@/features/payments/services/razorpayService';
import User from '@/models/User';
import Organization from '@/models/Organization';
import { logApiError, type LogContext } from '@/lib/logger';

export async function POST(request: Request) {
  const logContext: LogContext = {
    method: 'POST',
    path: '/api/payments/teacher-registration/complete',
  };

  try {
    await dbConnect();

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = await request.json();

    // Verify payment
    const payment = await razorpayService.verifyPayment({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });

    if (!payment) {
      return NextResponse.json(
        { message: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Get the order details to extract registration data
    const order = await razorpayService.getOrderDetails(razorpayOrderId);
    const registrationData = JSON.parse(order.notes?.registrationData || '{}');

    const { name, email, password, inviteCode, role } = registrationData;

    // Check if user already exists (in case registration was completed elsewhere)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    // Handle organization joining via invite code
    let organizationId = null;
    if (inviteCode) {
      const organization = await Organization.findOne({ inviteCode, isActive: true });
      if (organization) {
        organizationId = organization._id;
      }
    }

    // Create user account
    const user = new User({
      name,
      email,
      password,
      role: role || 'teacher',
      organizationId,
      teacherRegistrationPaymentId: payment._id,
      teacherRegistrationCompletedAt: new Date(),
    });

    await user.save();

    return NextResponse.json({
      message: 'Teacher registration completed successfully',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId?.toString() || null,
      }
    }, { status: 201 });

  } catch (error) {
    logApiError(error as Error, 'POST', '/api/payments/teacher-registration/complete', logContext);
    return NextResponse.json(
      { message: 'Failed to complete teacher registration' },
      { status: 500 }
    );
  }
}

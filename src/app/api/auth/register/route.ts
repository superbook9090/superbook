// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { isRegistrationAllowed } from '@/lib/settingsHelpers';
import { logApiError, type LogContext } from '@/lib/logger';

export async function POST(request: Request) {
  const logContext: LogContext = {
    method: 'POST',
    path: '/api/auth/register',
  };

  try {
    await dbConnect();

    // Check if registration is allowed
    const registrationAllowed = await isRegistrationAllowed();
    if (!registrationAllowed) {
      return NextResponse.json(
        { message: 'Registration is currently disabled by admin' },
        { status: 403 }
      );
    }

    const { name, email, password, role = 'student' } = await request.json();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    // Create user (password will be hashed by User model's pre-save hook)
    const user = new User({
      name,
      email,
      password,
      role,
    });

    await user.save();

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/auth/register', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();

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
    console.error('Registration error:', error);
    const message = error instanceof Error ? error.message : 'Error creating user';
    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}
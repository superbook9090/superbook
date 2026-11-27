// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { isRegistrationAllowed, isTeacherRegistrationAllowed } from '@/lib/settingsHelpers';
import { findUserByEmail } from '@/lib/user/findByEmail';
import { logApiError, type LogContext } from '@/lib/logger';
import {
  resolveOrganizationInvite,
  sanitizeRegistrationRole,
} from '@/lib/organizations/resolveInvite';

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

    const body = await request.json();
    const { name: rawName, email: rawEmail, password, role: rawRole, inviteCode } = body ?? {};

    const name = typeof rawName === 'string' ? rawName.trim() : '';
    const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';

    if (!name || name.length > 100) {
      return NextResponse.json(
        { message: 'Please provide a valid name (1-100 characters)' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Strictly allowlist registrable roles — never allow admin or superadmin self-registration
    const role = sanitizeRegistrationRole(rawRole);
    if (!role) {
      return NextResponse.json(
        { message: 'Invalid role. Only student or teacher accounts can be registered.' },
        { status: 400 }
      );
    }

    // Handle organization joining via invite code
    let organizationId = null;
    const trimmedInviteCode = typeof inviteCode === 'string' ? inviteCode.trim() : '';
    if (trimmedInviteCode) {
      const resolved = await resolveOrganizationInvite(trimmedInviteCode, role);
      if (!resolved.ok) {
        return NextResponse.json(
          { message: resolved.message },
          { status: resolved.status }
        );
      }
      organizationId = resolved.data.organization._id;
    } else if (role === 'teacher') {
      // Independent teacher registration respects the global teacher registration toggle
      const teacherRegistrationAllowed = await isTeacherRegistrationAllowed();
      if (!teacherRegistrationAllowed) {
        return NextResponse.json(
          { message: 'Teacher registration is currently disabled by admin' },
          { status: 403 }
        );
      }
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
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
      organizationId,
    });

    await user.save();

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId?.toString() || null,
        },
      },
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

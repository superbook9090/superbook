import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { logApiError, type LogContext } from '@/lib/logger';
import { getAdminAuth } from '@/lib/notifications/push/firebase-admin';

export async function POST(request: Request) {
  const logContext: LogContext = { method: 'POST', path: '/api/auth/add-phone' };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { firebaseIdToken } = await request.json();
    if (!firebaseIdToken || typeof firebaseIdToken !== 'string') {
      return NextResponse.json({ message: 'Firebase ID token is required' }, { status: 400 });
    }

    const adminAuth = getAdminAuth();
    if (!adminAuth) {
      return NextResponse.json({ message: 'Firebase Admin Auth not initialized' }, { status: 500 });
    }

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(firebaseIdToken);
    } catch (e) {
      console.error('Firebase Admin Token verification failed:', e);
      return NextResponse.json({ message: 'Invalid or expired Firebase ID token' }, { status: 400 });
    }

    const phoneNumber = decodedToken.phone_number;
    if (!phoneNumber) {
      return NextResponse.json({ message: 'No phone number found in token' }, { status: 400 });
    }

    await dbConnect();

    // Check if another user has this phone number
    const duplicatePhoneUser = await User.findOne({
      phone: phoneNumber,
      _id: { $ne: session.user.id }
    });

    if (duplicatePhoneUser) {
      return NextResponse.json(
        { message: 'This phone number is already linked to another account' },
        { status: 400 }
      );
    }

    // Link phone number to current user
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { phone: phoneNumber },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Phone number linked successfully',
      phone: phoneNumber,
    });
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/auth/add-phone', logContext);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

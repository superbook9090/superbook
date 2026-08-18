// src/app/api/admin/users/[userId]/email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import dbConnect from '@/lib/db';
import { validateObjectId } from '@/lib/sanitize';
import { logApiError, type LogContext } from '@/lib/logger';
import { isAdmin, isSuperAdmin } from '@/lib/roles';
import { sendDirectUserEmail } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const resolvedParams = await params;
  const { userId } = resolvedParams;

  const logContext: LogContext = {
    method: 'POST',
    path: `/api/admin/users/${userId}/email`,
  };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    logContext.userId = session.user.id;

    if (!userId || !validateObjectId(userId)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    const { subject, message } = await request.json();

    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return NextResponse.json({ message: 'Subject is required' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ message: 'Message is required' }, { status: 400 });
    }

    if (subject.length > 200) {
      return NextResponse.json({ message: 'Subject is too long (max 200 characters)' }, { status: 400 });
    }

    if (message.length > 5000) {
      return NextResponse.json({ message: 'Message is too long (max 5000 characters)' }, { status: 400 });
    }

    await dbConnect();

    const targetUser = await User.findById(userId).select('name email organizationId').lean();

    if (!targetUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (!targetUser.email) {
      return NextResponse.json({ message: 'Target user does not have an email address' }, { status: 400 });
    }

    // Organization-level authorization
    if (!isSuperAdmin(session.user.role)) {
      const adminOrgId = session.user.organizationId?.toString();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userOrgId = (targetUser as any).organizationId?.toString();

      if (adminOrgId !== userOrgId) {
        return NextResponse.json(
          { message: 'You can only email users in your organization' },
          { status: 403 }
        );
      }
    }

    await sendDirectUserEmail({
      to: targetUser.email,
      recipientName: targetUser.name,
      subject: subject.trim(),
      message: message.trim(),
      senderName: session.user.name || 'Platform Administrator',
      replyTo: session.user.email || undefined,
    });

    return NextResponse.json(
      { success: true, message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    logApiError(error as Error, 'POST', `/api/admin/users/${userId}/email`, logContext);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to send email. Please try again later.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import FileNode from '@/models/FileNode';
import { getAccessFilter } from '@/lib/accessControl';
import { logApiError, type LogContext } from '@/lib/logger';
import { requireAuthenticatedSession } from '@/lib/filesAccess';

export const dynamic = 'force-dynamic';

function isPdfFile(name: string, fileType?: string | null) {
  const t = (fileType || '').toLowerCase();
  if (t === 'pdf' || t === 'application/pdf') return true;
  return name.toLowerCase().endsWith('.pdf');
}

// GET /api/files/view/[id] - Authenticated users; stream PDF inline (same org/public rules as listing)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = { method: 'GET', path: '/api/files/view/[id]' };

  try {
    const session = await getServerSession(authOptions);
    const denied = requireAuthenticatedSession(session);
    if (denied) return denied;
    logContext.userId = session!.user!.id;

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid file ID' }, { status: 400 });
    }

    await dbConnect();

    const user = {
      _id: new mongoose.Types.ObjectId(session!.user!.id),
      organizationId: session!.user!.organizationId
        ? new mongoose.Types.ObjectId(session!.user!.organizationId)
        : null,
      role: session!.user!.role as 'student' | 'teacher' | 'admin' | 'superadmin',
    };

    const accessFilter = getAccessFilter(user);
    const fileId = new mongoose.Types.ObjectId(id);

    const file = await FileNode.findOne({
      ...accessFilter,
      _id: fileId,
      type: 'file',
    }).select('name fileUrl fileType');

    if (!file) {
      return NextResponse.json({ message: 'File not found' }, { status: 404 });
    }

    if (!isPdfFile(file.name, file.fileType)) {
      return NextResponse.json({ message: 'Only PDF files can be viewed' }, { status: 415 });
    }

    try {
      const response = await fetch(file.fileUrl, { redirect: 'follow' });
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const safeName = file.name.replace(/["\r\n]/g, '_');

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${safeName}"`,
          'X-Content-Type-Options': 'nosniff',
          'Cache-Control': 'private, max-age=300',
        },
      });
    } catch (error) {
      logApiError(error as Error, 'GET', '/api/files/view/[id]', logContext);
      return NextResponse.json({ message: 'Unable to load file for viewing' }, { status: 502 });
    }
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/files/view/[id]', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

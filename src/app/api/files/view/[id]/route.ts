import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import FileNode from '@/models/FileNode';
import { getAccessFilter } from '@/lib/accessControl';
import { logApiError, type LogContext } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// GET /api/files/view/[id] - View file in browser instead of downloading
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = { method: 'GET', path: '/api/files/view/[id]' };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    logContext.userId = session.user.id;

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid file ID' }, { status: 400 });
    }

    await dbConnect();

    const user = {
      _id: new mongoose.Types.ObjectId(session.user.id),
      organizationId: session.user.organizationId
        ? new mongoose.Types.ObjectId(session.user.organizationId)
        : null,
      role: session.user.role as 'student' | 'teacher' | 'admin' | 'superadmin',
    };

    // Check if user has access to view files
    if (user.role !== 'student' && user.role !== 'admin' && user.role !== 'superadmin') {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

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

    // Redirect to the file URL with proper headers to encourage viewing
    if (file.fileType?.toLowerCase() === 'pdf') {
      // For PDFs, we can serve them with inline disposition
      try {
        const response = await fetch(file.fileUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch file');
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${file.name}"`,
            'Cache-Control': 'public, max-age=3600',
          },
        });
      } catch (error) {
        logApiError(error as Error, 'GET', '/api/files/view/[id]', logContext);
        // Fallback to direct URL if serving fails
        return NextResponse.redirect(file.fileUrl);
      }
    } else {
      // For other file types, redirect to original URL
      return NextResponse.redirect(file.fileUrl);
    }
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/files/view/[id]', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

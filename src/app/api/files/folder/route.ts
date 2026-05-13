import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import FileNode from '@/models/FileNode';
import { createFolderSchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
import { invalidatePattern } from '@/lib/redis';
import { assertParentIsFolder, normalizeParentId } from '@/lib/fileNodes';
import { requireFilesSuperadmin } from '@/lib/filesAccess';

export const dynamic = 'force-dynamic';

// POST /api/files/folder
export async function POST(request: NextRequest) {
  const logContext: LogContext = { method: 'POST', path: '/api/files/folder' };

  try {
    const session = await getServerSession(authOptions);
    const denied = requireFilesSuperadmin(session);
    if (denied) return denied;
    logContext.userId = session!.user!.id;

    await dbConnect();

    const body = await request.json();
    const parsed = createFolderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: parsed.error.issues },
        { status: 400 }
      );
    }

    const parentId = normalizeParentId(parsed.data.parentId ?? null);
    await assertParentIsFolder(parentId);

    const authUser = session!.user;

    const organizationId = authUser.organizationId
      ? new mongoose.Types.ObjectId(authUser.organizationId)
      : null;

    const node = await FileNode.create({
      name: parsed.data.name,
      type: 'folder',
      parentId,
      uploadedBy: new mongoose.Types.ObjectId(authUser.id),
      organizationId,
    });

    const orgKey = authUser.organizationId || 'public';
    const parentKey = parentId ? parentId.toString() : 'root';
    await invalidatePattern(`files:${orgKey}:${parentKey}:*`);

    return NextResponse.json({ folder: node }, { status: 201 });
  } catch (error) {
    const statusCode = (error as unknown as { statusCode?: number }).statusCode;
    if (statusCode) {
      return NextResponse.json({ message: (error as Error).message }, { status: statusCode });
    }

    // Handle duplicate name errors from unique index
    if ((error as unknown as { code?: number }).code === 11000) {
      return NextResponse.json(
        { message: 'A folder with this name already exists in this location' },
        { status: 409 }
      );
    }

    logApiError(error as Error, 'POST', '/api/files/folder', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}


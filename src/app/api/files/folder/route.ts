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

    const parentIdRaw = typeof parsed.data.parentId === 'string' ? parsed.data.parentId.trim() : '';
    if (parentIdRaw && !mongoose.Types.ObjectId.isValid(parentIdRaw)) {
      return NextResponse.json({ message: 'Invalid parentId' }, { status: 400 });
    }
    const parentId = normalizeParentId(parentIdRaw || null);
    await assertParentIsFolder(parentId);

    const authUser = session!.user;

    let organizationId: mongoose.Types.ObjectId | null = authUser.organizationId
      ? new mongoose.Types.ObjectId(authUser.organizationId)
      : null;

    if (parentId) {
      const parentFolder = await FileNode.findById(parentId)
        .select('organizationId')
        .lean<{ organizationId?: mongoose.Types.ObjectId | null } | null>();
      organizationId = parentFolder?.organizationId ?? null;
    }

    const node = await FileNode.create({
      name: parsed.data.name,
      type: 'folder',
      parentId,
      uploadedBy: new mongoose.Types.ObjectId(authUser.id),
      organizationId,
    });

    const orgKey = organizationId?.toString() || 'public';
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


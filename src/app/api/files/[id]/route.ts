import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import FileNode from '@/models/FileNode';
import { logApiError, type LogContext } from '@/lib/logger';
import { invalidatePattern } from '@/lib/redis';
import { cloudinary, isCloudinaryConfigured } from '@/lib/cloudinary';
import { collectSubtreeFiles, collectSubtreeIds } from '@/lib/fileNodes';
import { requireFilesSuperadmin } from '@/lib/filesAccess';

export const dynamic = 'force-dynamic';

// PATCH /api/files/:id (rename)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = { method: 'PATCH', path: '/api/files/[id]' };

  try {
    const session = await getServerSession(authOptions);
    const denied = requireFilesSuperadmin(session);
    if (denied) return denied;
    logContext.userId = session!.user!.id;

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    if (!name) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }
    if (name.length > 255) {
      return NextResponse.json({ message: 'Name is too long' }, { status: 400 });
    }

    await dbConnect();

    const node = await FileNode.findById(id);
    if (!node) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }

    node.name = name;
    await node.save();

    const orgKey = session!.user!.organizationId || 'public';
    await invalidatePattern(`files:${orgKey}:*`);

    return NextResponse.json({ node }, { status: 200 });
  } catch (error) {
    // Duplicate name in same folder
    if ((error as unknown as { code?: number }).code === 11000) {
      return NextResponse.json(
        { message: 'An item with this name already exists in this location' },
        { status: 409 }
      );
    }

    logApiError(error as Error, 'PATCH', '/api/files/[id]', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

// DELETE /api/files/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = { method: 'DELETE', path: '/api/files/[id]' };

  try {
    const session = await getServerSession(authOptions);
    const denied = requireFilesSuperadmin(session);
    if (denied) return denied;
    logContext.userId = session!.user!.id;

    await dbConnect();

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
    }

    const node = await FileNode.findById(id).select('_id type parentId').lean();
    if (!node) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }

    const rootId = new mongoose.Types.ObjectId(id);
    const ids = await collectSubtreeIds(rootId);

    // If Cloudinary is configured, delete raw resources for files
    if (isCloudinaryConfigured()) {
      const files = await collectSubtreeFiles(ids);
      const publicIds = files.map(f => f.publicId).filter(Boolean) as string[];
      if (publicIds.length) {
        await cloudinary.api.delete_resources(publicIds, { resource_type: 'raw' });
      }
    }

    await FileNode.deleteMany({ _id: { $in: ids } });

    const orgKey = session!.user!.organizationId || 'public';
    await invalidatePattern(`files:${orgKey}:*`);

    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
  } catch (error) {
    logApiError(error as Error, 'DELETE', '/api/files/[id]', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import FileNode from '@/models/FileNode';
import { logApiError, type LogContext } from '@/lib/logger';
import { invalidatePattern } from '@/lib/redis';
import { assertParentIsFolder, normalizeParentId } from '@/lib/fileNodes';
import { cloudinary, isCloudinaryConfigured } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

const MAX_PDF_BYTES = 20 * 1024 * 1024; // 20MB

function sanitizePublicIdPart(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '');
}

async function uploadRawToCloudinary(buffer: Buffer, opts: { folder: string; publicId: string }) {
  return new Promise<{ secure_url: string; public_id: string; bytes: number }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: opts.folder,
        public_id: opts.publicId,
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          bytes: result.bytes,
        });
      }
    );
    stream.end(buffer);
  });
}

// POST /api/files/upload (PDF only)
export async function POST(request: NextRequest) {
  const logContext: LogContext = { method: 'POST', path: '/api/files/upload' };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    logContext.userId = session.user.id;

    if (session.user.role !== 'superadmin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        { message: 'Cloudinary is not configured' },
        { status: 500 }
      );
    }

    await dbConnect();

    const form = await request.formData();
    const file = form.get('file');
    const parentIdRaw = form.get('parentId');

    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'Missing file' }, { status: 400 });
    }

    const parentIdStr = typeof parentIdRaw === 'string' ? parentIdRaw : null;
    const parentId = normalizeParentId(parentIdStr);
    await assertParentIsFolder(parentId);

    if (file.size <= 0) {
      return NextResponse.json({ message: 'Empty file' }, { status: 400 });
    }
    if (file.size > MAX_PDF_BYTES) {
      return NextResponse.json(
        { message: 'File too large (max 20MB)' },
        { status: 413 }
      );
    }

    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      return NextResponse.json({ message: 'Only PDF files are allowed' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const folder = `file-manager/${parentId ? parentId.toString() : 'root'}`;
    const baseName = file.name.replace(/\.pdf$/i, '');
    const publicId = `${Date.now()}-${sanitizePublicIdPart(baseName)}`;

    const uploaded = await uploadRawToCloudinary(buffer, { folder, publicId });

    const organizationId = session.user.organizationId
      ? new mongoose.Types.ObjectId(session.user.organizationId)
      : null;

    const node = await FileNode.create({
      name: file.name,
      type: 'file',
      parentId,
      fileUrl: uploaded.secure_url,
      publicId: uploaded.public_id,
      fileType: 'pdf',
      size: uploaded.bytes,
      uploadedBy: new mongoose.Types.ObjectId(session.user.id),
      organizationId,
    });

    const orgKey = session.user.organizationId || 'public';
    const parentKey = parentId ? parentId.toString() : 'root';
    await invalidatePattern(`files:${orgKey}:${parentKey}:*`);

    return NextResponse.json({ file: node }, { status: 201 });
  } catch (error) {
    // Handle duplicate name errors from unique index
    if ((error as unknown as { code?: number }).code === 11000) {
      return NextResponse.json(
        { message: 'A file with this name already exists in this location' },
        { status: 409 }
      );
    }

    const statusCode = (error as unknown as { statusCode?: number }).statusCode;
    if (statusCode) {
      return NextResponse.json({ message: (error as Error).message }, { status: statusCode });
    }

    logApiError(error as Error, 'POST', '/api/files/upload', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}


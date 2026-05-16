import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cloudinary, isCloudinaryConfigured } from '@/lib/cloudinary';
import { logApiError } from '@/lib/logger';
import { MAX_IMAGE_SIZE_BYTES } from '@/lib/constants';

export const dynamic = 'force-dynamic';

async function uploadToCloudinary(buffer: Buffer, folder: string) {
  return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );
    stream.end(buffer);
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role;
    if (!['teacher', 'admin', 'superadmin'].includes(role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        { message: 'Cloudinary is not configured' },
        { status: 500 }
      );
    }

    const form = await request.formData();
    const file = form.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'Missing file' }, { status: 400 });
    }

    if (file.size <= 0) {
      return NextResponse.json({ message: 'Empty file' }, { status: 400 });
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { message: 'File too large (max 1MB)' },
        { status: 413 }
      );
    }

    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      return NextResponse.json({ message: 'Only image files are allowed' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const folder = `course-thumbnails/${session.user.id}`;
    
    const uploaded = await uploadToCloudinary(buffer, folder);

    return NextResponse.json({ url: uploaded.secure_url }, { status: 201 });
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/upload/image');
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

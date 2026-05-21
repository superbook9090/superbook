import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadVideoToYouTube, validateVideoContentType, MAX_VIDEO_SIZE_BYTES } from '@/lib/youtube';
import User from '@/models/User';
import dbConnect from '@/lib/db';
import { logApiError } from '@/lib/logger';
import fs from 'fs';
import path from 'path';
import os from 'os';
import stream, { Readable } from 'stream';
import { pipeline } from 'stream/promises';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes (adjust based on Vercel plan, or up to 300s)

// Helper to convert Web ReadableStream to Node Readable
function nodeReadableFromWebStream(webStream: ReadableStream<Uint8Array>): Readable {
  const reader = webStream.getReader();
  return new Readable({
    async read() {
      try {
        const { done, value } = await reader.read();
        if (done) {
          this.push(null);
        } else {
          this.push(Buffer.from(value));
        }
      } catch (err) {
        this.destroy(err as Error);
      }
    },
  });
}

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id).lean() as any;
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'teacher' && user.role !== 'superadmin' && user.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Teachers must have upload permission explicitly granted
    if (user.role === 'teacher' && !user.canUploadVideos) {
      return NextResponse.json(
        { message: 'Forbidden: You do not have permission to upload videos.' },
        { status: 403 }
      );
    }

    const title = request.nextUrl.searchParams.get('title') || 'Lecture Video';
    const description = request.nextUrl.searchParams.get('description') || '';

    // Validate content type
    const contentType = request.headers.get('content-type') || '';
    let ext;
    try {
      ext = validateVideoContentType(contentType);
    } catch (err: any) {
      return NextResponse.json({ message: err.message }, { status: 400 });
    }

    // Validate size via Content-Length header (initial check)
    const contentLengthStr = request.headers.get('content-length');
    if (contentLengthStr) {
      const contentLength = parseInt(contentLengthStr, 10);
      if (contentLength > MAX_VIDEO_SIZE_BYTES) {
        return NextResponse.json(
          { message: `File too large (max 2GB)` },
          { status: 413 }
        );
      }
    }

    if (!request.body) {
      return NextResponse.json({ message: 'Empty file payload' }, { status: 400 });
    }

    // Write file locally to temp location using streaming
    const tempDir = os.tmpdir();
    const tempFileName = `upload_${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`;
    tempFilePath = path.join(tempDir, tempFileName);

    const writeStream = fs.createWriteStream(tempFilePath);
    
    // We convert the Next.js Request body (Web Stream) to a Node.js Stream
    const nodeStream = nodeReadableFromWebStream(request.body as ReadableStream<Uint8Array>);

    let totalBytesWritten = 0;
    
    // Custom transform to track size during stream
    const sizeTracker = new TransformStream({
      transform(chunk, controller) {
        totalBytesWritten += chunk.length;
        if (totalBytesWritten > MAX_VIDEO_SIZE_BYTES) {
          controller.error(new Error('Payload size exceeded 2GB limit'));
        } else {
          controller.enqueue(chunk);
        }
      }
    });

    // Instead of doing standard node pipeline with sizeTracker which is a Web stream,
    // we just use a pass-through node stream.
    const passThrough = new stream.PassThrough();
    passThrough.on('data', (chunk) => {
      totalBytesWritten += chunk.length;
      if (totalBytesWritten > MAX_VIDEO_SIZE_BYTES) {
        passThrough.destroy(new Error('Payload size exceeded 2GB limit'));
      }
    });

    await pipeline(nodeStream, passThrough, writeStream);

    // Upload to YouTube
    const result = await uploadVideoToYouTube(tempFilePath, { title, description });

    // Clean up local temp file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      await fs.promises.unlink(tempFilePath);
      tempFilePath = null;
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    logApiError(error as Error, 'POST', '/api/video/upload');
    // Clean up local temp file in case of failure
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        await fs.promises.unlink(tempFilePath);
      } catch {
        // Silently catch clean-up errors
      }
    }
    
    if (error.message && error.message.includes('Payload size exceeded')) {
      return NextResponse.json({ message: 'File too large (max 2GB)' }, { status: 413 });
    }
    
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

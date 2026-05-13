import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import FileNode from '@/models/FileNode';
import { getAccessFilter } from '@/lib/accessControl';
import { getCachedData, setCachedData } from '@/lib/redis';
import { serialize } from '@/lib/serialize';
import { paginationSchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
import { requireAuthenticatedSession } from '@/lib/filesAccess';

export const dynamic = 'force-dynamic';

// GET /api/files?parentId=
export async function GET(request: NextRequest) {
  const logContext: LogContext = { method: 'GET', path: '/api/files' };

  try {
    const session = await getServerSession(authOptions);
    const denied = requireAuthenticatedSession(session);
    if (denied) return denied;

    const authUser = session!.user;
    logContext.userId = authUser.id;
    const isSuperadmin = authUser.role === 'superadmin';

    const { searchParams } = new URL(request.url);
    const parentIdRaw = searchParams.get('parentId');

    const paginationParsed = paginationSchema.safeParse({
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    });

    const page = paginationParsed.success ? paginationParsed.data.page || 1 : 1;
    const limit = paginationParsed.success ? paginationParsed.data.limit || 50 : 50;
    const skip = (page - 1) * limit;

    const orgId = authUser.organizationId || 'public';
    const parentKey = parentIdRaw || 'root';
    const cacheScope = isSuperadmin ? 'full' : 'ro';
    const cacheKey = `files:${orgId}:${parentKey}:${page}:${limit}:${cacheScope}`;

    const cached = await getCachedData<unknown>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    await dbConnect();

    const user = {
      _id: new mongoose.Types.ObjectId(authUser.id),
      organizationId: authUser.organizationId
        ? new mongoose.Types.ObjectId(authUser.organizationId)
        : null,
      role: authUser.role as 'student' | 'teacher' | 'admin' | 'superadmin',
    };

    const accessFilter = getAccessFilter(user);
    const parentId = parentIdRaw ? new mongoose.Types.ObjectId(parentIdRaw) : null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseQuery: Record<string, any> = {
      ...accessFilter,
      parentId,
    };

    const fileFields = isSuperadmin
      ? 'name type parentId fileUrl fileType size createdAt updatedAt'
      : 'name type parentId fileType size createdAt updatedAt';

    const [folders, files, foldersTotal, filesTotal] = await Promise.all([
      FileNode.find({ ...baseQuery, type: 'folder' })
        .select('name type parentId organizationId createdAt updatedAt')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FileNode.find({ ...baseQuery, type: 'file' })
        .select(fileFields)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FileNode.countDocuments({ ...baseQuery, type: 'folder' }),
      FileNode.countDocuments({ ...baseQuery, type: 'file' }),
    ]);

    const responseData = serialize({
      folders,
      files,
      pagination: {
        page,
        limit,
        foldersTotal,
        filesTotal,
      },
    });

    await setCachedData(cacheKey, responseData, 300);

    return NextResponse.json(responseData, {
      status: 200,
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/files', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}


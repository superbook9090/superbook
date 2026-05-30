import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createFavoriteSchema } from '@/lib/validation';
import { serialize } from '@/lib/serialize';
import { logApiError, type LogContext } from '@/lib/logger';
import { jsonSuccess, jsonApiError } from '@/lib/server/api-response';
import { listMeta, parseOffsetPagination } from '@/lib/server/pagination';
import {
  addFavoriteForUser,
  getFavoriteBlogIds,
  favoriteIdsCacheKey,
  invalidateFavoriteIdsCache,
  listFavoritesPage,
} from '@/lib/server/services/favorites-service';
import { getCachedData, setCachedData } from '@/lib/redis';

const privateCache = {
  'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=120',
} as const;

// GET /api/favorites — paginated list, or idsOnly for lightweight client Sets
export async function GET(req: NextRequest) {
  const logContext: LogContext = { method: 'GET', path: '/api/favorites' };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return jsonApiError('UNAUTHORIZED', 'Unauthorized', 401, { headers: privateCache });
    }
    logContext.userId = session.user.id;

    const { searchParams } = new URL(req.url);

    if (searchParams.get('idsOnly') === 'true') {
      const cacheKey = favoriteIdsCacheKey(session.user.id);
      const cached = await getCachedData<string[]>(cacheKey);
      if (cached) {
        return jsonSuccess({ ids: cached }, { headers: privateCache });
      }

      const ids = await getFavoriteBlogIds(session.user.id);
      await setCachedData(cacheKey, ids, 60);
      return jsonSuccess({ ids }, { headers: privateCache });
    }

    const { page, limit, skip } = parseOffsetPagination(searchParams);
    const includeContent = searchParams.get('includeContent') === 'true';

    const { items, total } = await listFavoritesPage(session.user.id, {
      page,
      limit,
      skip,
      includeContent,
    });

    const serialized = serialize(items) as typeof items;

    return jsonSuccess(
      { favorites: serialized },
      {
        meta: listMeta(page, limit, total, serialized.length),
        headers: privateCache,
      }
    );
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/favorites', logContext);
    return jsonApiError('INTERNAL', 'Failed to fetch favorites', 500);
  }
}

// POST /api/favorites — add blog to favorites
export async function POST(req: NextRequest) {
  const logContext: LogContext = { method: 'POST', path: '/api/favorites' };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return jsonApiError('UNAUTHORIZED', 'Unauthorized', 401);
    }
    logContext.userId = session.user.id;

    const body = await req.json();
    const validationResult = createFavoriteSchema.safeParse(body);
    if (!validationResult.success) {
      return jsonApiError('VALIDATION', 'Invalid input', 400);
    }

    const { blogId } = validationResult.data;
    const result = await addFavoriteForUser(session.user.id, blogId);

    if (!result.ok) {
      if (result.reason === 'not_found') {
        return jsonApiError('NOT_FOUND', 'Blog not found', 404);
      }
      return jsonApiError('CONFLICT', 'Already in favorites', 409);
    }

    const favorite = serialize(result.favorite) as typeof result.favorite;
    await invalidateFavoriteIdsCache(session.user.id);
    return jsonSuccess({ favorite }, { status: 201 });
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/favorites', logContext);
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return jsonApiError('CONFLICT', 'Already in favorites', 409);
    }
    return jsonApiError('INTERNAL', 'Failed to add favorite', 500);
  }
}

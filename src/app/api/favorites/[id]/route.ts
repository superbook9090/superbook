import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import { logApiError, type LogContext } from '@/lib/logger';
import { jsonSuccess, jsonApiError } from '@/lib/server/api-response';
import { removeFavoriteBlog, invalidateFavoriteIdsCache } from '@/lib/server/services/favorites-service';

// DELETE /api/favorites/[id] - Remove blog from favorites
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = {
    method: 'DELETE',
    path: '/api/favorites/[id]',
  };

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return jsonApiError('UNAUTHORIZED', 'Unauthorized', 401);
    }

    logContext.userId = session.user.id;

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonApiError('VALIDATION', 'Invalid ID', 400);
    }

    const outcome = await removeFavoriteBlog(session.user.id, id);

    if (outcome === 'no_document') {
      return jsonApiError('NOT_FOUND', 'User favorites not found', 404);
    }
    if (outcome === 'not_in_list') {
      return jsonApiError('NOT_FOUND', 'Blog not in favorites', 404);
    }

    await invalidateFavoriteIdsCache(session.user.id);
    return jsonSuccess({ removed: true });
  } catch (error) {
    logApiError(error as Error, 'DELETE', '/api/favorites/[id]', logContext);
    return jsonApiError('INTERNAL', 'Something went wrong. Please try again later.', 500);
  }
}

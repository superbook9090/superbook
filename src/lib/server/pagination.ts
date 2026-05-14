import type { ApiResponseMeta } from './api-response';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export interface OffsetPagination {
  page: number;
  limit: number;
  skip: number;
}

export function parseOffsetPagination(
  searchParams: URLSearchParams,
  options?: { defaultLimit?: number; maxLimit?: number }
): OffsetPagination {
  const maxLimit = options?.maxLimit ?? MAX_LIMIT;
  const defaultLimit = options?.defaultLimit ?? DEFAULT_LIMIT;

  const rawPage = parseInt(searchParams.get('page') || String(DEFAULT_PAGE), 10);
  const rawLimit = parseInt(searchParams.get('limit') || String(defaultLimit), 10);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : DEFAULT_PAGE;
  let limit = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

export function listMeta(page: number, limit: number, total: number, itemCount: number): ApiResponseMeta {
  const skip = (page - 1) * limit;
  return {
    page,
    limit,
    total,
    hasMore: skip + itemCount < total,
  };
}

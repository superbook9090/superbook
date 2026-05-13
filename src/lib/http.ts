import { NextResponse } from 'next/server';
import type { ApiJsonErrorBody } from '@/types';

type JsonErrorOptions = Pick<ApiJsonErrorBody, 'code' | 'errors'>;

/**
 * Consistent JSON error responses for API routes.
 * Clients may rely on `message`; `ok: false` allows typed narrowing.
 */
export function jsonError(
  message: string,
  status: number,
  options?: JsonErrorOptions
): NextResponse<ApiJsonErrorBody> {
  const body: ApiJsonErrorBody = {
    ok: false,
    message,
    ...(options?.code !== undefined && { code: options.code }),
    ...(options?.errors !== undefined && { errors: options.errors }),
  };
  return NextResponse.json(body, { status });
}

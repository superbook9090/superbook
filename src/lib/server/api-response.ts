import { NextResponse } from 'next/server';

/** Standard envelope for App Router JSON handlers (Phase 1 stabilization). */
export interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  meta?: ApiResponseMeta;
}

export interface ApiErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
  };
  meta?: ApiResponseMeta;
}

export type ApiResponseEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;

export interface ApiResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  hasMore?: boolean;
}

export function jsonSuccess<T>(data: T, init?: { status?: number; meta?: ApiResponseMeta; headers?: HeadersInit }): NextResponse<ApiSuccessEnvelope<T>> {
  const body: ApiSuccessEnvelope<T> = {
    success: true,
    data,
    ...(init?.meta !== undefined ? { meta: init.meta } : {}),
  };
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: init?.headers,
  });
}

export function jsonApiError(
  code: string,
  message: string,
  status: number,
  init?: { meta?: ApiResponseMeta; headers?: HeadersInit }
): NextResponse<ApiErrorEnvelope> {
  const body: ApiErrorEnvelope = {
    success: false,
    error: { code, message },
    ...(init?.meta !== undefined ? { meta: init.meta } : {}),
  };
  return NextResponse.json(body, { status, headers: init?.headers });
}

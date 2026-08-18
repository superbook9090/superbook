---
name: lms-api-endpoint
description: >-
  Use this skill when creating, modifying, caching, or debugging backend API routes in Next.js App Router (src/app/api),
  including authentication, Zod validation, Mongoose operations, and Redis caching.
---

# LMS API Route Handler Standard

This skill outlines the required architecture and standards for developing backend API endpoints (`src/app/api/*`) in Next.js 15.

## Standard Endpoint Template

Every API route handler must follow this structured template:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { logApiError, logInfo, type LogContext } from '@/lib/logger';
import { updateExampleSchema } from '@/lib/validation';
import { getCachedData, setCachedData, deleteCachedData } from '@/lib/redis';
import { requireFeature } from '@/lib/settingsHelpers';

export async function POST(req: NextRequest) {
  const logContext: LogContext = {
    method: 'POST',
    path: '/api/example',
  };

  try {
    // 1. Feature Flag Check (if module is toggleable)
    const featureGuard = await requireFeature('enableCourses');
    if (featureGuard) return featureGuard;

    // 2. Authentication Check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    logContext.userId = session.user.id;

    // 3. Input Validation with Zod Schema
    const body = await req.json();
    const validation = updateExampleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validation.error.issues },
        { status: 400 }
      );
    }

    // 4. Database Connection & Operation
    await dbConnect();
    const { data } = validation;
    // Perform database operations...

    // 5. Cache Invalidation (if mutating cached resources)
    await deleteCachedData(`cache:example:${session.user.id}`);

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    logApiError(error as Error, 'POST', logContext.path, logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
```

---

## Key Best Practices

1. **Zod Validation (`src/lib/validation.ts`)**:
   - Centralize all request payload schemas in `src/lib/validation.ts`.
   - Never write ad-hoc validation inline when a shared schema can be reused.

2. **Database Queries (`src/models/*`)**:
   - Always call `await dbConnect()` before executing Mongoose queries.
   - For read-only operations, append `.lean()` to Mongoose queries for significant performance benefits.
   - Avoid creating duplicate indexes on models.

3. **Redis Caching (`src/lib/redis.ts`)**:
   - Redis is optional; helper functions fail silently and preserve DB fallback.
   - For cached `GET` routes: Check `getCachedData(key)` first -> if miss, fetch from Mongo -> write with `setCachedData(key, data, ttl)`.
   - For mutating `POST`/`PUT`/`PATCH`/`DELETE` routes: Always invalidate relevant keys using `deleteCachedData(key)` or `invalidatePattern(pattern)`.

4. **Security & Authorization**:
   - Never trust frontend role assertions; always read `session.user.role` from `getServerSession(authOptions)`.
   - Check ownership of resources (`doc.teacherId.toString() === session.user.id` or `isAdmin(session.user.role)`).

---

## Verification Steps

1. Run `npm run lint` to verify types and avoid unhandled Promise rejections.
2. Run `npm run build` to ensure server imports and route exports comply with Next.js App Router requirements.
3. Test edge cases:
   - Unauthenticated request -> 401
   - Unauthorized role -> 403
   - Malformed payload -> 400 with validation details
   - Successful mutation -> 200/201 and cache properly cleared

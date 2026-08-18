# Backend API, Database & Caching Rules

All backend routes and database operations must adhere to the following standards:

## 1. Next.js 15 Route Handlers (`src/app/api/*`)
- Route handlers must export named HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
- Handlers must be wrapped in `try/catch` with structured logging using `logApiError(error, method, path, logContext)` from `src/lib/logger`.

## 2. Authentication & Authorization
- Always authenticate requests at the API layer via `getServerSession(authOptions)`.
- Never trust client-supplied user IDs or role claims; always use `session.user.id` and `session.user.role`.

## 3. Zod Schema Validation (`src/lib/validation.ts`)
- All request payloads (`req.json()`) and search parameters must be validated against schemas defined in `src/lib/validation.ts` using `schema.safeParse()`.
- Return a standard `400 Bad Request` with `validation.error.issues` on validation failures.

## 4. Mongoose Database Practices
- Always call `await dbConnect()` before executing database queries.
- Use `.lean()` for read-only queries to optimize execution time and memory.
- Avoid duplicate indexes in Mongoose schemas (do not add `.index({ field: 1 })` when `unique: true` is already present).

## 5. Redis Caching & Invalidation (`src/lib/redis.ts`)
- Redis is optional; helpers must fail silently to preserve MongoDB fallback behavior.
- **Cache Invalidation**: Every mutating route handler (`POST`, `PUT`, `PATCH`, `DELETE`) that updates cached data MUST call `await deleteCachedData(key)` or `await invalidatePattern(pattern)` before returning.
- Keep cache keys standardized (e.g. `'app:settings'`, `'user:progress:${userId}'`).

## 6. Feature Gating
- For toggleable features (blogs, quizzes, courses, notes, analytics), guard the API route with `requireFeature('enableFeature')` from `src/lib/settingsHelpers`.

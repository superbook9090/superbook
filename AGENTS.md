# AGENTS.md

## Purpose

This repository is a Next.js 15 learning platform application (`super-book` / `quiz-do`) built with the App Router, TypeScript, MongoDB, NextAuth, and optional Redis caching.

Use this file as the default orientation for agents working in this repo.

## Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- MongoDB + Mongoose
- NextAuth
- Zustand
- Redis / Upstash Redis (optional)
- TipTap

## Repo Layout

- `src/app`: App Router pages, layouts, route handlers
- `src/app/api`: backend API routes
- `src/components`: UI and feature components
- `src/contexts`: React context providers
- `src/hooks`: custom hooks
- `src/lib`: shared utilities, auth, db, API clients, caching, validation
- `src/models`: Mongoose models
- `src/store`: Zustand stores
- `src/i18n`: translation dictionaries
- `public`: static assets

## Important Routes

- `/`: landing page
- `/login`, `/register`: auth pages
- `/dashboard`: authenticated app shell
- `/dashboard/admin`: admin-only area
- `/api/*`: backend routes

Middleware in `src/middleware.ts` protects dashboard routes, blocks authenticated users from auth pages, and applies API rate limiting.

## Scripts

- `npm run dev`: start local dev server with Turbopack
- `npm run build`: production build
- `npm run start`: start production server
- `npm run lint`: run ESLint

## Environment

Expected environment variables include:

- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `REDIS_URL` (optional)

There is an existing `.env` file in the repo. Do not print secrets into chat.

## Working Conventions

- Prefer narrow, localized edits. This repo already has user changes in flight.
- Do not revert unrelated changes.
- Keep authorization checks at the API layer. Frontend guards are secondary.
- Redis is optional. Preserve DB fallback behavior.
- Follow existing role model: `student`, `teacher`, `admin`, `superadmin`.
- Keep English/Hindi i18n support intact when touching user-facing copy.
- Favor existing helpers in `src/lib` over introducing new patterns.

## Verification

For most code changes:

1. Run `npm run lint`.
2. If behavior changed in routes or auth, validate the affected flow manually.
3. If caching or role filtering changed, verify both authorized and unauthorized cases.

## Current Notes

- The worktree is not clean. Existing modifications are present in:
  - `src/app/(dashboard)/dashboard/teacher/analytics/page.tsx`
  - `src/app/(dashboard)/dashboard/teacher/quizzes/page.tsx`
  - `src/app/api/analytics/route.ts`
- Treat those as user-owned unless the task explicitly requires touching them.

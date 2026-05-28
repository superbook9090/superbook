# AGENTS.md

## Purpose

This repository is a Next.js 15 learning platform application (`super-book` / `Quiz-Do`) built with the App Router, TypeScript, MongoDB, NextAuth, and optional Redis caching.

Use this file as the default orientation for agents working in this repo. For full product/architecture detail, see `PROJECT_DOCUMENTATION.md`.

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
- Firebase Cloud Messaging (push + in-app notifications)

## Repo Layout

- `src/app`: App Router pages, layouts, route handlers
- `src/app/api`: backend API routes
- `src/components`: UI and feature components
- `src/components/layout`: shared page shell (`PageWrapper`, `PageHeader`, `DashboardContent`, `ResponsiveGrid`, `EmptyState`)
- `src/constants`: navigation config (`navigation.ts`), spacing token names (`spacing.ts`)
- `src/contexts`: React context providers
- `src/hooks`: custom hooks
- `src/lib`: shared utilities, auth, db, API clients, caching, validation
- `src/lib/roles.ts`: role helpers and dashboard home routing
- `src/lib/notifications/push`: Firebase client + lazy Admin init
- `src/models`: Mongoose models
- `src/store`: Zustand stores
- `src/i18n`: translation dictionaries (en, hi)
- `public`: static assets (includes `firebase-messaging-sw.js`, `.well-known/assetlinks.json`)

## Important Routes

- `/`: landing page
- `/login`, `/register`: auth pages
- `/dashboard`: redirects to role home (`getDashboardHomePath`)
- `/dashboard/student`, `/dashboard/teacher`, `/dashboard/admin`: role dashboards
- `/dashboard/admin/*`: admin-only area (middleware protected)
- `/dashboard/student/notifications`: student in-app notification inbox
- `/dashboard/admin/notifications`: admin push broadcast (superadmin nav)
- `/api/*`: backend routes

Middleware in `src/middleware.ts` protects dashboard routes, blocks authenticated users from auth pages, and applies API rate limiting.

## Roles & routing

Roles: `student`, `teacher`, `admin`, `superadmin`.

Use helpers from `src/lib/roles.ts` — do not hardcode role checks or dashboard paths:

- `normalizeRole`, `isAdmin`, `isSuperAdmin`, `isStaffRole`
- `getDashboardHomePath(role)` → `/dashboard/student` | `/dashboard/teacher` | `/dashboard/admin`
- `withDashboardHome(navItems, role)` — patches the dashboard nav item href

Navigation arrays live in `src/constants/navigation.ts` (`STUDENT_NAV`, `TEACHER_NAV`, `ADMIN_NAV`).

## Layout & spacing

Prefer shared layout primitives over ad-hoc `space-y-*` / `p-4 sm:p-6`:

- Components: `src/components/layout/*`
- CSS tokens & utilities: `src/app/globals.css` (`--gutter-x`, `--section-gap`, `.stack-page`, `.card-body`, `.mobile-header-spacer`, etc.)
- TS reference: `src/constants/spacing.ts`

Mobile shell: `MobileNav` (header + language switcher), `MobileBottomNav`, role sidebars. Pass `homePath={getDashboardHomePath(role)}` to header/nav components.

## Scripts

- `npm run dev`: local dev server with Turbopack
- `npm run build`: production build (`next build`, not Turbopack)
- `npm run start`: start production server
- `npm run lint`: run ESLint

## Environment

Expected environment variables include:

- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_SITE_URL` (optional; canonical URL for SEO metadata, sitemap, and Open Graph — defaults to `NEXTAUTH_URL`)
- `REDIS_URL` (optional)
- Firebase client: `NEXT_PUBLIC_FIREBASE_*`, `NEXT_PUBLIC_FIREBASE_VAPID_KEY`
- Firebase Admin: `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`

There is an existing `.env` file in the repo. Do not print secrets into chat.

## Working Conventions

- Prefer narrow, localized edits. This repo may have user changes in flight.
- Do not revert unrelated changes.
- Keep authorization checks at the API layer. Frontend guards are secondary.
- Redis is optional. Preserve DB fallback behavior.
- Keep English/Hindi i18n support intact when touching user-facing copy.
- Favor existing helpers in `src/lib` over introducing new patterns.
- Mongoose: avoid duplicate indexes (e.g. do not add `.index({ field: 1 })` when `unique: true` is already on the field).
- Firebase Admin: use `getAdminMessaging()` lazily; no top-level init in modules imported at build time.
- When editing TSX with many JSX tags, prefer careful small edits — bulk writes can corrupt `<>` fragments.

## Verification

For most code changes:

1. Run `npm run lint`.
2. Run `npm run build` if routes, auth, models, or server imports changed.
3. If behavior changed in routes or auth, validate the affected flow manually.
4. If caching or role filtering changed, verify both authorized and unauthorized cases.

## Current Notes

- Spacing/layout migration is partial — high-traffic dashboard pages use shared layout; many form/detail pages may still use legacy spacing.
- User-owned in-flight changes may exist in teacher analytics/quizzes and analytics API — treat as user-owned unless the task requires touching them.

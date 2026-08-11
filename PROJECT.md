# Quiz-Do - Learning Management System

## 1. Project Overview

Quiz-Do is a modern Learning Management System (LMS) built with Next.js 15, featuring role-based access control, course management (including optional private courses via teacher-generated codes), quizzes, blogs, analytics, push notifications, and comprehensive admin controls. The platform supports both English and Hindi languages with instant switching capabilities.

## 2. Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components, API Routes)
- **Dev bundler**: Turbopack (`npm run dev --turbopack`)
- **Production build**: `next build` (standard webpack; not Turbopack)
- **Language**: TypeScript
- **Database**: MongoDB + Mongoose
- **Authentication**: NextAuth (JWT-based session handling)
- **State Management**: Zustand (client-side caching)
- **Caching**: Upstash Redis (server-side, optional/fallback-safe)
- **Styling**: Tailwind CSS 4 with centralized design tokens in `src/app/globals.css`
- **Animations**: Framer Motion
- **Rich Text**: TipTap editor
- **File Processing**: xlsx (Excel parsing), BullMQ (job queue)
- **Image Processing**: Cloudinary integration
- **Analytics**: Vercel Analytics & Speed Insights
- **Security**: DOMPurify (XSS protection), bcryptjs (password hashing)

## 3. Authentication & Authorization

### Roles

- **superadmin**: Full platform access, organization management
- **admin**: User management within their organization, platform configuration
- **teacher**: Content creation (courses, quizzes, blogs), student analytics
- **student**: Course enrollment, quiz taking, progress tracking

### Phone Authentication (Firebase OTP)

The platform supports Phone Authentication using Firebase Auth Client SDK and Firebase Admin SDK:
- **Registration & Login**: Users can log in or register via their phone numbers. OTP code verification is processed inline using Firebase's invisible reCAPTCHA.
- **NextAuth Integration**: NextAuth's `CredentialsProvider` accepts the verified Firebase ID Token, validates it server-side using the Firebase Admin SDK, and retrieves or registers the matching user in MongoDB.
- **Mock Email Generation**: For phone-only registrations, a mock email address (`phone-[clean_number]@phone.quizdo.com`) is generated to satisfy database schema and application requirements.
- **Linking Phone/Email/Password**: 
  - Phone-registered users can add/link a real email address and set up a password from their profile dashboard page inline.
  - Pre-existing accounts (registered via email or Google OAuth) can securely link a verified phone number to their account from their Profile page.

### Access Control

All authorization checks are enforced at **API level** (backend), not frontend.

#### User Management API (`/api/admin/users`)

**Super Admin:**
- Can access ALL users (no organization filter)

**Admin (with organizationId):**
- Can access:
  - Users in their organization
  - Users with `organizationId = null` (public users)
- Cannot access users from other organizations

**Admin (without organizationId):**
- Can access ONLY users with `organizationId = null` (public users)

**MongoDB Query Example:**
```javascript
{
  $or: [
    { organizationId: user.organizationId },
    { organizationId: null },
    { organizationId: { $exists: false } }
  ]
}
```

### Content Access Control (`getAccessFilter`)

**Super Admin:**
- Full access to all content (no filter)

**Admin:**
- Can ONLY see content from their organization (not public content)
- Cannot see content from other organizations

**Student/Teacher with organization:**
- Can see public content + content from their organization

**Student/Teacher without organization:**
- Can only see public content

### Route Protection

- Middleware protects `/dashboard/admin/*` routes (admin and superadmin only)
- `/dashboard` redirects server-side to the role home via `getDashboardHomePath()` in `src/lib/roles.ts`
- Frontend role guards as secondary security layer
- API-level authorization checks for all endpoints

### Role-based dashboard home

| Role | Default route |
|------|----------------|
| `student` | `/dashboard/student` |
| `teacher` | `/dashboard/teacher` |
| `admin`, `superadmin` | `/dashboard/admin` |

Helpers in `src/lib/roles.ts`: `normalizeRole`, `isAdmin`, `isSuperAdmin`, `isStaffRole`, `getDashboardHomePath`, `withDashboardHome`.

Profile routes: `/dashboard/student/profile`, `/dashboard/teacher/profile`, `/dashboard/admin/profile`.

## 4. State Management (Zustand)

Global stores used to cache frequently accessed data and prevent redundant API calls:

### Stores

**useSessionStore:**
- Caches user session data
- Prevents repeated `/api/auth/session` calls
- Persists session state across components
- Fetches blog favorites (`/api/favorites?idsOnly=true`) **only for students** — teachers/admins do not use favorites

**useCachedStore:**
- Caches enrollments by userId
- Courses by organizationId
- Quiz attempts by userId
- Prevents duplicate API calls to `/api/enrollments`, `/api/quiz-attempts`, `/api/courses`

### Usage Pattern

```javascript
const { enrollments: enrollmentsCache, fetchEnrollments } = useCachedStore();
const userId = session?.user?.id;
const enrollmentState = userId ? enrollmentsCache[userId] : null;

// Only fetch if not cached
if (!enrollmentState) {
  fetchEnrollments(userId);
}
```

## 5. API Optimization Strategy

### Prevent Duplicate API Calls

- Use `useEffect` guards to check if data is already cached
- Store checks before making API requests
- Cache data in Zustand stores with proper invalidation

### MongoDB Query Optimization

**Use `.lean()` for performance:**
```javascript
User.find(query).select('-password').lean()
```

**Field Projection (select only required fields):**
```javascript
User.find(query).select('name email role organizationId').lean()
```

**Indexes:**
- `organizationId` on User, Course, Quiz, Blog models
- `userId` on Enrollment, QuizAttempt, Favorite models
- `courseId` on Enrollment model
- `courses.slug` — partial unique index (`slug: { $gt: '' }`); only non-empty slugs are indexed
- `courses.courseCode` — sparse unique index (private courses only)
- Index repair helpers: `ensureCourseIndexes()` (`Course`), `ensureChapterIndexes()` (`Chapter`)

### Example Optimized Query

```javascript
const users = await User.find(query)
  .select('name email role organizationId')
  .skip(skip)
  .limit(limit)
  .lean();
```

## 6. Redis Caching

Redis is **OPTIONAL** and fault-tolerant. If Redis is unavailable, system continues to work by falling back to database.

### Usage

Cache heavy GET APIs:
- `/api/courses` (published courses)
- `/api/blogs` (published blogs)
- `/api/analytics` (aggregated data)

### TTL Configuration
- Courses: 300 seconds (5 minutes)
- Blogs: 300 seconds (5 minutes)
- Analytics: 60 seconds (1 minute)

### Implementation Pattern

```javascript
import { getCachedData, setCachedData, invalidatePattern } from '@/lib/redis';

// GET - Try cache first
const cacheKey = `courses:${orgId}:${page}:${limit}`;
const cached = await getCachedData(cacheKey);
if (cached) return NextResponse.json(cached);

// Fetch from DB
const data = await Course.find(query).lean();

// Set cache
await setCachedData(cacheKey, data, 300);

// POST/PUT/DELETE - Invalidate cache
await invalidatePattern(`courses:${orgId}:*`);
```

### Safety Mechanisms

All Redis operations are wrapped in try/catch:

```javascript
try {
  const cached = await getCachedData(cacheKey);
  if (cached) return cached;
} catch (error) {
  console.warn('[Redis] Cache unavailable, falling back to DB');
  // Continue to DB fetch
}
```

## 7. Performance Fixes Implemented

### Reduced Excessive API Calls
- Fixed repeated `/api/auth/session` calls using Zustand session store
- Capped enrollment and quiz-attempt API calls to once per session
- Added cache checks before API requests

### Database Query Optimization
- Added `.lean()` to all Mongoose queries for better performance
- Implemented field projection to reduce data transfer
- Added proper indexes on frequently queried fields

### Caching Strategy
- Implemented Redis caching for heavy read operations
- Added Zustand stores for client-side data caching
- Implemented cache invalidation on data mutations

### Improved Dashboard Load Times
- Reduced initial API calls from 15+ to 3-5 per page load
- Added skeleton loaders for better perceived performance
- Implemented parallel data fetching where possible

## 8. Known Issues & Safeguards

### Redis Connection Failures
- **Safeguard**: All Redis calls wrapped in try/catch
- **Fallback**: System continues to work using database only
- **Logging**: Warnings logged when Redis is unavailable

### Cache Staleness
- **Safeguard**: TTL-based expiration (60-300 seconds)
- **Invalidation**: Cache invalidated on POST/PUT/DELETE operations
- **Fallback**: Data always available from database

### Data Leakage Prevention
- **Safeguard**: Strict backend filtering by organizationId
- **Safeguard**: Role-based access control at API level
- **Safeguard**: Frontend role guards as secondary layer

### Session Sync
- **Issue**: Type mismatch between NextAuth Session and Zustand Session
- **Fix**: Type casting in SessionSync component
- **Status**: Functional, pending proper type definition update

### Course slug duplicate key (E11000) — resolved
- **Issue**: `POST /api/courses` intermittently failed with `E11000 dup key: { slug: null }` when multiple courses were created
- **Cause**: `slug` defaulted to `null`, so MongoDB's unique index treated every unset course as the same value
- **Fix**: Omit `slug` when unset; partial unique index on non-empty slugs; `ensureCourseIndexes()` repairs legacy data/index on first course create after deploy
- **Status**: Fixed in `src/models/Course.ts` and `POST /api/courses`

## 9. Folder Structure (High Level)

```
src/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── student/     # Student dashboard
│   │   │   ├── teacher/     # Teacher dashboard
│   │   │   └── admin/       # Admin panel
│   ├── tools/
│   │   └── [slug]/          # Dynamic SEO landing pages (SSG)
│   │       ├── page.tsx     # Server component — metadata, JSON-LD, static params
│   │       └── ToolClient.tsx # Client component — landing page UI
│   ├── courses/
│   │   ├── page.tsx         # Public course catalog (ISR)
│   │   └── [slug]/page.tsx  # Public course detail page (SSG/ISR)
│   └── api/                 # API routes
│       ├── admin/           # Admin-only endpoints
│       ├── auth/            # NextAuth configuration
│       ├── courses/         # Course management
│       ├── quizzes/         # Quiz management
│       ├── blogs/           # Blog management
│       ├── notes/           # Personal notes management & limits validation
│       ├── enrollments/     # Enrollment tracking (+ join-by-code)
│       ├── notifications/   # Push + in-app notification APIs
│       ├── quiz-attempts/   # Quiz results
│       ├── favorites/       # Blog favorites
│       ├── organizations/   # Organization management
│       └── analytics/       # Analytics data
├── components/
│   ├── layout/              # PageWrapper, PageHeader, ResponsiveGrid, DashboardContent
│   ├── providers/           # SessionProvider, PushNotificationManager
│   └── ui/                  # Reusable UI components
├── constants/
│   ├── navigation.ts        # STUDENT_NAV, TEACHER_NAV, ADMIN_NAV
│   ├── routes.ts            # Centralized route constants (incl. tools helper)
│   └── spacing.ts           # CSS token name reference for layout
├── contexts/                # React contexts (AppSettings, RoleTheme)
├── data/
│   └── seo-tools.ts         # SEO tool page data registry (20 keywords)
├── features/                # Feature-specific components
│   ├── courses/
│   ├── quizzes/
│   ├── blogs/
│   └── notes/               # Note cards, modal editor, limit banners
├── hooks/                   # Custom React hooks
├── i18n/                    # Translation files (en, hi)
│   └── seo-tools/           # Hindi SEO tool landing page copy
├── lib/                     # Utility functions
│   ├── db.ts                # Database connection
│   ├── redis.ts             # Upstash Redis client
│   ├── auth.ts              # NextAuth configuration
│   ├── roles.ts             # Role helpers + dashboard home routing
│   ├── logger.ts            # Logging utilities with request tracing
│   ├── accessControl.ts     # Authorization helpers
│   ├── courseAccess.ts      # Private course codes, browse filters, response sanitization
│   ├── courses/public.ts    # Public course listing, slug resolution, SEO paths
│   ├── enrollmentService.ts # Shared enroll / join-by-code logic
│   ├── apiMiddleware.ts     # API middleware for rate limiting
│   ├── serialize.ts         # MongoDB serialization
│   ├── seo/                 # SEO utilities (metadata, config, getSiteUrl)
│   ├── mobile/              # WebView bridge, deep links, mobile detection
│   ├── notifications/       # FCM client + admin push helpers
│   └── files/               # File management utilities
├── models/                  # Mongoose schemas
│   ├── User.ts
│   ├── Organization.ts
│   ├── Course.ts
│   ├── Quiz.ts
│   ├── QuizAttempt.ts
│   ├── Enrollment.ts
│   ├── Blog.ts
│   ├── Favorite.ts
│   ├── NotificationToken.ts
│   ├── NotificationPreference.ts
│   ├── UserNotification.ts
│   ├── AppSettings.ts
│   ├── Note.ts
│   ├── File.ts
│   └── Progress.ts
└── store/                   # Zustand stores
    ├── useSessionStore.ts
    └── useCachedStore.ts
├── scripts/                 # Database scripts and utilities
```

## 10. Design System & Theming ("quiet chrome, one aurora")

The platform uses a single token-driven design system (July 2026 redesign, matched to the owner's portfolio): aurora backdrops, glass surfaces, pill buttons, Inter body + Sora display (`src/lib/fonts.ts`). All colors flow through CSS variables in `src/app/globals.css` — **no hardcoded Tailwind palette classes** (exceptions: `text-white` on gradient/solid-colored chips and buttons, image scrims, the print-targeted certificate page).

### Palette & tokens

- **Student**: indigo→purple — light `#7c3aed`, gradient `#6366f1 → #a855f7`; dark `#818cf8`, gradient `#818cf8 → #c084fc`
- **Teacher / admin / superadmin**: orchid/fuchsia variant (`--teacher-*`), mapped onto `--primary*` by the `[data-role]` scope
- Status colors (`--success/-light` etc.) have per-theme values; `-light` fills become translucent tints in dark
- Aliases (`--color-*`, `--primary*`) are re-declared inside every theme scope — `var()` aliases resolve where they are *defined*, so they must be repeated in `[data-theme="dark"]` / `[data-role]` blocks

### Light/dark theme

Global toggle like the portfolio: `html[data-theme="dark"]` (default, no-flash init script in `src/app/layout.tsx` + localStorage) drives the dark token block; `ThemeToggle` (`src/components/ui/ThemeToggle.tsx`) sits in `HeaderStatic` (public pages) and `DashboardHeader` (dashboards).

### Design rules

- **Saturated role color is banned at panel scale** — no gradient sidebar slabs, no white-on-gradient hero banners
- The signature is the **aurora canvas**: `.dashboard-aurora` (dashboards) / `.aurora-bg` + `.aurora-blob` (public pages) — two slow role-tinted blobs behind glass chrome; respects `prefers-reduced-motion`
- Chrome is glass: `.sidebar-rail` (gradient hairline edge, `.rail-link--active` pill), `.dashboard-topbar`, glass `.hero-banner` with a role-tinted radial wash
- Role color appears only in small touches: 1–3px gradient keylines, icon chips (`--primary-soft` fill), `gradient-text` on greeting names, gradient pill buttons (`.btn-premium`, `.btn-primary`)
- Stat/action/activity cards map role color keys to `--primary*` (role-scope aware); `--admin-*` tokens do not exist
- The dashboard topbar has no logo — the rail carries the single brand mark; `BrandLogo` generates its SVG gradient id with `useId()` (fixed ids break when the first DOM occurrence sits in a `display:none` container)

**Cascading data-role injection:** the dashboard shell carries `data-role="[active-role]"`, which re-points `--primary*`/`--color-primary`/`--surface-muted` for the whole subtree — components below need no per-role logic.

### Public/marketing pages

All public pages (`/`, `/how-it-works`, `/tools`, `/tools/[slug]` + SEO landing aliases, `/blogs`, auth pages) share `MarketingHeader` (`forceScrolled` on subpages) with ThemeToggle, language toggle, session-aware auth links, plus the shared `Footer`. Subpage shell pattern: `MarketingHeader forceScrolled` + content wrapper `mt-20 sm:mt-24` + `Footer`. Hero sections sit on an `.aurora-bg` canvas; CTAs are glass `.hero-banner` panels with `.btn-premium` pills.

### Animated cursor

`AnimatedCursor` (`src/components/layout/AnimatedCursor.tsx`, mounted once in the root layout) renders a `--primary` dot that tracks the pointer plus a trailing ring that grows and tints over interactive elements (`.cursor-dot` / `.cursor-ring` / `.cursor-ring--active` in globals.css). It writes transforms straight to the DOM in a rAF loop (no React re-renders) and renders **only** for fine pointers without reduced motion (`usePointerFine` / `useReducedMotion` from `src/hooks/useMediaQuery.ts`). The native cursor stays visible — this is an accent, not a replacement.

### Accessibility

- Touch targets: interactive elements keep `min-h-[44px]` on mobile (`.touch-target`)
- `.focus-ring` for visible keyboard focus; `::selection` tinted by role
- Aurora/hero animations and the animated cursor disabled under `prefers-reduced-motion`

## 11. Internationalization (i18n)

The platform supports English and Hindi with instant language switching.

**Translation Files:**
- `src/i18n/en.ts` - English translations
- `src/i18n/hi.ts` - Hindi translations

**Mobile View Translations:**
- Language selector options (English/Hindi)
- Menu toggle aria-label
- Administration section separator
- All navigation items and user-facing text

**Usage Pattern:**
```javascript
const { t, lang, setLang } = useTranslation();
t('common.english') // "English" or "अंग्रेज़ी"
```

## 12. Recent Updates

### Reusable Responsive Form Components & Global Integration (August 2026)

- **Reusable Form Controls (`TextField` & `Dropdown`)**:
  - Implemented `TextField` ([TextField.tsx](file:///Users/shashankgupta/Documents/Projects/Quizdo/super-book/src/components/ui/TextField.tsx)), a unified component for inputs and textareas supporting error states, helper texts, start/end icons, and custom password visibility toggling.
  - Implemented `Dropdown` ([Dropdown.tsx](file:///Users/shashankgupta/Documents/Projects/Quizdo/super-book/src/components/ui/Dropdown.tsx)), a dual-mode responsive dropdown that renders a native select on mobile (`sm:hidden`) to leverage system-optimized pickers and a custom listbox animated with Framer Motion on desktop (`hidden sm:block`).
  - Added support for rich label tags (like Lucide icons) inside input and dropdown headers using standard `aria-labelledby` linking.
  - Resolved mobile viewport font-zoom behavior (iOS Safari zooms on focused inputs with font-size < 16px) by using `text-base` (`16px`) on mobile and `sm:text-sm` (`14px`) on desktop.
  - Maintained accessibility standards with WCAG-compliant touch targets (`min-h-[44px]`).
  - Resolved CSS precedence issues where global `.form-field` padding overrode Tailwind's utility class padding by utilizing inline style bindings on elements containing icons.

- **Global Integration across Dashboards & Public Pages**:
  - **Auth Forms**: Refactored `LoginForm`, `RegisterForm`, `ForgotPasswordForm`, `ResetPasswordForm`, and `ChangePasswordForm` to use `TextField`, removing redundant state variables (`showPassword` etc.) and imports.
  - **Course Forms**: Refactored `CreateCourseForm` (details and private course code fields) to use `TextField`, and language options to use `Dropdown`. Refactored `JoinCourseByCode` input to use `TextField`.
  - **Blog Editor**: Refactored details, topic, language, visibility, meta title, and meta description fields in `BlogEditorForm` to use `TextField` and `Dropdown`.
  - **Quiz Forms**: Refactored `CreateQuizForm` (details and time limits to `TextField`, placement, course, chapter, and lesson options to `Dropdown`) and student course filter select to `Dropdown`.
  - **Admin Panel Forms**: Refactored teacher limits, category, and organization select/input forms across user lists, settings, and notifications broadcast panels.
  - **Contact Page**: Refactored `ContactPageClient` name, email, subject, and message fields to use `TextField`.

### Default Public Course Permissions & Admin Course Deletion Emails (August 2026)

- **Default Public Course Creation Permission (`false` by default)**:
  - Users (teachers) have `canCreatePublicCourses: false` by default on registration (`src/models/User.ts`).
  - Public course creation is restricted by default until an Admin explicitly grants permission by toggling `canCreatePublicCourses = true` in Admin User Management (`/dashboard/admin/users`).
  - `canUserCreatePublicCourses(userId, role)` in `src/lib/settingsHelpers.ts` serves as the backend source of truth, returning `true` for admins/superadmins and checking `Boolean(user?.canCreatePublicCourses)` for teachers.

- **Admin Course Deletion with Mandatory Reason & Email Notification**:
  - When an Admin or Super Admin deletes a course (via `/dashboard/admin/courses` or `DELETE /api/courses/[id]`), a mandatory **deletion reason** is required in the deletion modal.
  - `DELETE /api/courses/[id]` validates the deletion reason for admin callers and triggers `sendCourseDeletionEmail()` (`src/lib/email/index.ts`) to email the course's instructor (teacher) detailing the course title and the admin's explanation.

- **Localhost Logout Callback URL Fix**:
  - Updated `LogoutButton.tsx` to dynamically set `callbackUrl` using `window.location.origin` (if available), ensuring signout on local dev environments stays on `http://localhost:3000/login` rather than redirecting to a production domain set in `NEXTAUTH_URL`.

### Design-system rollout to dashboards & public pages (July 2026)

- Dashboards (student/teacher/admin/superadmin) moved to "quiet chrome, one aurora" (see §10): glass `.sidebar-rail` + `.dashboard-topbar` over a fixed `.dashboard-aurora` canvas; gradient welcome banners replaced by glass `.hero-banner` panels with `gradient-text` greetings; `StatCard`/`QuickActionCard` redesigned as hairline cards (small-caps eyebrow labels, Sora tabular numerals, thin gradient progress bars).
- Content cards followed (July 2026): `QuizCard` lost its gradient banner for a 3px `--primary-gradient` keyline + tinted meta chips; `CourseCard` got the hairline shell, a `--primary-soft` thumbnail placeholder, and token-gradient (`gradient-bg`) buttons/progress; certificate and blog cards got hairline borders + keylines. `useRoleTheme` is no longer needed for card styling — cards read `--primary*` directly, and dynamic Tailwind classes like `` hover:${theme.text} `` (which never compile) were removed.
- Public subpages (`/how-it-works`, `/tools`, `/tools/[slug]`) now share `MarketingHeader` (theme toggle + language switcher + session-aware links) and `Footer`; white-on-gradient CTA slabs replaced by glass panels with `.btn-premium` pills; added `home.howItWorksPage.deepDive` i18n key (en + hi).
- `BrandLogo` SVG gradient id switched to `useId()` (fixed id rendered blank when referenced from a `display:none` subtree).
- **Dev-cache fix (`next.config.ts`):** the custom `Cache-Control: immutable, max-age=1y` header on `/_next/static/*` is now production-only. In dev, Turbopack chunk URLs are path-based (not content-hashed), so the immutable header made browsers serve stale chunks after every edit — the cause of "my change doesn't show up" bugs. Anyone who browsed the dev server before this fix must do one hard reload (Cmd+Shift+R) to purge poisoned cache entries.

### Course completion certificates (2026)

Students automatically receive a completion certificate once **both** conditions hold:
1. The instructor marked the course as completed (`Course.isCompleted`, set via the award button on the teacher courses page → `PATCH /api/courses/[id] { isCompleted }`).
2. The student finished **every published lesson** (`LessonCompletion`) and **every published quiz** (`QuizAttempt` with status `completed`/`force_submitted`) of the course.

**Model:** `Certificate` (`src/models/Certificate.ts`) — `student`, `course`, `organizationId`, public serial `certificateId` (`QD-<year>-<hex>`), snapshots (`studentName`, `courseTitle`, `instructorName`), `issuedAt`. Unique index `{ student: 1, course: 1 }` makes issuance race-safe; unique `certificateId` supports verification. Cascade-deleted with the course (`deleteCourseRelatedData`).

**Issuance logic:** `src/domain/learning/certificateIssuance.ts`
- `checkAndIssueCertificate(studentId, courseId)` — per-student check; idempotent, never throws. Triggered on quiz submit (`POST /api/quiz-attempts`) and lesson completion (`POST /api/video/progress`).
- `issueCertificatesForCourse(courseId)` — backfill for all enrolled students; triggered when the teacher flips `isCompleted` to `true`.
- Courses with zero published lessons **and** zero published quizzes never issue certificates.
- On issue: enrollment set to `completed`/100%, bilingual in-app + FCM push notification (`generateCertificatePayload`, category `system`, deep link `quizdo://certificate/<serial>`).

**API:** `GET /api/certificates` (own list, optional `?course=` filter) · `GET /api/certificates/[id]` (accepts Mongo `_id` **or** the printed serial; visible to owner, course instructor, admins).

**UI:** Student sidebar → **Certificates** (`/dashboard/student/certificates`, gated by `enableCourses`) → printable certificate view (`/certificates/[id]`, print CSS isolates the sheet). Teacher courses page: award button with confirm modal, **Completed** badge, reopen option.

**Known gap:** lesson completion is only written by the video progress API (≥90% watched) — text-only lessons cannot currently be completed, so courses containing published non-video lessons cannot reach certificate eligibility.

### Course slug index fix (2026)

Fixed intermittent `E11000 duplicate key error` on `POST /api/courses` when creating multiple courses in production.

**Root cause:** The `Course` schema previously set `slug: { default: null }`. MongoDB's unique index on `slug` treats explicit `null` as a value, so only one course could exist with `slug: null`.

**Fix:**
- `slug` field omits when unset (`default: undefined`) — same pattern as `courseCode`
- Pre-save hook strips `null`/empty slug values before persistence
- Replaced sparse unique index with a **partial unique index** (`slug_1_unique_nonempty`) that only indexes non-empty slugs: `{ slug: { $gt: '' } }`
- `ensureCourseIndexes()` in `src/models/Course.ts`: unsets legacy `slug: null` documents, drops old `slug_1` index, syncs new index — called from `POST /api/courses` (runs once per process)
- Improved `409` response to distinguish slug vs course-code conflicts

**Manual repair (optional, if needed before deploy):**
```javascript
db.courses.updateMany({ $or: [{ slug: null }, { slug: '' }] }, { $unset: { slug: '' } })
db.courses.dropIndex('slug_1')  // only if legacy index exists
```

### Public courses SEO (2026)

Published, organization-free public courses are exposed for organic discovery outside the dashboard.

**Routes:**
- `/courses` — public course catalog with category chips, ISR (`revalidate: 300`)
- `/courses/[slug]` — public course detail page with SEO metadata and JSON-LD

**Visibility rules** (via `src/lib/courses/public.ts` + `publicCourseFilter()`):
- `isPublished: true`
- `organizationId: null` (platform-wide public courses)
- Not private (no `courseCode`)

**Slug behavior:**
- Slugs are generated lazily for public listings (`title` + last 6 chars of `_id`) via `ensurePublicSlug()`
- Courses created in the dashboard do not require a slug; slug is assigned when surfaced on public pages
- Sitemap includes public course slugs via `listPublicCourseSlugs()` in `src/app/sitemap.ts`

**Key files:** `src/lib/courses/public.ts`, `src/app/courses/page.tsx`, `src/app/courses/[slug]/page.tsx`

### SEO tool pages — Hindi i18n (2026)

SEO landing pages at `/tools/[slug]` now support language-aware content.

- **English content:** `src/data/seo-tools.ts` (`SEO_TOOLS_DATA`)
- **Hindi content:** `src/i18n/seo-tools/hi.ts` (`SEO_TOOLS_HI`) — falls back to English when a slug has no Hindi entry
- **Resolver:** `src/lib/seo/getSeoToolContent.ts` — `getSeoToolContent(slug, lang)`, `getSeoToolLabel(slug, lang)`
- **Client hook:** `src/hooks/useSeoTool.ts` — reads active language from i18n context

### Public Blogs & SEO (2026)

The blog system has been expanded to support **public** visibility, allowing articles to be shared outside an organization for SEO, marketing, and organic discovery.

**Model Updates (`Blog`):**
- Added `visibility` field (`'public'` vs `'organization'`).
- Added SEO and meta fields: `slug` (unique, sparse), `excerpt`, `metaTitle`, `metaDescription`.
- Added analytics fields: `viewCount` and `isFeatured`.
- New compound indexes added for efficient querying of public blogs by visibility, publish status, and popularity/date.

**Public Routes:**
- `/blogs`: A public index listing all published, public blogs with pagination, search, and category filtering.
- `/blogs/[slug]`: The public reading view for a specific blog. Server-side rendered with full SEO metadata injection.

**API Architecture:**
- `/api/blogs/public`: Returns paginated public blogs.
- `/api/blogs/public/[slug]`: Retrieves a public blog by slug.
- `/api/blogs/public/[slug]/view`: Increments the `viewCount` (called via `PublicBlogViewTracker`).
- Added `publicBlogRateLimiter` to `middleware.ts` to protect public blog endpoints.

**UI & Content Creation:**
- **Teacher Dashboard**: `BlogEditorForm` now includes a Settings tab for `visibility`, `slug`, `excerpt`, and SEO metadata.
- **Home Page**: Created a `HomeLatestBlogsSection` component to optionally feature the latest public blogs on the landing page.
- **Header Navigation**: Added a global "Blogs" link to the homepage header (`HeaderStatic.tsx`) mapping to `/blogs`. Follows `common.blogs` translations and shared CSS utilities.
- **Social Sharing**: Included `PublicBlogShareButtons` for easy sharing to X (Twitter), Facebook, LinkedIn, and WhatsApp.

### Private course access via course codes & public course restrictions (2026)

Teachers can optionally restrict a course with a unique **course code**. Courses without a code remain **public** (unchanged behavior).

**Public Course Restrictions (Super Admin Setting):**
- Super admins can enable **"Restrict Public Course Creation"** (`restrictPublicCourseCreation`) in Admin Settings.
- When enabled, public courses can only be created by selected teachers who have `canCreatePublicCourses = true` explicitly granted in Admin User Management (or admins/superadmins).
- Unrestricted teachers attempting to create a public course will receive a 403 response requiring a `courseCode` to create a private course.
- `canUserCreatePublicCourses(userId, role)` in `src/lib/settingsHelpers.ts` is the single source of truth; `checkPublicCoursePermission()` (API guard) and the teacher UI both read it.
- The effective permission is returned as `canCreatePublicCourses` by `GET /api/auth/account` — an uncached, session-aware endpoint, so a newly granted permission applies without re-login (the NextAuth JWT is only populated at sign-in).

**Rules:**
- **Public course** (`courseCode` null/empty): visible in student browse; one-click enroll
- **Private course** (non-empty `courseCode`): hidden from browse; students join via code; access retained after enrollment
- Course codes are **4–12** alphanumeric characters (hyphens allowed); stored uppercase; sparse unique index on `courses.courseCode`
- Private courses must be **published** before students can join by code
- Course codes are stripped from API responses for unauthorized clients; owners/admins see `courseCode` + `isPrivate` flag

**Teacher UI:** `CreateCourseForm` — “Private course access” toggle, generate/copy code (`/dashboard/teacher/courses/create`, edit flow)

For a teacher restricted to private courses, the form locks the toggle: it is auto-checked with a generated course code, rendered `disabled`, and an attempt to uncheck it surfaces `createCourseForm.publicCourseNotAllowed` (en + hi) instead of toggling. The click is caught by a wrapper element because a disabled input emits no events of its own. The forcing effect re-runs after `loadCourse()` resolves so the edit flow cannot re-open public access, and `handleSubmit` re-checks before sending.

**Student UI:** `JoinCourseByCode` on browse page (`/dashboard/student/browse`)

**API routes:**

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/enrollments/join-by-code` | POST | Student | Enroll by course code only |
| `/api/enrollments` | POST | Student | Enroll by `courseId`; requires `courseCode` for private courses |
| `/api/courses` | GET | Session | `?available=true` excludes private courses from browse |
| `/api/courses` | POST/PATCH | Teacher/Admin | Set or clear `courseCode` |

**Shared logic:** `src/lib/enrollmentService.ts` (`enrollStudentInCourse`, `enrollStudentByCourseCode`), `src/lib/courseAccess.ts` (`isPrivateCourse`, `publicCourseFilter`, `validateCourseCodeMatch`, `sanitizeCourseResponse`)

**Rate limiting:** `courseCodeAttemptLimiter` — 10 attempts per 15 minutes per user+IP (`src/lib/rateLimiter.ts`)

**i18n:** `courses.joinWithCode`, `courses.invalidCourseCode`, `createCourseForm.privateAccess`, etc. (en + hi)

### Pull-to-Refresh Enhancements

- **Confirm Modal**: Added a `ConfirmModal` (warning type) that intercepts the pull-to-refresh action, preventing accidental page reloads.
- **Form Protection**: Disabled pull-to-refresh entirely on routes involving content creation or modification (e.g., `/create`, `/edit`) and quiz attempts (`/take`) to prevent data loss.

### Full-Screen Quiz Experience

- **Distraction-Free Mode**: Automatically hides the top mobile navigation (`MobileNav`) and bottom navigation menu (`MobileBottomNav`) when a user is actively taking a quiz (`/take`), providing a distraction-free, full-screen environment on mobile devices.

### Layout, routing & notifications (2025)

- **Mobile-first spacing system**: CSS tokens in `globals.css`, layout components in `src/components/layout/`, reference in `src/constants/spacing.ts`
- **Role-based dashboard routing**: `getDashboardHomePath`, `withDashboardHome` in `src/lib/roles.ts`; `/dashboard` redirect; admin profile at `/dashboard/admin/profile`
- **Centralized navigation**: `src/constants/navigation.ts` for all role nav arrays; mobile bottom nav keys
- **Push + in-app notifications**: FCM via Firebase; lazy Admin init (`getAdminMessaging`); inbox API + student notifications page; admin broadcast UI
- **Mongoose index cleanup**: removed duplicate indexes on `NotificationToken`, `NotificationPreference`, `UserNotification`
- **Mobile UX**: language switcher in mobile header; header/content spacing via `--mobile-header-gap`

### Earlier build fixes

### ESLint/TypeScript Errors Resolved
- Fixed all `any` type errors by using proper type assertions
- Removed unused variables and imports
- Fixed React Hooks rules violations (hooks called before early returns)
- Replaced `<a>` tags with Next.js `Link` components for navigation
- Fixed unused parameters in interfaces and function signatures

### Logo Optimization & UI Improvements
- **SVG Structure Fixed**: Added proper viewBox, fill="none", and preserveAspectRatio to logo.svg and logo_green.svg
- **PremiumLogo Component Created**: Reusable logo container with theme-based backgrounds and proper contrast
- **Logo Component Enhanced**: Added size variants (sm, md, lg, xl) with responsive sizing
- **Global Logo Updates**: Replaced all logo instances with PremiumLogo component across entire application
- **Background Contrast**: Implemented theme-matching backgrounds (white/90 for student/teacher, white/95 for light, white/20 for dark)
- **Size Optimization**: Increased logo size to xl in sidebar and hero sections for better visibility
- **Clean Presentation**: Removed heavy gradients, glows, and unnecessary text beside logo

### Files Modified:
- `/public/logo.svg` - Fixed SVG structure and transparency
- `/public/logo_green.svg` - Fixed SVG structure and transparency  
- `/src/components/ui/Logo.tsx` - Added xl size support and responsive classes
- `/src/components/ui/PremiumLogo.tsx` - New premium logo container component
- `/src/components/home/Hero.tsx` - Updated to use PremiumLogo with xl size
- `/src/components/home/Header.tsx` - Updated to use PremiumLogo with adaptive theming
- `/src/components/home/Footer.tsx` - Updated to use PremiumLogo with dark theme
- `/src/features/auth/components/LoginForm.tsx` - Updated to use PremiumLogo
- `/src/features/auth/components/RegisterForm.tsx` - Updated to use PremiumLogo
- `/src/features/auth/components/DashboardHeader.tsx` - Updated to use PremiumLogo
- `/src/features/dashboard/components/MobileNav.tsx` - Updated to use PremiumLogo with role-based theming
- `/src/features/dashboard/components/StudentSidebar.tsx` - Updated to use PremiumLogo with xl size
- `/src/features/dashboard/components/TeacherSidebar.tsx` - Updated to use PremiumLogo with green variant and xl size
- Admin/Teacher/Student blogs and courses pages
- Student browse and quizzes pages
- Student quiz take page
- TeacherSidebar component
- useQuizSecurity hook
- API routes (enrollments, quiz-attempts)

## 13. Component Architecture

### UI Components
- **PremiumLogo**: Reusable logo component with size variants (sm, md, lg, xl) and theme support
- **Skeleton**: Loading states for better perceived performance
- **Alert**: Error and success notifications with auto-dismiss
- **DashboardHeader**: Role-based header with navigation and user info
- **MobileNav**: Mobile-optimized navigation with role theming
- **Sidebars**: StudentSidebar, TeacherSidebar, AdminSidebar with role-specific navigation

### Feature Components
- **Course Management**: CourseCard, CourseList, CreateCourseForm (private access + course code), JoinCourseByCode, CourseLeaderboard
- **Quiz System**: QuizCard, QuizList, QuizTaker with timer and scoring
- **Blog System**: BlogCard, BlogList, BlogEditor with rich text support
- **Analytics**: Charts, stats cards, user metrics visualization
- **User Management**: UserTable, UserForm, UserProfile with role-based access

### Layout System

Centralized layout primitives live in `src/components/layout/`:

| Component | Purpose |
|-----------|---------|
| `PageWrapper` | Page shell with consistent horizontal gutters and vertical rhythm |
| `PageHeader` | Title, description, and optional actions |
| `DashboardContent` | Dashboard main content area with role-aware spacing |
| `ResponsiveGrid` | Responsive stat/card grids (`grid-stats`, `grid-cards`) |
| `EmptyState` | Consistent empty-list placeholder |

**CSS tokens** (`src/app/globals.css`): `--gutter-x`, `--section-gap`, `--card-padding`, `--mobile-header-height`, `--mobile-header-gap`, `--page-max-width`.

**Utility classes**: `.stack-page`, `.card-body`, `.card-surface`, `.card-list`, `.form-stack`, `.hero-banner`, `.stat-tile`, `.form-field`, `.btn-action`, `.mobile-header-bar`, `.mobile-header-spacer`.

**TypeScript reference**: `src/constants/spacing.ts` exports `SPACING` (token names) and `SPACING_CLASSES` (class names) for use in TSX.

**Navigation config**: `src/constants/navigation.ts` defines `STUDENT_NAV`, `TEACHER_NAV`, `ADMIN_NAV`. Use `withDashboardHome()` from `src/lib/roles.ts` so the dashboard nav item resolves to the correct role home. Mobile shell: `MobileNav` (header + language switcher), `MobileBottomNav`, desktop sidebars per role.

**Migration status**: High-traffic student/teacher/admin pages use the shared layout; older pages may still use ad-hoc `space-y-*` / `p-4 sm:p-6` — prefer the shared primitives for new work.

- **Responsive Design**: Mobile-first with shared gutters (not breakpoint-specific padding per page)
- **Role-Based Theming**: Dynamic CSS variables for student/teacher/admin themes
- **Navigation**: Structured routing with role-based access control
- **State Management**: Zustand stores for session, caching, and global state

## 14. Data Management

### API Architecture
- **RESTful Design**: Standardized endpoints with consistent response formats
- **Error Handling**: Comprehensive error responses with proper HTTP status codes
- **Validation**: Input validation and sanitization on all endpoints
- **Serialization**: MongoDB document serialization for client compatibility
- **Rate Limiting**: Request throttling to prevent abuse

### Database Design
- **MongoDB Collections**: Users, Courses, Quizzes, Enrollments, Attempts, Blogs, Organizations
- **Relationships**: Proper foreign key relationships and population strategies
- **Indexing**: Optimized queries with database indexes on frequently accessed fields
- **Data Integrity**: Constraints and validation at schema level

### Caching Strategy
- **Redis Integration**: Optional server-side caching with fallback to database
- **Client-Side**: Zustand stores for frequently accessed data
- **Cache Invalidation**: Automatic cache clearing on data mutations
- **Performance**: TTL-based expiration with configurable timeouts

## 15. Security Implementation

### Authentication & Authorization
- **NextAuth Integration**: JWT-based sessions with secure cookie handling
- **Role-Based Access**: API-level authorization checks for all endpoints
- **Organization Isolation**: Multi-tenant data separation
- **Session Management**: Secure session storage and automatic refresh
- **Password Security**: Hashing with bcrypt and strength requirements

### SMTP Mail Transmission (Contact Forms)
- **Serverless-Ready Delivery**: Replaced MongoDB write locks/database storage for contact forms with production-ready SMTP transmission via `nodemailer`.
- **Anti-Abuse Client Verification**: Every email generated generates a unique Ticket ID, capturing client submission timestamp, IP metadata, and direct reply-to inboxes for admin convenience.
- **Client-IP Rate Limiting**: Employs an automated rate limiter enforcing a strict maximum of **3 submissions per minute** per client IP, blocking spam and denial-of-service attempts.

### Data Protection
- **Input Validation**: Comprehensive validation on all user inputs (Zod schemas in `src/lib/validation.ts`)
- **Course code brute-force protection**: `courseCodeAttemptLimiter` (10 attempts / 15 min per user+IP)
- **SQL Injection Prevention**: MongoDB query sanitization
- **XSS Protection**: Content sanitization and CSP headers
- **CSRF Protection**: Token-based request validation
- **Data Encryption**: Sensitive data encryption at rest

## 16. Performance Optimizations

### Frontend Performance
- **Code Splitting**: Dynamic imports for route-based code separation
- **Image Optimization**: Responsive images with lazy loading
- **Bundle Analysis**: Regular bundle size monitoring and optimization
- **Caching Strategy**: SWR/Zustand for intelligent data caching
- **Loading States**: Skeleton loaders for better perceived performance

### Backend Performance
- **Database Optimization**: Query optimization with lean() and field projection
- **Connection Pooling**: Efficient MongoDB connection management
- **Parallel Processing**: Concurrent database operations where possible
- **Memory Management**: Proper cleanup and garbage collection
- **Response Compression**: Gzip compression for API responses

## 17. Development & Deployment

### Development Workflow
- **TypeScript**: Full type safety across the application
- **ESLint**: Code quality and consistency enforcement
- **Hot Reload**: Fast development with Next.js dev server
- **Environment Management**: Configurable environments (dev, staging, prod)
- **Git Workflow**: Feature branches and pull request process

### Deployment Configuration
- **Next.js 15**: App Router with server components
- **Build Optimization**: `next build` for production; Turbopack only for local dev (`npm run dev`)
- **Static Generation**: ISR for improved performance
- **Environment Variables**: Secure configuration management
- **Monitoring**: Error tracking and performance monitoring

## 18. Dashboard Architecture

### SWR-Based Data Fetching
- **Multiple Endpoints**: Separate API calls for enrollments, quiz-attempts, courses, quizzes, blogs
- **Automatic Caching**: SWR handles caching and deduplication automatically
- **Parallel Requests**: Multiple `useSWR` hooks run in parallel for optimal performance
- **Role-Specific Queries**: Different endpoints for student vs teacher dashboard needs
- **React Query Integration**: TanStack Query available for advanced data fetching patterns

### Student Dashboard
- **Data Sources**: `/api/enrollments` and `/api/quiz-attempts` endpoints
- **Activity Combination**: Merges enrollments and quiz attempts into unified activity feed
- **Real-time Stats**: Calculated from enrollment and attempt data
- **Performance**: SWR caching prevents redundant API calls
- **Type Safety**: Local `ActivityItem` interfaces with proper union types

### Teacher Dashboard
- **Data Sources**: `/api/courses`, `/api/quizzes`, `/api/blogs`, `/api/settings`
- **Content Management**: Full CRUD access to courses, quizzes, and blogs
- **Analytics**: Student counts, course statistics from enrolledCount
- **Settings Integration**: Teacher limits and quotas from settings API
- **Performance**: SWR optimizes repeated requests with intelligent caching

### Data Structure Management
- **Local Interfaces**: TypeScript interfaces defined in component files
- **Union Types**: Activity items as enrollment/quiz unions
- **Manual Mapping**: Frontend processes and combines data from multiple sources
- **Error Handling**: Graceful fallbacks for missing API responses

## 19. Mobile-First Layout & Spacing

### Design tokens

Responsive spacing is defined once in `src/app/globals.css` and referenced from components via CSS variables or utility classes:

```css
/* Examples — see globals.css for full set */
--gutter-x: clamp(1rem, 4vw, 1.5rem);
--section-gap: clamp(1.25rem, 3vw, 2rem);
--card-padding: clamp(1rem, 2.5vw, 1.5rem);
--mobile-header-height: 3.5rem;
--mobile-header-gap: 0.75rem;
```

### Recommended page pattern

```tsx
import { PageWrapper, PageHeader, DashboardContent } from '@/components/layout';

<PageWrapper>
  <PageHeader title={t('…')} description={t('…')} />
  <DashboardContent>
    {/* page body */}
  </DashboardContent>
</PageWrapper>
```

Use `ResponsiveGrid` for stat rows and card grids. Prefer `.card-body` / `.card-surface` over inline padding on individual cards.

### Mobile dashboard shell

- **Header**: `MobileNav` — logo, language switcher (`LanguageSwitcher` with `compact` / `alwaysShowLabel`), role-themed styling
- **Spacer**: `.mobile-header-spacer` accounts for fixed header height + gap below header
- **Bottom nav**: `MobileBottomNav` uses `MOBILE_BOTTOM_NAV_KEYS` from `navigation.ts`
- **Home link**: Pass `homePath={getDashboardHomePath(role)}` so admin users are not sent to `/dashboard/student`

### Session role refresh

JWT role is refreshed from the database approximately every 5 minutes (`roleRefreshedAt` in `src/lib/auth.ts`) so role changes propagate without forcing a full re-login.

## 20. Push Notifications (Firebase Cloud Messaging)

### Overview

Push notifications use **Firebase Cloud Messaging (FCM)** for web and native WebView shells. Foreground messages show an in-app toast; background delivery uses `public/firebase-messaging-sw.js`.

### Collections

- **`notificationtokens`**: `{ userId, deviceToken, platform, isActive }` — unique `deviceToken`; compound index on `{ userId, isActive }`; TTL on `updatedAt` (30 days). Avoid duplicate single-field indexes when `unique: true` is already set on a field.
- **`notificationpreferences`**: per-user category toggles, `muteAll`, `disablePush`, `mutedCourses[]` — `userId` is unique (no redundant index).
- **`usernotifications`**: in-app notification inbox records (title, body, category, read state, deep-link metadata).

### API routes (standard `{ success, data, error }` envelope)

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/notifications` | GET | Session | Paginated in-app inbox |
| `/api/notifications/[id]` | PATCH/DELETE | Session | Mark read / dismiss |
| `/api/notifications/device` | POST | Session | Register FCM device token |
| `/api/notifications/device` | DELETE | Session | Deactivate token |
| `/api/notifications/preferences` | GET/PUT | Session | Read/update preferences |
| `/api/notifications/send` | POST | Admin / superadmin | Broadcast to org students + teachers |

Service layer: `src/lib/server/services/notifications-service.ts`  
Client API: `src/lib/api/notifications.ts` (uses `apiJsonData`)

### Admin UI

- **Broadcast page**: `/dashboard/admin/notifications` (superadmin nav item)
- **i18n**: `admin.notifications.*`, `notifications.categories.*`, `notifications.push.viewDetails`

### Student in-app inbox

- **Page**: `/dashboard/student/notifications`
- **Nav icon**: Bell (not Settings) in student sidebar / mobile nav

### Firebase Admin (server)

Initialize lazily via `getAdminMessaging()` in `src/lib/notifications/push/firebase-admin.ts` — no top-level init during build. Call sites (e.g. `sendPushNotification.ts`) invoke `getAdminMessaging()` at runtime only when sending.

### Client registration

- **Web**: `PushNotificationManager` → `initMobileNotifications()` → `registerDeviceToken()`
- **Native WebView**: bridge message `REQUEST_NATIVE_TOKEN` / `NATIVE_TOKEN_RECEIVED`
- **Deep links**: `src/lib/mobile/deepLink.ts` (`quizdo://` URLs in payload `data.url`)

### Environment variables

**Client (`.env`):**
- `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`, `NEXT_PUBLIC_FIREBASE_VAPID_KEY`

**Server:**
- `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`

### Payload helpers

`src/lib/notifications/push/notificationPayload.ts` — bilingual `title`/`body` + category for lessons, quizzes, announcements.

---

## 21. Private Course Access (Course Codes)

### Overview

Optional teacher-controlled access restriction. A course is **private** when it has a non-empty `courseCode` field on the `Course` document. Existing courses without a code continue to work as public courses.

### Access model

```
Public course (no courseCode)
  → Listed in GET /api/courses?available=true
  → Student enrolls via POST /api/enrollments { courseId }

Private course (courseCode set)
  → Hidden from browse list and direct GET for non-enrolled students
  → Student joins via POST /api/enrollments/join-by-code { courseCode }
     or POST /api/enrollments { courseId, courseCode }
  → After enrollment, full course access (same as public)
```

### Teacher workflow

1. Create or edit a course in `CreateCourseForm`
2. Enable **Private course access**
3. Generate or set a unique code (auto-generated 8-char code available)
4. **Publish** the course — unpublished private courses cannot be joined
5. Share the code with students (code is only returned to course owner/admin in API responses)

Disabling private access sends `courseCode: null` on save, making the course public again.

### Student workflow

1. Open **Browse courses** (`/dashboard/student/browse`)
2. Use **Join with course code** form (`JoinCourseByCode`)
3. On success, redirect to **My courses**

Invalid code → `404`/`403` with `{ message: "Invalid course code" }`. Rate limited after repeated failures.

### Implementation notes

- **Org access:** Enrollment still checks organization access via `validateContentAccess` unless the student is in the same org / public course rules apply
- **Enrollment upsert:** `enrollStudentInCourse` uses `findOneAndUpdate` with `$setOnInsert` for new fields and `$set: { status: 'active' }` for reactivation (dropped → active). Do not put the same field in both `$set` and `$setOnInsert` (MongoDB conflict)
- **Mongoose dev cache:** `Course` model re-registers if a hot-reloaded schema lacks `courseCode` (`src/models/Course.ts`)
- **Slug index:** Do not set `slug: null` on save — field is omitted when unset; `ensureCourseIndexes()` repairs legacy prod data (see §12)
- **Validation:** `courseCodeSchema` in `src/lib/validation.ts`; `joinCourseByCodeSchema` for join endpoint

### Key files

| Path | Role |
|------|------|
| `src/models/Course.ts` | `courseCode` + `slug` fields; partial unique slug index; `ensureCourseIndexes()` |
| `src/lib/courseAccess.ts` | Private detection, browse filter, code match, API sanitization |
| `src/lib/enrollmentService.ts` | Central enrollment + join-by-code |
| `src/app/api/enrollments/join-by-code/route.ts` | Join-by-code endpoint |
| `src/features/courses/components/CreateCourseForm.tsx` | Teacher private toggle + code UI |
| `src/features/courses/components/JoinCourseByCode.tsx` | Student join form |

---

## 22. SEO Landing Pages (Tools)

### Overview

Dynamic, data-driven SEO landing pages at `/tools/[slug]` targeting 20 educational AI tool keywords. All pages are **statically generated (SSG)** at build time via `generateStaticParams` for optimal Core Web Vitals.

### Architecture

- **Data registry**: `src/data/seo-tools.ts` — centralized `SEO_TOOLS_DATA` record mapping slugs to unique English content (title, description, headings, features, benefits, how-it-works steps, FAQs, CTA text)
- **Hindi translations**: `src/i18n/seo-tools/hi.ts` — `SEO_TOOLS_HI` record; resolved via `getSeoToolContent(slug, lang)` in `src/lib/seo/getSeoToolContent.ts`
- **Server component**: `src/app/tools/[slug]/page.tsx` — `generateStaticParams`, `generateMetadata` (title, description, canonical, OpenGraph, Twitter), FAQ + Breadcrumb JSON-LD schemas
- **Client component**: `src/app/tools/[slug]/ToolClient.tsx` — renders hero, features grid, how-it-works, benefits, FAQ accordions, CTA, and internal cross-links; uses `useSeoTool(slug)` for language-aware copy
- **Route helper**: `ROUTES.tools(slug)` in `src/constants/routes.ts`
- **Sitemap**: `src/app/sitemap.ts` auto-includes all tool slugs with `changeFrequency: 'weekly'`, `priority: 0.9`

### Target Keywords (20 pages)

| Slug | Status |
|------|--------|
| `quiz-maker-free` | Full content |
| `ai-quiz-maker-free` | Full content |
| `online-quiz-maker` | Full content |
| `mcq-generator-free` | Placeholder |
| `course-maker-free` | Placeholder |
| `ai-course-maker` | Placeholder |
| `course-generator-free` | Placeholder |
| `test-series-maker-free` | Placeholder |
| `ai-test-series-generator` | Placeholder |
| `lesson-maker-free` | Placeholder |
| `chapter-generator` | Placeholder |
| `question-paper-maker` | Placeholder |
| `practice-test-generator` | Placeholder |
| `online-exam-maker` | Placeholder |
| `quiz-creator-for-teachers` | Placeholder |
| `quiz-generator-from-text` | Placeholder |
| `quiz-generator-from-pdf` | Placeholder |
| `course-builder-online` | Placeholder |
| `lms-course-creator` | Placeholder |
| `ai-education-tools` | Placeholder |

### SEO Output Per Page

- Unique `<title>` and `<meta name="description">`
- `<link rel="canonical">` via `alternates.canonical`
- OpenGraph and Twitter Card metadata
- `application/ld+json` FAQPage schema
- `application/ld+json` BreadcrumbList schema (Home → Tools → Page)
- Proper heading hierarchy (`<h1>` → `<h2>` → `<h3>`)
- Semantic HTML sections
- Internal cross-links to other tool pages for topical authority

### Adding a New Tool Page

1. Add a new entry to `SEO_TOOLS_DATA` in `src/data/seo-tools.ts` with unique content
2. The page, metadata, JSON-LD, sitemap entry, and static generation are all automatic
3. Run `npm run build` to verify the new page appears in the SSG output

### Key Files

| Path | Role |
|------|------|
| `src/data/seo-tools.ts` | English data registry (content, metadata, FAQs) |
| `src/i18n/seo-tools/hi.ts` | Hindi SEO tool page copy |
| `src/lib/seo/getSeoToolContent.ts` | Language-aware content resolver |
| `src/hooks/useSeoTool.ts` | Client hook for tool page copy |
| `src/app/tools/[slug]/page.tsx` | Server component (SSG, metadata, JSON-LD) |
| `src/app/tools/[slug]/ToolClient.tsx` | Client component (landing page UI) |
| `src/constants/routes.ts` | `ROUTES.tools(slug)` helper |
| `src/app/sitemap.ts` | Auto-includes tool pages in sitemap |

---

## 23. Future Improvements

### Performance
- Add advanced request deduplication (TanStack Query)
- Implement Next.js server-side caching with ISR
- Add background jobs with BullMQ for analytics aggregation
- Optimize bundle size with code splitting

### Features
- Avatar upload functionality (Cloudinary integration)
- Email verification system
- Video lessons support
- **Course completion certificates** — implemented (see §12 "Course completion certificates")
- Real-time in-app notifications (WebSocket) — push via FCM and in-app inbox via `UserNotification` are implemented (see §20)
- **Private courses via course codes** — implemented (see §21)
- Payment gateway integration (Stripe)
- Advanced analytics with charts (Recharts)
- Bulk user import (Excel)
- Audit logs for admin actions
- Content moderation system
- Quiz multilingual data support
- File management system
- Leaderboard system
- Progress tracking

### Architecture
- Proper type definitions for SessionSync
- Remove redundant SessionSync component (Zustand handles session)
- Add API response caching headers
- Implement rate limiting with API middleware
- Add comprehensive request logging with logger utility
- Add file upload security and validation

## 24. Database Schemas

### User Schema

**Collection**: `users`

```typescript
interface IUser {
  _id: ObjectId;
  name: string;                    // User's full name
  email: string;                   // Unique email address
  password?: string;               // Hashed password (credentials auth)
  role: 'student' | 'teacher' | 'admin' | 'superadmin';
  avatar?: string;                 // Profile picture URL
  isVerified: boolean;            // Email verification status
  isSuspended: boolean;           // Account suspension status
  suspendedReason?: string;        // Reason for suspension
  provider?: 'credentials' | 'google'; // Auth provider
  organizationId?: ObjectId | null; // Organization reference
  limits?: {                      // Teacher resource limits
    courses: number;
    quizzes: number;
    blogs: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- `email` (unique)
- `role: 1`
- `createdAt: -1`
- `isVerified: 1`
- `isSuspended: 1`

**Validation Rules**:
- Admin users must have `organizationId`
- Password is auto-hashed with bcrypt (12 rounds)
- Email must be unique

---

### Organization Schema

**Collection**: `organizations`

```typescript
interface IOrganization {
  _id: ObjectId;
  name: string;                   // Organization name
  code: string;                   // Unique code (deprecated)
  inviteCode: string;              // Unique invite code for joining
  description?: string;           // Organization description
  isActive: boolean;              // Active status
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- `code` (unique)
- `inviteCode` (unique)
- `isActive: 1`

---

### Course Schema

**Collection**: `courses`

```typescript
interface ICourse {
  _id: ObjectId;
  title: string;                  // Course title
  description: string;            // Course description
  instructor: ObjectId;           // Reference to User (teacher)
  organizationId?: ObjectId | null; // Organization reference
  price: number;                   // Course price (0 = free)
  thumbnail?: string;              // Course thumbnail URL
  category?: string;               // Course category
  locale: 'en' | 'hi';            // UI locale for course content
  isPublished: boolean;            // Publication status
  isCompleted: boolean;            // Teacher marked course finished (unlocks certificate issuance)
  completedAt?: Date | null;       // When the teacher marked it completed
  chapterCount: number;            // Denormalized chapter count
  lessonCount: number;             // Denormalized lesson count
  enrolledCount: number;           // Denormalized enrollment count
  courseCode?: string | null;      // When set, course is private (join-by-code required)
  slug?: string;                   // SEO URL slug for public course pages (omitted when unset)
  lastPublishedLesson?: ObjectId | null; // For continue-learning tiles
  createdAt: Date;
  updatedAt: Date;
}
```

**Curriculum:** Lessons live in separate `chapters` / `lessons` collections (not embedded on the course document).

**Indexes**:
- `instructor: 1`
- `organizationId: 1, isPublished: 1, lessonCount: -1`
- `organizationId: 1, isPublished: 1, createdAt: -1`
- `instructor: 1, organizationId: 1`
- `isPublished: 1, category: 1`
- `slug: 1` (unique, partial filter `{ slug: { $gt: '' } }` — name: `slug_1_unique_nonempty`)
- `createdAt: -1`
- `courseCode: 1` (unique, sparse — private courses only)

**Index maintenance:** `ensureCourseIndexes()` — unsets legacy `slug: null` values, drops old non-partial `slug_1` index, syncs indexes. Called from `POST /api/courses`.

---

### Lesson Schema

**Collection**: `lessons`

```typescript
interface ILesson {
  _id: ObjectId;
  title: string;                  // Lesson title
  description: string;            // Lesson description
  course: ObjectId;                // Reference to Course
  content: string;                 // Lesson content (HTML/text)
  videoUrl?: string;               // Video URL
  order: number;                   // Order within course
  duration: number;                // Duration in minutes
  isPublished: boolean;            // Publication status
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- `course: 1, order: 1` (compound)
- `course: 1`
- `isPublished: 1`
- `createdAt: -1`

---

### Quiz Schema

**Collection**: `quizzes`

```typescript
interface IQuestion {
  question: string;                // Question text
  options: string[];              // Answer options
  correctAnswer: number;          // Index of correct option
}

interface IQuiz {
  _id: ObjectId;
  title: string;                  // Quiz title
  description: string;            // Quiz description
  course: ObjectId;               // Reference to Course
  instructor: ObjectId;           // Reference to User (teacher)
  organizationId?: ObjectId | null; // Organization reference
  questions: IQuestion[];        // Array of questions
  timeLimit: number;              // Time limit in minutes
  isPublished: boolean;          // Publication status
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- `course: 1`
- `instructor: 1`
- `isPublished: 1`
- `createdAt: -1`

---

### QuizAttempt Schema

**Collection**: `quizattempts`

```typescript
interface IAnswer {
  questionIndex: number;          // Question index
  selectedOption: number;        // Selected answer
  isCorrect: boolean;             // Answer correctness
}

interface IQuizAttempt {
  _id: ObjectId;
  student: ObjectId;               // Reference to User (student)
  quiz: ObjectId;                 // Reference to Quiz
  course: ObjectId;               // Reference to Course
  answers: IAnswer[];             // Student's answers
  score: number;                  // Percentage score (0-100)
  correctCount: number;           // Number of correct answers
  totalQuestions: number;         // Total questions in quiz
  timeTaken: number;              // Time taken in seconds
  startedAt: Date;                // Quiz start time
  submittedAt?: Date;            // Quiz submission time
  status: 'in_progress' | 'completed' | 'abandoned' | 'force_submitted';
  attemptNumber: number;          // Attempt number for retakes
  violationCount: number;         // Anti-cheating violations
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- `student: 1, quiz: 1`
- `student: 1, course: 1`
- `quiz: 1, status: 1`
- `course: 1, status: 1`
- `quiz: 1, status: 1, score: -1` (leaderboard)
- `course: 1, status: 1, score: -1` (leaderboard)
- `startedAt: -1`
- `submittedAt: -1`

---

### Enrollment Schema

**Collection**: `enrollments`

```typescript
interface IEnrollment {
  _id: ObjectId;
  student: ObjectId;              // Reference to User (student)
  course: ObjectId;               // Reference to Course
  enrolledAt: Date;               // Enrollment date
  progress: number;               // Progress percentage (0-100)
  lessonCompletedCount: number;   // Denormalized count from LessonCompletion
  status: 'active' | 'completed' | 'dropped';
  completedAt?: Date;             // Course completion date
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- `student: 1, course: 1` (unique)
- `student: 1, status: 1`
- `course: 1, status: 1`
- `enrolledAt: -1`

---

### Certificate Schema

**Collection**: `certificates`

```typescript
interface ICertificate {
  _id: ObjectId;
  student: ObjectId;              // Reference to User
  course: ObjectId;               // Reference to Course
  organizationId?: ObjectId | null; // Organization reference
  certificateId: string;          // Public serial for display/verification (QD-<year>-<hex>)
  studentName: string;            // Snapshot at issue time
  courseTitle: string;            // Snapshot at issue time
  instructorName: string;         // Snapshot at issue time
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- `student: 1, course: 1` (unique — one certificate per student per course, race-safe issuance)
- `certificateId: 1` (unique)
- `student: 1, issuedAt: -1`
- `course: 1`

**Issuance**: see §12 "Course completion certificates" (`src/domain/learning/certificateIssuance.ts`).

---

### Blog Schema

**Collection**: `blogs`

```typescript
interface IBlog {
  _id: ObjectId;
  title: string;                  // Blog title (max 200 chars)
  content: string;                // Blog content
  topic: string;                  // Blog topic (max 50 chars)
  language: 'en' | 'hi';         // Blog language
  author: ObjectId;               // Reference to User
  organizationId?: ObjectId | null; // Organization reference
  isPublished: boolean;          // Publication status
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- `topic: 1, isPublished: 1`
- `author: 1`
- `createdAt: -1`
- `language: 1`

---

### Favorite Schema

**Collection**: `favorites`

```typescript
interface IFavorite {
  _id: ObjectId;
  user: ObjectId;                 // Reference to User (unique)
  blogs: ObjectId[];              // Array of favorited Blog references
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- `user: 1` (unique)
- `blogs: 1`
- `updatedAt: -1`

---

### FileNode Schema

**Collection**: `filenodes`

```typescript
type FileNodeType = 'folder' | 'file';

interface IFileNode {
  _id: ObjectId;
  name: string;                   // File/folder name (max 255 chars)
  type: FileNodeType;             // 'folder' or 'file'
  parentId?: ObjectId | null;      // Parent folder reference
  fileUrl?: string;               // File URL (for files)
  publicId?: string;              // Cloudinary public ID
  fileType?: string;              // MIME type
  size?: number;                  // File size in bytes
  uploadedBy: ObjectId;            // Reference to User
  organizationId?: ObjectId | null; // Organization reference
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- `parentId: 1, name: 1` (unique)
- `parentId: 1, type: 1`
- `organizationId: 1, parentId: 1`
- `name: 'text'` (text search)

---

### Note Schema

**Collection**: `notes`

```typescript
interface INote {
  _id: ObjectId;
  userId: ObjectId;               // Reference to User (indexed)
  title: string;                  // Note title (max 150 chars)
  content: string;                // Note content body
  wordCount: number;              // Calculated word count
  color?: string;                 // Color badge theme (e.g. 'blue', 'purple')
  isPinned?: boolean;             // Pinned status (default: false)
  tags?: string[];                // Array of custom tags
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- `userId: 1, isPinned: -1, updatedAt: -1` (compound index for user queries sorted by pinned status and update time)

---

### AppSettings Schema

**Collection**: `appsettings`

```typescript
interface IAppSettings {
  _id: ObjectId;
  teacherLimits: {
    courses: number;              // Max courses per teacher (default: 5)
    quizzes: number;              // Max quizzes per teacher (default: 10)
    blogs: number;                // Max blogs per teacher (default: 2)
  };
  notesLimits?: {
    maxPagesPerUser: number;      // Max note pages per user (default: 5)
    maxWordsPerPage: number;      // Max words per note page (default: 1000)
  };
  featureToggles: {
    enableBlogs: boolean;         // Enable blog feature
    enableQuizzes: boolean;       // Enable quiz feature
    enableCourses: boolean;       // Enable course feature
    enableAnalytics: boolean;      // Enable analytics feature
    enableClarity: boolean;        // Enable Microsoft Clarity tracking
  };
  platformConfig: {
    siteName: string;             // Site name (default: 'Quiz-Do')
    siteDescription: string;       // Site description
    maintenanceMode: boolean;     // Maintenance mode status
    allowRegistration: boolean;    // Allow new user registration
    defaultLanguage: 'en' | 'hi'; // Default language
  };
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- `updatedAt: -1`

---

### Feature Toggles, Analytics & API Error UI Alerts (2026)

#### Microsoft Clarity & Analytics Feature Flag
- **`enableClarity` Feature Flag**: Controls session replay and web analytics tracking powered by Microsoft Clarity. Added to `AppSettings.featureToggles` schema, Zod validation, `useSettingsStore`, `dataService`, and `GET/PUT /api/admin/settings`.
- **Admin Control**: Superadmins and Admins can toggle `enableClarity` on/off live via `/dashboard/admin/settings`.
- **Clarity Initialization**: `ClarityInit.tsx` checks `isFeatureEnabled('enableClarity')` before calling `clarity.init()` or sending user identifier telemetry.

#### Standardized API Error Handling on UI
- **`getApiErrorMessage()` Helper**: Located in `src/lib/api/http.ts`, transforms all types of API errors into standard, human-readable UI text:
  - `400`: Bad request / invalid parameter inputs.
  - `401`: Session expired or unauthenticated user.
  - `403`: Access denied or feature toggle disabled by administrator.
  - `404`: Requested resource not found.
  - `429`: Rate limit exceeded / too many requests.
  - `500/502/503`: Internal server errors.
  - Network disconnection / fetch failures.
- **UI Alerts**: Integrated with the reusable `<Alert type="error" message={...} onClose={...} />` component across analytics dashboards and application pages for instant visual feedback.

#### Personal Notes & Notes Limits System
- **Notes Feature Overview**: Users (students, teachers, admins) can create, edit, pin, tag, search, and delete personal notes directly from their role dashboards (`/dashboard/student/notes`, `/dashboard/teacher/notes`, `/dashboard/admin/notes`). Quick note-taking is also embedded within student course lesson views (`/dashboard/student/courses/[id]/lessons/[lessonId]`).
- **REST Endpoints**:
  - `GET /api/notes`: Fetches all notes for the authenticated user, sorted by `isPinned` (descending) and `updatedAt` (descending). Returns active notes along with system note page limit (`maxPagesPerUser`) and word limit (`maxWordsPerPage`).
  - `POST /api/notes`: Creates a new note. Validates user note page limits (`currentNotesCount >= maxPagesPerUser`) and content length (`wordCount > maxWordsPerPage`).
  - `GET /api/notes/[id]`: Retrieves a single note owned by the authenticated user.
  - `PUT /api/notes/[id]`: Updates title, content, color, pinned status, or tags of an existing note. Re-calculates word count and enforces word limit rules.
  - `DELETE /api/notes/[id]`: Deletes a note by ID.
- **Admin Configuration**:
  - Superadmins and Admins can configure global note limits (`notesLimits.maxPagesPerUser` default: 5 pages, `notesLimits.maxWordsPerPage` default: 1000 words) via the Admin Settings page (`/dashboard/admin/settings` -> `NotesLimitsSection`) or `PUT /api/admin/settings`.
- **UI Components & Custom Hook**:
  - `useNotes.ts` custom hook for state management, limit checks, and API operations.
  - `NotesPage.tsx`, `NoteCard.tsx`, `NoteEditorModal.tsx`, `NotesLimitBanner.tsx`, `NoteDeleteDialog.tsx` under `src/features/notes/components/`.

**Constraints**:
- Only one document allowed in collection (enforced by pre-save hook)

---

## 25. Future Roadmap

### Short Term (1-3 months)
- **Real-time Features**: WebSocket integration for live updates
- **Advanced Analytics**: Charts and detailed reporting
- **Mobile App**: React Native companion app
- **Payment Integration**: Stripe/PayPal for course purchases
- **Email System**: Transactional emails (push notifications via FCM are implemented)

### Medium Term (3-6 months)
- **Video Platform**: Video lessons with streaming
- **Certificate System**: Automated course completion certificates — implemented (see §12 "Course completion certificates")
- **Advanced Quizzes**: Multiple question types and timed assessments
- **Social Features**: Student forums and discussion boards
- **API v2**: GraphQL implementation for efficient data fetching

### Long Term (6+ months)
- **AI Integration**: Smart recommendations and content generation
- **Microservices**: Service-oriented architecture
- **Multi-tenancy**: Advanced organization management
- **Enterprise Features**: SSO integration and advanced admin controls
- **Global Scaling**: CDN integration and geographic distribution

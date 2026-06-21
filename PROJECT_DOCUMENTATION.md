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
│   └── api/                 # API routes
│       ├── admin/           # Admin-only endpoints
│       ├── auth/            # NextAuth configuration
│       ├── courses/         # Course management
│       ├── quizzes/         # Quiz management
│       ├── blogs/           # Blog management
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
│   └── blogs/
├── hooks/                   # Custom React hooks
├── i18n/                    # Translation files (en, hi)
├── lib/                     # Utility functions
│   ├── db.ts                # Database connection
│   ├── redis.ts             # Upstash Redis client
│   ├── auth.ts              # NextAuth configuration
│   ├── roles.ts             # Role helpers + dashboard home routing
│   ├── logger.ts            # Logging utilities with request tracing
│   ├── accessControl.ts     # Authorization helpers
│   ├── courseAccess.ts      # Private course codes, browse filters, response sanitization
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
│   ├── File.ts
│   └── Progress.ts
└── store/                   # Zustand stores
    ├── useSessionStore.ts
    └── useCachedStore.ts
├── scripts/                 # Database scripts and utilities
```

## 10. Role-Based Theming System

The platform features a comprehensive role-based theming system that provides consistent color schemes across all dashboards (student, teacher, admin, superadmin) on both mobile and desktop.

### Theme Implementation

**CSS Variables (globals.css):**
- Role-specific primary colors: `--student-primary` (Teal), `--teacher-primary` (Teal/Mint), `--admin-primary` (Rose/Pink), `--superadmin-primary` (Slate)
- Dark variants for gradients: `--student-primary-dark`, `--teacher-primary-dark`, etc.
- Accent colors, soft backgrounds, borders, and shadows for each role
- Gradient definitions for smooth visual transitions

**Theme Colors:**
- **Student**: Eucalyptus Teal & Ocean Cyan gradient (#0ea5e9 → #14b8a6)
- **Teacher**: Mint & Emerald gradient (#10b981 → #06b6d4)
- **Admin**: Rose & Pink gradient (#f43f5e → #d946ef)
- **Super Admin**: Slate dark gradient (#1e293b → #020617)

**Usage Pattern:**
```css
background: linear-gradient(135deg, var(--teacher-primary), var(--teacher-primary-dark));
color: var(--teacher-primary);
```

**Cascading Data-Role Injection:**
- The outermost shell inside `layout.tsx` is decorated with `data-role="[active-role]"`. This propagates design tokens (`--primary`, `--primary-soft`, `--color-primary`, `--border`) dynamically down the DOM tree. Standard elements, dashboard cards, sidebars, and custom forms dynamically adapt at runtime without role duplication.

**Components with Role-Based Theming:**
- Desktop sidebars (TeacherSidebar, StudentSidebar, AdminSidebar)
- Mobile navigation header (MobileNav) & Bottom Navigation Panel (MobileBottomNav)
- Dashboard cards, forms (e.g., CreateQuizForm), and interactive actions
- TipTap RichTextEditor: Theme prop upgraded to a semantic `'student' | 'teacher'` role definition, linking bubble menus, float menus, toolbars, and active links perfectly to active role variables.
- Session-Aware Navigation Header: Desktop and mobile public page header integrates `useSessionStore` to dynamically display "Dashboard" in place of "Login / Sign up" links when a session is active.

**Mobile Consistency:**
- Mobile header and bottom panels dynamically inherit active-theme HSL bracket custom properties based on user role.
- No breakpoint-based color changes - colors are role-based, not device-based.

### Accessibility Enhancements

**Touch Targets:**
- All buttons and inputs have `min-h-[44px]` for mobile-friendly touch interaction
- Consistent spacing and sizing across mobile and desktop

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

### Private course access via course codes (2026)

Teachers can optionally restrict a course with a unique **course code**. Courses without a code remain **public** (unchanged behavior).

**Rules:**
- **Public course** (`courseCode` null/empty): visible in student browse; one-click enroll
- **Private course** (non-empty `courseCode`): hidden from browse; students join via code; access retained after enrollment
- Course codes are **4–12** alphanumeric characters (hyphens allowed); stored uppercase; sparse unique index on `courses.courseCode`
- Private courses must be **published** before students can join by code
- Course codes are stripped from API responses for unauthorized clients; owners/admins see `courseCode` + `isPrivate` flag

**Teacher UI:** `CreateCourseForm` — “Private course access” toggle, generate/copy code (`/dashboard/teacher/courses/create`, edit flow)

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
- **Validation:** `courseCodeSchema` in `src/lib/validation.ts`; `joinCourseByCodeSchema` for join endpoint

### Key files

| Path | Role |
|------|------|
| `src/models/Course.ts` | `courseCode` field + sparse unique index |
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

- **Data registry**: `src/data/seo-tools.ts` — centralized `SEO_TOOLS_DATA` record mapping slugs to unique content (title, description, headings, features, benefits, how-it-works steps, FAQs, CTA text)
- **Server component**: `src/app/tools/[slug]/page.tsx` — `generateStaticParams`, `generateMetadata` (title, description, canonical, OpenGraph, Twitter), FAQ + Breadcrumb JSON-LD schemas
- **Client component**: `src/app/tools/[slug]/ToolClient.tsx` — renders hero, features grid, how-it-works, benefits, FAQ accordions, CTA, and internal cross-links
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
| `src/data/seo-tools.ts` | Data registry (content, metadata, FAQs) |
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
- Course completion certificates
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
  chapterCount: number;            // Denormalized chapter count
  lessonCount: number;             // Denormalized lesson count
  enrolledCount: number;           // Denormalized enrollment count
  courseCode?: string | null;      // When set, course is private (join-by-code required)
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
- `createdAt: -1`
- `courseCode: 1` (unique, sparse — private courses only)

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
  featureToggles: {
    enableBlogs: boolean;         // Enable blog feature
    enableQuizzes: boolean;       // Enable quiz feature
    enableCourses: boolean;       // Enable course feature
    enableAnalytics: boolean;      // Enable analytics feature
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
- **Certificate System**: Automated course completion certificates
- **Advanced Quizzes**: Multiple question types and timed assessments
- **Social Features**: Student forums and discussion boards
- **API v2**: GraphQL implementation for efficient data fetching

### Long Term (6+ months)
- **AI Integration**: Smart recommendations and content generation
- **Microservices**: Service-oriented architecture
- **Multi-tenancy**: Advanced organization management
- **Enterprise Features**: SSO integration and advanced admin controls
- **Global Scaling**: CDN integration and geographic distribution

# Super Book - Learning Management System

## 1. Project Overview

Super Book is a modern Learning Management System (LMS) built with Next.js 15, featuring role-based access control, course management, quizzes, blogs, analytics, and comprehensive admin controls. The platform supports both English and Hindi languages with instant switching capabilities.

**Roles:**
- **Student**: Browse courses, enroll, take quizzes, track progress, read blogs
- **Teacher**: Create courses, quizzes, and blogs; view student analytics
- **Admin**: Manage users, configure platform, view platform-wide analytics
- **Super Admin**: Full platform control including organization management

## 2. Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components, API Routes, Turbopack)
- **Language**: TypeScript
- **Database**: MongoDB + Mongoose
- **Authentication**: NextAuth (JWT-based session handling)
- **State Management**: Zustand (client-side caching)
- **Caching**: Redis (server-side, optional/fallback-safe)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Rich Text**: TipTap editor
- **File Processing**: xlsx (Excel parsing)
- **Analytics**: Google Analytics (@next/third-parties)

## 3. Authentication & Authorization

### Roles

- **superadmin**: Full platform access, organization management
- **admin**: User management within their organization, platform configuration
- **teacher**: Content creation (courses, quizzes, blogs), student analytics
- **student**: Course enrollment, quiz taking, progress tracking

### Admin Access Logic (IMPORTANT)

All authorization checks are enforced at the **API level** (backend), not frontend.

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
- Frontend role guards as secondary security layer
- API-level authorization checks for all endpoints

## 4. State Management (Zustand)

Global stores used to cache frequently accessed data and prevent redundant API calls:

### Stores

**useSessionStore:**
- Caches user session data
- Prevents repeated `/api/auth/session` calls
- Persists session state across components

**useCachedStore:**
- Caches enrollments by userId
- Courses by organizationId
- Quiz attempts by userId
- Prevents duplicate API calls to `/api/enrollments`, `/api/quiz-attempts`, `/api/courses`

**Usage Pattern:**
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

Redis is **OPTIONAL** and fault-tolerant. If Redis is unavailable, the system continues to work by falling back to the database.

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
  if (cached) return JSON.parse(cached);
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
│   └── api/                 # API routes
│       ├── admin/           # Admin-only endpoints
│       ├── auth/            # NextAuth configuration
│       ├── courses/         # Course management
│       ├── quizzes/         # Quiz management
│       ├── blogs/           # Blog management
│       ├── enrollments/     # Enrollment tracking
│       ├── quiz-attempts/   # Quiz results
│       ├── favorites/       # Blog favorites
│       ├── organizations/   # Organization management
│       └── analytics/       # Analytics data
├── components/
│   ├── dashboard/           # Dashboard-specific components
│   └── ui/                  # Reusable UI components
├── contexts/                # React contexts (AppSettings, RoleTheme)
├── features/                # Feature-specific components
│   ├── courses/
│   ├── quizzes/
│   └── blogs/
├── hooks/                   # Custom React hooks
├── i18n/                    # Translation files (en, hi)
├── lib/                     # Utility functions
│   ├── db.ts                # Database connection
│   ├── redis.ts             # Redis client
│   ├── auth.ts              # NextAuth configuration
│   ├── logger.ts            # Logging utilities
│   ├── accessControl.ts     # Authorization helpers
│   └── serialize.ts         # MongoDB serialization
├── models/                  # Mongoose schemas
│   ├── User.ts
│   ├── Organization.ts
│   ├── Course.ts
│   ├── Quiz.ts
│   ├── QuizAttempt.ts
│   ├── Enrollment.ts
│   ├── Blog.ts
│   ├── Favorite.ts
│   └── AppSettings.ts
└── store/                   # Zustand stores
    ├── useSessionStore.ts
    └── useCachedStore.ts
```

## 10. Role-Based Theming System

The platform features a comprehensive role-based theming system that provides consistent color schemes across all dashboards (student, teacher, admin, superadmin) on both mobile and desktop.

### Theme Implementation

**CSS Variables (globals.css):**
- Role-specific primary colors: `--student-primary`, `--teacher-primary`, `--admin-primary`, `--superadmin-primary`
- Dark variants for gradients: `--student-primary-dark`, `--teacher-primary-dark`, etc.
- Accent colors, soft backgrounds, borders, and shadows for each role
- Gradient definitions for smooth visual transitions

**Theme Colors:**
- **Student**: Indigo/Violet gradient (#6366f1 → #8b5cf6 → #a855f7)
- **Teacher**: Emerald/Teal gradient (#10b981 → #14b8a6 → #06b6d4)
- **Admin**: Rose/Pink gradient (#f43f5e → #ec4899 → #d946ef)
- **Super Admin**: Slate dark gradient (#1e293b → #111827 → #020617)

**Usage Pattern:**
```css
background: linear-gradient(135deg, var(--teacher-primary), var(--teacher-primary-dark));
color: var(--teacher-primary);
```

**Components with Role-Based Theming:**
- Desktop sidebars (TeacherSidebar, StudentSidebar, AdminSidebar)
- Mobile navigation header (MobileNav)
- Dashboard cards and buttons
- Active navigation states

**Mobile Consistency:**
- Mobile header gradient matches desktop sidebar for each role
- Dynamic CSS variable construction based on user role
- No breakpoint-based color changes - colors are role-based, not device-based

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

## 12. Recent Build Fixes

### ESLint/TypeScript Errors Resolved
- Fixed all `any` type errors by using proper type assertions
- Removed unused variables and imports
- Fixed React Hooks rules violations (hooks called before early returns)
- Replaced `<a>` tags with Next.js `Link` components for navigation
- Fixed unused parameters in interfaces and function signatures

### Files Modified:
- Admin/Teacher/Student blogs and courses pages
- Student browse and quizzes pages
- Student quiz take page
- TeacherSidebar component
- useQuizSecurity hook
- API routes (enrollments, quiz-attempts)

## 13. Future Improvements

### Performance
- Add request deduplication (React Query or SWR)
- Implement Next.js server-side caching
- Add background jobs for analytics aggregation
- Optimize bundle size with code splitting

### Features
- Avatar upload functionality
- Email verification system
- Video lessons support
- Course completion certificates
- Real-time notifications (WebSocket)
- Payment gateway integration
- Advanced analytics with charts
- Bulk user import (Excel)
- Audit logs for admin actions
- Content moderation system
- Quiz multilingual data support

### Architecture
- Proper type definitions for SessionSync
- Remove redundant SessionSync component (Zustand handles session)
- Add API response caching headers
- Implement rate limiting
- Add request logging middleware

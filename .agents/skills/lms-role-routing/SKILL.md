---
name: lms-role-routing
description: >-
  Use this skill when implementing, navigating, or securing role-based pages, layouts, navigation, and API routes
  for student, teacher, admin, and superadmin roles in the LMS platform.
---

# LMS Role Routing and Navigation Guide

This skill provides procedures and conventions for working with user roles and navigation structures across the Quiz-Do application.

## Roles Overview

The platform supports 4 distinct user roles:
1. `student`: Standard learner role (courses, quizzes, notes, progress).
2. `teacher`: Instructor role (course creation, curriculum builder, quiz management, analytics).
3. `admin`: Platform manager (content review, users, settings, system notifications).
4. `superadmin`: Elevated administrator (organization management, global critical settings, solution analysis toggles).

---

## Canonical Role Helpers (`src/lib/roles.ts`)

**NEVER hardcode role strings in page routing or conditional checks.** Always use the helpers provided in `src/lib/roles.ts`:

```typescript
import {
  normalizeRole,
  isAdmin,
  isSuperAdmin,
  isStaffRole,
  getDashboardHomePath,
  withDashboardHome,
} from '@/lib/roles';

// Examples:
const userRole = normalizeRole(session?.user?.role);
const homePath = getDashboardHomePath(userRole); // -> '/dashboard/student' | '/dashboard/teacher' | '/dashboard/admin'
const canAccessSuperFeatures = isSuperAdmin(userRole);
```

---

## Navigation Configuration (`src/constants/navigation.ts`)

Navigation structures are defined in `src/constants/navigation.ts`:
- `STUDENT_NAV`: Navigation items for students.
- `TEACHER_NAV`: Navigation items for teachers.
- `ADMIN_NAV`: Navigation items for administrators (superadmin-only items tagged with `superAdminOnly: true`).

### Dynamic Navigation Hook (`src/hooks/useDashboardNav.ts`)
When rendering sidebar or bottom navigation, use `useDashboardNav` to automatically filter items by enabled feature flags and superadmin status:

```tsx
import { useDashboardNav } from '@/hooks/useDashboardNav';
import { STUDENT_NAV } from '@/constants/navigation';

export function StudentSidebar() {
  const navItems = useDashboardNav(STUDENT_NAV);
  // ...
}
```

---

## Page Layout & Role Theme

Every dashboard page should utilize shared layout primitives and the role-based theme:

```tsx
'use client';

import { PageWrapper, PageHeader } from '@/components/layout';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { useTranslation } from '@/hooks/useTranslation';

export default function RoleFeaturePage() {
  const { t } = useTranslation();
  const { theme } = useRoleTheme();

  return (
    <PageWrapper className="max-w-7xl">
      <PageHeader
        title={t('feature.title')}
        description={t('feature.description')}
      />
      {/* Page content */}
    </PageWrapper>
  );
}
```

---

## Backend Role Authorization Pattern

In API Route handlers (`src/app/api/*`), enforce strict role checks immediately after session validation:

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isStaffRole, isSuperAdmin } from '@/lib/roles';
import { NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const role = session.user.role;
  if (!isStaffRole(role)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  // Handle authorized logic
}
```

---

## Verification Steps

1. Run `npm run lint` to check for improper role usages or broken imports.
2. Verify routing behavior for each role:
   - Login as student -> redirects to `/dashboard/student`.
   - Login as teacher -> redirects to `/dashboard/teacher`.
   - Login as admin -> redirects to `/dashboard/admin`.
   - Accessing `/dashboard/admin/*` as non-admin -> redirects or returns 403.

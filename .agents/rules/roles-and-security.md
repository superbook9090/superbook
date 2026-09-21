# Roles, Security & Navigation Rules

All role-dependent functionality and navigation items must follow these standards:

## 1. Role Helpers (`src/lib/roles.ts`)
- **Supported Roles**: `student`, `teacher`, `admin`, `superadmin`.
- **No Hardcoded Checks**: Never perform string comparisons like `user.role === 'admin'` or construct hardcoded dashboard paths.
- Always use helpers from `src/lib/roles.ts`:
  - `normalizeRole(role)`
  - `isAdmin(role)` (checks if admin or superadmin)
  - `isSuperAdmin(role)`
  - `isStaffRole(role)` (checks if teacher, admin, or superadmin)
  - `getDashboardHomePath(role)` (returns role home path)
  - `withDashboardHome(navItems, role)`

## 2. Navigation Consistency
- Navigation structures reside in `src/constants/navigation.ts` (`STUDENT_NAV`, `TEACHER_NAV`, `ADMIN_NAV`).
- Navigation renderers must use `useDashboardNav(items, options)` to dynamically filter links based on enabled feature flags and superadmin permissions.

## 3. Server vs Client Security
- Client-side checks (`FeatureGate`, `FeatureRouteGuard`, navigation hiding) are strictly for UX.
- All authorization, role verification, and feature flag enforcement **must be securely executed at the API route layer**.

## 4. Resource Quotas & AI Limits
- Verification of a user's quotas (e.g., maximum courses, storage limits, and custom AI question generation limits) is a core security requirement.
- **Never rely on the client** to enforce limits. Always fetch the user's specific limits on the backend and reject operations (e.g., 403 Forbidden or 429 Too Many Requests) if the quota is exceeded.

---
name: feature-toggles
description: >-
  Use this skill when adding, modifying, gating, or debugging feature toggles across the application,
  including database schemas, backend APIs, Redis cache invalidation, Zustand client state, and route/nav guards.
---

# Feature Toggles Workflow

This skill outlines the complete end-to-end lifecycle for feature toggles in the Quiz-Do / super-book application. Feature toggles dynamically control access to modules (such as blogs, quizzes, courses, notes, analytics, and authentication providers) across the full stack.

## Architecture Checklist

When adding or updating a feature toggle (e.g. `enableX`), you MUST update all 7 layers in the following order:

```text
1. Mongoose Model (src/models/AppSettings.ts)
   └── 2. Zod Validation (src/lib/validation.ts)
       └── 3. API Handlers & Cache Invalidation (src/app/api/admin/settings/route.ts & /api/settings/route.ts)
           └── 4. Zustand Store & Defaults (src/store/useSettingsStore.ts)
               └── 5. Admin Settings UI (src/app/(dashboard)/dashboard/admin/settings/...)
                   └── 6. Route & Nav Guards (src/lib/featureRoutes.ts, src/hooks/useDashboardNav.ts, FeatureGate.tsx)
                       └── 7. Server Helpers & Translations (src/lib/settingsHelpers.ts, src/i18n/en.ts, src/i18n/hi.ts)
```

---

## 1. Database Model (`src/models/AppSettings.ts`)

Add the toggle to both the `IAppSettings` TypeScript interface and the Mongoose schema:

```typescript
export interface IAppSettings extends Document {
  featureToggles: {
    // ...existing
    enableNewFeature?: boolean;
  };
}

const appSettingsSchema = new Schema<IAppSettings>({
  featureToggles: {
    // ...existing
    enableNewFeature: {
      type: Boolean,
      default: true, // or false
    },
  },
});
```

---

## 2. Zod Validation Schema (`src/lib/validation.ts`)

Ensure the toggle is registered under `updateSettingsSchema.featureToggles` as an optional boolean so that partial updates and non-superadmin updates pass validation:

```typescript
export const updateSettingsSchema = z.object({
  featureToggles: z.object({
    // ...existing
    enableNewFeature: z.boolean().optional(),
  }).optional(),
});
```

---

## 3. Backend API & Redis Cache Invalidation

### Admin PATCH Route (`src/app/api/admin/settings/route.ts`)
1. Include the field in `mergedToggles`. If the toggle is restricted to superadmins, wrap it with `isSuper`:
```typescript
const mergedToggles = {
  ...existingToggles,
  // Regular toggle:
  enableNewFeature: featureToggles.enableNewFeature ?? existingToggles.enableNewFeature ?? true,
  // OR Superadmin-only toggle:
  enableSuperFeature:
    isSuper && featureToggles.enableSuperFeature !== undefined
      ? featureToggles.enableSuperFeature
      : (existingToggles.enableSuperFeature ?? false),
};
```
2. Invalidate the Redis cache whenever settings are saved:
```typescript
await settings.save();
await deleteCachedData('app:settings');
revalidatePath('/api/settings');
revalidatePath('/api/admin/settings');
```

### Public GET Route (`src/app/api/settings/route.ts`) & Fallback (`src/lib/dataService.ts`)
Add the default value to `defaultSettings.featureToggles` in both `src/app/api/settings/route.ts` and `src/lib/dataService.ts`.

---

## 4. Zustand Store & Defaults (`src/store/useSettingsStore.ts`)

1. Add the key to `FeatureToggleKey`:
```typescript
export type FeatureToggleKey =
  | 'enableBlogs'
  // ...
  | 'enableNewFeature';
```
2. Add the default boolean value to `defaultPublicAppSettings.featureToggles`.

---

## 5. Admin Settings UI

1. **Types** (`src/app/(dashboard)/dashboard/admin/settings/_components/types.ts`): Add to `AppSettings.featureToggles`.
2. **Page state & fetch** (`src/app/(dashboard)/dashboard/admin/settings/page.tsx`):
   - Include in initial state.
   - Include in `fetchSettings()` normalization.
   - Ensure save triggers `await fetchPublicSettings(true)`.
3. **UI Component** (`src/app/(dashboard)/dashboard/admin/settings/_components/FeatureTogglesSection.tsx`):
   - Render `ToggleSwitch` with safe fallback: `checked={settings.featureToggles.enableNewFeature ?? true}`.

---

## 6. Route & Nav Guards

- **Client component gating**:
  ```tsx
  import FeatureGate from '@/components/FeatureGate';
  <FeatureGate feature="enableNewFeature"><FeatureContent /></FeatureGate>
  ```
- **Navigation item gating**: Update `src/hooks/useDashboardNav.ts` and `src/constants/navigation.ts` with the corresponding `NavFeatureFlag`.
- **URL Route Guard**: Add rule to `DASHBOARD_FEATURE_ROUTES` or `PUBLIC_FEATURE_ROUTES` in `src/lib/featureRoutes.ts`.

---

## 7. Server-Side Protection & Translations

- **API Route Guard**:
  ```typescript
  import { requireFeature } from '@/lib/settingsHelpers';
  const featureCheck = await requireFeature('enableNewFeature');
  if (featureCheck) return featureCheck;
  ```
- **Translations**: Add descriptive labels in `src/i18n/en.ts` and `src/i18n/hi.ts` under `adminSettings`.

---

## Verification Steps

1. Run `npm run lint` to verify TypeScript types and schemas.
2. Run `npm run build` to confirm static generation and route guards build correctly.
3. Test toggling the feature in `/dashboard/admin/settings` and verify:
   - Toggle persists across page refreshes.
   - Guarded pages redirect immediately.
   - Sidebar navigation shows/hides the link.

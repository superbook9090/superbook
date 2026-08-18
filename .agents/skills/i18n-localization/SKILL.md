---
name: i18n-localization
description: >-
  Use this skill when adding, modifying, or auditing user-facing text, multilingual copy, or translation keys
  in English (en.ts) and Hindi (hi.ts) across UI components and pages.
---

# i18n Localization and Translation Standard

This skill outlines guidelines and procedures for managing multilingual copy (English & Hindi) across the application.

## Core Rule: No Hardcoded Copy

**All user-facing strings must be localized.** Never place raw user-facing text directly in JSX/TSX.

- English Dictionary: `src/i18n/en.ts`
- Hindi Dictionary: `src/i18n/hi.ts`

---

## 1. Adding New Translation Keys

Whenever a new UI section or feature is introduced:

1. **Add keys to `src/i18n/en.ts`**:
   Group keys logically under an existing section (e.g. `adminSettings`, `studentCourses`, `common`) or create a dedicated section namespace:
   ```typescript
   // src/i18n/en.ts
   export const en = {
     newFeature: {
       title: 'New Feature Title',
       description: 'Detailed description of this feature.',
       submitButton: 'Save Changes',
       statusBadge: 'Active: {count}',
     },
   };
   ```

2. **Add matching keys to `src/i18n/hi.ts`**:
   Maintain exact 1:1 key parity between English and Hindi:
   ```typescript
   // src/i18n/hi.ts
   export const hi = {
     newFeature: {
       title: 'नई सुविधा शीर्षक',
       description: 'इस सुविधा का विस्तृत विवरण।',
       submitButton: 'बदलाव सहेजें',
       statusBadge: 'सक्रिय: {count}',
     },
   };
   ```

---

## 2. Using Translations in Components

Use the `useTranslation` hook in client components:

```tsx
'use client';

import { useTranslation } from '@/hooks/useTranslation';

export function ExampleComponent({ count }: { count: number }) {
  const { t } = useTranslation();

  return (
    <div>
      <h2>{t('newFeature.title')}</h2>
      <p>{t('newFeature.description')}</p>
      <span>{t('newFeature.statusBadge', { count })}</span>
      <button>{t('newFeature.submitButton')}</button>
    </div>
  );
}
```

---

## 3. Translation Utilities & Verification

- **Cleanup and validation script**: Run the translation audit script if keys have been refactored or removed:
  ```bash
  node scripts/cleanup-translations.js
  ```
- **Linter check**:
  ```bash
  npm run lint
  ```
- **Manual Verification**: Toggle the application language between English and Hindi in the navigation bar and verify that all UI elements update properly without missing key warnings.

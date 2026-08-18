# i18n Localization Rules

All user-facing copy in this application must strictly adhere to the localization rules:

## 1. Zero Hardcoded Copy
- **Never** write plain English or Hindi text directly inside JSX/TSX elements.
- All user-facing strings, error messages, toast alerts, placeholders, button labels, and descriptions must be translated via `useTranslation`.

## 2. Dictionary Parity
- English dictionary: `src/i18n/en.ts`
- Hindi dictionary: `src/i18n/hi.ts`
- Whenever a new key is added, updated, or removed, **both `en.ts` and `hi.ts` must be updated simultaneously** to preserve 1:1 structural parity.

## 3. Translation Usage
- Use the `useTranslation` hook in client components:
  ```tsx
  const { t } = useTranslation();
  <p>{t('namespace.key')}</p>
  ```
- Use parameterized strings for dynamic content:
  ```tsx
  t('namespace.greeting', { name: user.name })
  ```
- Run `node scripts/cleanup-translations.js` when auditing or reorganizing translation keys.

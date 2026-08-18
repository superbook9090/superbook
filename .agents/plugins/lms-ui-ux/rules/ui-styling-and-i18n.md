# UI, Styling & Localization Rules (lms-ui-ux)

1. **File Size Limit (< 250 LOC)**:
   - Split components exceeding 250 LOC into local `_components/` and custom hooks.

2. **Mobile First & Touch Targets**:
   - Write base CSS for mobile screens (360px–414px) and enhance upwards (`sm:`, `md:`, `lg:`).
   - Ensure interactive elements have at least 44×44px touch targets.

3. **Shared Layout Primitives**:
   - Use `PageWrapper`, `PageHeader`, `ResponsiveGrid`, and `EmptyState` from `@/components/layout`.

4. **Zero Hardcoded Copy**:
   - All text must use `useTranslation` (`t('namespace.key')`).
   - Add identical keys to both `src/i18n/en.ts` and `src/i18n/hi.ts`.

---
name: mobile-responsive-ui
description: >-
  Use this skill when building, styling, or refactoring UI components and pages in this application,
  ensuring adherence to the <250 LOC rule, mobile-first design, layout primitives, and design system tokens.
---

# Mobile-First Responsive UI Standard

This skill outlines guidelines and architectural rules for developing UI components and pages across the application.

## Core Rules

1. **250 LOC File Size Limit**:
   - No single file should exceed **250 lines of code**.
   - If a file approaches this limit, extract state/fetching into custom hooks (`src/hooks/` or local `_hooks/`) and UI sections into modular subcomponents (`_components/`).

2. **Mobile-First Development**:
   - Base styles must be designed for mobile viewports (360px–414px width).
   - Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`) only to expand or adapt layouts for larger viewports.

3. **Touch Targets (Minimum 44×44px)**:
   - Ensure all interactive elements (buttons, toggles, icons, links) meet the minimum 44px touch target requirement on mobile devices.
   - Use the shared `.touch-target` utility class or adequate padding.

---

## Shared Layout Primitives (`src/components/layout/*`)

Always use shared layout primitives rather than custom ad-hoc containers:

```tsx
import { PageWrapper, PageHeader, ResponsiveGrid, EmptyState } from '@/components/layout';

export default function MyFeaturePage() {
  return (
    <PageWrapper className="max-w-7xl">
      <PageHeader
        title="Feature Title"
        description="Feature subtitle description"
        actions={<Button>Action</Button>}
      />

      <ResponsiveGrid columns={{ default: 1, sm: 2, lg: 3 }}>
        {items.length > 0 ? (
          items.map(item => <ItemCard key={item._id} item={item} />)
        ) : (
          <EmptyState
            title="No items found"
            description="Create your first item to get started."
          />
        )}
      </ResponsiveGrid>
    </PageWrapper>
  );
}
```

---

## Design System Tokens & Global CSS

Rely on tokens defined in `src/app/globals.css`:
- Spacing: `var(--gutter-x)`, `var(--section-gap)`, `.stack-page`, `.card-body`
- Surfaces: `bg-[var(--card-solid)]`, `bg-[var(--color-surface-muted)]`
- Text: `text-[var(--color-foreground)]`, `text-[var(--color-muted-foreground)]`
- Borders: `border-[var(--border)]`

### Role Theme Styling
Use `useRoleTheme` for role-specific accent coloring:
```tsx
const { theme } = useRoleTheme();
// theme provides: theme.primary, theme.text, theme.activeBg, theme.gradient, etc.
```

---

## Component Decomposition Pattern

When a feature page grows complex:
```text
src/app/(dashboard)/dashboard/teacher/courses/
├── page.tsx                    # Shell & data fetching (< 150 LOC)
└── _components/
    ├── CourseList.tsx          # List renderer (< 150 LOC)
    ├── CourseFilterBar.tsx     # Search and filter inputs (< 100 LOC)
    └── types.ts                # Local prop and state interfaces
```

---

## Verification Steps

1. Check file lengths: Ensure all modified/created files are strictly `<= 250 LOC`.
2. Run `npm run lint` and `npm run build`.
3. Check mobile rendering (375px width): Verify that elements do not cause horizontal scrolling and all buttons are easily clickable.

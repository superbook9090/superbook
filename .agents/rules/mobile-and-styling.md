# Mobile-First Design & Styling Rules

All UI components and layouts must follow these design system and styling rules:

## 1. Mobile-First Responsive Design
- Always design and build the base layout for small mobile screens (360px–414px) first.
- Use responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`) only to expand or adapt the layout for larger viewports.
- Avoid desktop-first fixed widths that cause horizontal scrolling on mobile viewports.

## 2. Touch Target Accessibility
- Every interactive element (buttons, icon triggers, toggle switches, form inputs, navigation links) must have a touch target of at least **44×44 pixels** on mobile.
- Use the `.touch-target` utility class or adequate padding (`p-2.5`, `py-3`) where appropriate.

## 3. Shared Layout Primitives
- Prefer shared layout primitives from `src/components/layout/*` over ad-hoc container wrappers:
  - `PageWrapper`: Main page container with standard max-width and gutter padding.
  - `PageHeader`: Standardized title, subtitle description, and action button bar.
  - `DashboardContent`: Dashboard section container.
  - `ResponsiveGrid`: Configurable responsive grid layout.
  - `EmptyState`: Standardized empty state card with action prompt.

## 4. Design Tokens & Global CSS
- Use design tokens defined in `src/app/globals.css`:
  - Spacing tokens: `var(--gutter-x)`, `var(--section-gap)`, `.stack-page`, `.card-body`
  - Theme colors: `var(--primary)`, `var(--card-solid)`, `var(--color-surface-muted)`, `var(--color-foreground)`, `var(--color-muted-foreground)`
- Use `useRoleTheme` context for role-specific dynamic accent colors (`theme.text`, `theme.activeBg`, `theme.gradient`).
- **Do not use inline `style={{ ... }}`** unless calculating dynamic runtime percentages (e.g. progress bars).

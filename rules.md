# Project Rules and Guidelines

This document outlines the standard rules, coding practices, and design guidelines for this project. All developers and agents must adhere to these rules to maintain consistency, readability, and performance.

## 1. Code & Component Rules

- **File Size Limit**: No file should exceed **250 lines of code**. If a file grows beyond this limit, it must be refactored by extracting logic into smaller, reusable components, custom hooks, or utility functions.
- **Strict TypeScript**: Use strict TypeScript. Avoid using `any`, `@ts-ignore`, or bypassing type checks. Define explicit interfaces or types for component props and state.
- **Functional Components**: Use functional React components with hooks. Avoid class-based components.
- **Single Responsibility Principle**: Each component should do one thing well. If a component handles too much state or UI logic, break it down.
- **Reusable Components**: Use reusable components whenever possible.
- **Exports**: Prefer named exports for components and utilities to ensure consistent naming during imports, except for Next.js specific files (like `page.tsx` or `layout.tsx`) which require default exports.

## 2. Design & Styling Rules

- **Mobile-Centric Design**: Always design for mobile screens first. Build the base layout for smaller screens and use responsive breakpoints (e.g., `sm:`, `md:`, `lg:`) to adapt the UI for tablets and desktops.
- **Global CSS**: Rely on global CSS (`src/app/globals.css`) for design tokens, typography, colors, and shared utility classes (`.card-panel`, `.stack-page`, etc.). This ensures a unified design system across the application.
- **Styling & Fonts**: Use global css and fonts design patterns for styling.
- **Avoid Inline Styles**: Do not use inline `style={{ ... }}` unless calculating dynamic values (like a progress bar percentage). Use Tailwind classes or global CSS classes instead.
- **Touch Accessibility**: Ensure all interactive elements (buttons, links, inputs) have adequate touch targets (minimum 44x44 pixels) for mobile users.

## 3. General Best Practices

- **Avoid Magic Numbers**: Extract constant values (e.g., pagination limits, timeout durations) into a dedicated constants file.
- **Localization (i18n)**: Do not hardcode user-facing text. Always use the `useTranslation` hook (`t('key')`) to fetch strings from `en.ts` and `hi.ts`.
- **State Management**: Use Zustand for global state and React Query for server state/data fetching. Keep React component state (`useState`) strictly for localized UI state (like dropdown toggles or form inputs).

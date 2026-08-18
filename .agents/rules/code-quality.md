# Code Quality & Component Architecture Rules

All code written in this repository must strictly adhere to these quality and architecture rules:

## 1. File Length Limit (< 250 LOC)
- **Maximum File Size**: No file must exceed **250 lines of code**.
- **Refactoring Requirement**: When a component or handler approaches this threshold, immediately split it into:
  - Custom hooks (`src/hooks/` or local `_hooks/`) for state and data fetching.
  - Subcomponents in a local `_components/` directory.
  - Types in a local `types.ts` file.

## 2. Strict TypeScript
- Explicitly define interfaces or types for all component props, state, and API responses.
- **Never** use `any`, `@ts-ignore`, or loose type casting unless strictly interfacing with untyped third-party libraries.
- Avoid duplicate type definitions—import shared interfaces from `src/models/`, `src/store/`, or `src/lib/`.

## 3. Component Architecture
- **Functional Components**: Use only functional React components with React hooks.
- **Single Responsibility Principle (SRP)**: Each component must focus on one single UI or functional purpose.
- **Exports**: Use named exports for reusable components and utilities. Default exports are reserved solely for Next.js App Router files (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`).
- **JSX Fragment Safety**: When modifying complex TSX with nested JSX, make narrow, targeted edits to avoid corrupting JSX tag pairings.

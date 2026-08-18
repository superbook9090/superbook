# Verification & Build Standards (lms-quality-gate)

1. **Lint Validation**:
   - Always run `npm run lint` before concluding tasks involving code modifications.
   - Code must pass ESLint with zero errors.

2. **Build Validation**:
   - Run `npm run build` whenever modifying server routes, Mongoose models, authentication config, or shared types to ensure static and dynamic page generation succeeds.

3. **Authorization & Feature Tests**:
   - Verify both authorized and unauthorized cases when changing permissions or feature gates.

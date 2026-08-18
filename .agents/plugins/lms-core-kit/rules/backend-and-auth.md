# Backend & Authentication Rules (lms-core-kit)

1. **Authentication Enforcement**:
   - Every protected API route must call `getServerSession(authOptions)` and verify `session?.user`.
   - Never trust role or user ID parameters passed in request bodies or query parameters.

2. **Database & Queries**:
   - Call `await dbConnect()` before executing any Mongoose operation.
   - Use `.lean()` for read queries.
   - Avoid creating duplicate indexes in Mongoose models.

3. **Cache Hygiene**:
   - Use `getCachedData` and `setCachedData` with reasonable TTLs (default 300s).
   - Invalidate cache on all mutating endpoints (`POST`, `PUT`, `PATCH`, `DELETE`) using `deleteCachedData(key)` or `invalidatePattern(pattern)`.

4. **Feature Gating**:
   - Guard toggleable endpoints with `requireFeature('enableFeature')`.

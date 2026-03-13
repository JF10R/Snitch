## CATEGORY 46: Error Handling & Fail-Safe Defaults

> **OWASP references:** A10:2025 Mishandling of Exceptional Conditions (CWE-754 Improper Check for Unusual or Exceptional Conditions, CWE-755 Improper Handling of Exceptional Conditions, CWE-391 Unchecked Error Condition).
>
> **Cross-reference:** Category 12 (Data Leaks) covers sensitive data in error responses. This category focuses on error handling logic itself: empty catch blocks, fail-open patterns, unhandled rejections, and missing error boundaries.

### Detection
- Error handling patterns: `try/catch`, `catch`, `.catch()`, `on('error')`, `process.on('uncaughtException')`
- Error boundaries: `ErrorBoundary`, `componentDidCatch`, `getDerivedStateFromError`
- Express/Fastify error middleware: `app.use((err, req, res, next))`
- Promise rejection handling: `unhandledRejection`, `.catch()`, `async/await` without try/catch
- Fail-open configs: `failOpen`, `allowOnError`, `continueOnError`, `ignoreErrors`
- Auth gate error paths: `isAuthenticated`, `authorize`, `requireAuth`, `protect`

### What to Search For

**Empty or swallowed catch blocks:**
- `catch (e) {}` or `catch (_) {}` — error completely ignored
- `catch` blocks that only log but don't re-throw, return an error response, or take corrective action in auth/payment/security flows
- `.catch(() => {})` on promises in security-critical paths
- `on('error', () => {})` with no handling on database or network connections

**Fail-open patterns in auth/security gates:**
- Auth middleware that returns `next()` (allows access) when an error occurs during token/session validation
- Authorization checks with `catch` blocks that default to "allow" instead of "deny"
- `failOpen: true` or `continueOnError: true` in security-related configuration
- Feature flag checks that default to "enabled" on error (exposing unreleased/admin features)
- Rate limiter configured to allow requests when the backing store (Redis) is unavailable

**Unhandled promise rejections and async errors:**
- `async` Express/Fastify route handlers without try/catch (unhandled rejection crashes or silently fails)
- Missing `.catch()` on promises in middleware chains
- No global `unhandledRejection` handler in Node.js process
- `Promise.all()` without error handling (one rejection loses all results silently)
- `async` event handlers (WebSocket `on('message')`, queue consumers) without try/catch

**Missing error boundaries (frontend):**
- React app with no `ErrorBoundary` component wrapping critical sections
- Entire app crashes on a single component error (no isolation)
- Error boundaries that render nothing (blank screen) instead of fallback UI
- No error boundary around data-fetching components or third-party widgets

**Inconsistent error responses:**
- Some API endpoints return structured errors, others return raw stack traces
- Error responses that leak internal paths, database schemas, or dependency versions
- Missing error handler middleware in Express/Fastify (default handler exposes stack traces in development mode)
- GraphQL errors exposing resolver internals or database error messages
- Different HTTP status codes for the same type of error across endpoints

**Critical error path failures:**
- Payment processing that silently continues after a charge failure
- Data write operations that don't check for write errors (database insert without error handling)
- File operations (delete, move) without error checking (TOCTOU risk)
- Transaction rollback not triggered on error (partial writes committed)

### Critical
- Auth/authorization middleware with catch block that calls `next()` (fail-open on auth error)
- Payment processing that does not check charge result for failure (money lost or stolen)
- Empty catch block in security-critical flow (token validation, permission check, encryption)

### High
- `async` route handlers in Express without try/catch (unhandled rejections crash the process or return 500)
- No global `unhandledRejection` handler in production Node.js process
- Rate limiter configured with `failOpen: true` — allows unlimited requests when Redis is down
- Database transaction without rollback on error (partial data committed)
- Error boundary that renders blank/nothing instead of fallback UI (user stuck on white screen)

### Medium
- Empty catch blocks in non-security code (data fetching, UI rendering)
- No `ErrorBoundary` wrapping third-party components or data-fetching sections
- Inconsistent error response format across API endpoints
- `.catch(() => null)` on data-fetching promises (silent failures, stale data shown as current)
- Missing error handling on file system operations (read/write/delete without checking result)
- `Promise.all()` without `.catch()` or `Promise.allSettled()` alternative

### Context Check
1. Does the application have a global error handler (Express error middleware, `unhandledRejection` listener)?
2. Are `async` route handlers wrapped in try/catch or using an async error wrapper utility?
3. Do auth/authorization middleware error paths default to "deny" (fail-closed)?
4. Are React error boundaries in place for critical UI sections?
5. Do payment and data-write operations explicitly check for and handle errors?
6. Is error response format consistent across all API endpoints?
7. Are rate limiters and feature flags configured to fail-closed (deny on error)?

### NOT Vulnerable
- Global Express/Fastify error handling middleware installed (`app.use((err, req, res, next) => ...)`)
- All `async` route handlers wrapped in try/catch or using `express-async-errors` / async wrapper
- Auth middleware returns 401/403 on ANY error (fail-closed)
- Rate limiter configured with `failClosed: true` or equivalent (blocks on store error)
- React error boundaries wrapping major UI sections with meaningful fallback UI
- `unhandledRejection` and `uncaughtException` handlers logging and gracefully shutting down
- Consistent structured error response format (e.g., `{ error: { code, message } }`) across all endpoints
- Database transactions with proper rollback on error
- Payment flows that verify charge success before fulfilling orders

### Files to Check
- `**/middleware/**/*.{ts,js}`, `**/auth/**/*.{ts,js,py}`
- `**/routes/**/*.{ts,js}`, `**/api/**/*.{ts,js}`, `**/controllers/**/*.{ts,js}`
- `**/error*.{ts,js,tsx,jsx}`, `**/ErrorBoundary*.{tsx,jsx}`
- `app.{ts,js}`, `server.{ts,js}` (error middleware setup)
- `**/payment*.{ts,js}`, `**/checkout*.{ts,js}`, `**/billing*.{ts,js}`
- `**/services/**/*.{ts,js}`, `**/lib/**/*.{ts,js}`
- `**/queue/**/*.{ts,js}`, `**/workers/**/*.{ts,js}` (async job error handling)

## CATEGORY 8: CORS Configuration

### Detection
- CORS middleware: `cors` package, `Access-Control-Allow-Origin` headers
- Framework CORS config: Next.js `next.config.js` headers, Express `cors()` middleware
- Manual header setting in API routes

### What to Search For
- CORS middleware configuration
- Access-Control headers
- Origin handling with credentials

### Actually Vulnerable
- Wildcard origin combined with credentials enabled
- Origin reflection without validation

### NOT Vulnerable
- Wildcard origin without credentials (public APIs)
- Specific origin allowlist
- Origin validation function
- CORS config in dev-only files (see Dev-Only Check below)

### Dev-Only Check (REQUIRED)
Before flagging a CORS finding, verify where the config lives:
1. **Dev-only files** — build tool configs, local dev server proxies, test harnesses: these only run during local development and are never active in production. **Skip** or downgrade to **Low** with "dev-only" label.
2. **Production files** — application server code, deployed middleware, API route handlers: flag at full severity.
3. If both dev and prod have CORS config, evaluate each independently — a permissive dev proxy does not mean production is misconfigured.

### Context Check
1. Is this a public API intended for cross-origin access?
2. Are credentials (cookies, auth headers) being sent with CORS requests?
3. Is the origin allowlist properly restricted to known domains?
4. Does the production server reproduce the same CORS behavior, or is it dev-only?

### Files to Check
- `**/cors*.ts`, `**/middleware*.ts`
- `next.config.*`, `**/server*.ts`
- API route files setting response headers
- Build tool and dev server configs (dev proxies — likely dev-only)

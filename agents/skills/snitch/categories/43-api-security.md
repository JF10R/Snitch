## CATEGORY 43: API Security

> **OWASP references:** A01:2025 Broken Access Control (CWE-284), A04:2025 Insecure Design (CWE-209 excessive data exposure). Also covers OWASP API Security Top 10: API1 (BOLA), API3 (Excessive Data Exposure), API5 (BFLA), API6 (Mass Assignment), API8 (Security Misconfiguration).
>
> **Cross-reference:** Category 28 (Authorization/IDOR) covers ownership checks on individual resources. Category 7 (Rate Limiting) covers throttling. This category covers broader API design flaws: mass assignment, excessive data exposure, GraphQL introspection, missing pagination, and REST endpoint hardening.

### Detection
- REST frameworks: `express`, `fastify`, `koa`, `hono`, `next` (API routes), `flask`, `django-rest-framework`, `fastapi`
- GraphQL: `graphql`, `@apollo/server`, `apollo-server`, `type-graphql`, `nexus`, `pothos`, `graphql-yoga`, `mercurius`
- API route patterns: `pages/api/**`, `app/api/**`, `routes/**`, `controllers/**`
- OpenAPI/Swagger: `swagger`, `@nestjs/swagger`, `openapi`, `tsoa`
- tRPC: `@trpc/server`, `@trpc/client`

### What to Search For

**Mass assignment / over-posting:**
- ORM create/update using `req.body` directly without field allow-listing
- `prisma.*.create({ data: req.body })` or `prisma.*.update({ data: req.body })`
- `Model.create(req.body)`, `Model.findByIdAndUpdate(id, req.body)`
- Spread operator on request body into database calls: `...req.body`
- No schema validation (Zod, Joi, Yup) stripping unknown fields before ORM call

**Excessive data exposure:**
- API endpoints returning full database objects without field selection
- `SELECT *` or ORM `findMany()`/`findAll()` without `select` clause
- User objects returned with password hashes, internal IDs, or metadata
- Error responses leaking stack traces, SQL queries, or internal paths
- Sensitive fields (email, phone, SSN) returned in list endpoints without need

**GraphQL-specific risks:**
- Introspection enabled in production (`introspection: true` or not explicitly disabled)
- No query depth limiting (allows deeply nested queries for DoS)
- No query complexity analysis or cost limiting
- Batch queries without limits (allows mass data extraction)
- Missing field-level authorization (all fields accessible to all authenticated users)
- `__schema` and `__type` queries accessible in production

**Missing pagination:**
- List endpoints with no `limit`/`offset` or `cursor` parameters
- Database queries with no `take`/`limit` clause
- Endpoints that return unbounded result sets

**Verbose error responses:**
- Stack traces in production error responses
- Database error messages forwarded to clients
- Internal file paths or server info in error payloads
- Detailed validation errors exposing schema structure

**Missing request validation:**
- API endpoints with no input validation middleware
- Path parameters used directly without type checking (`:id` not validated as UUID/integer)
- Query parameters not sanitized or type-coerced
- Request body accepted without schema validation

**API versioning and deprecation:**
- No API versioning strategy (breaking changes affect all clients)
- Deprecated endpoints still active with no sunset headers
- Multiple API versions with inconsistent security controls

### Critical
- Mass assignment allowing privilege escalation: `prisma.user.update({ data: req.body })` where body can include `role`, `isAdmin`, or permission fields
- GraphQL introspection enabled in production with no authentication (full schema exposure)
- API endpoints returning password hashes, tokens, or encryption keys in response payloads

### High
- ORM create/update using unsanitized `req.body` without field allow-listing
- List endpoints returning full objects with sensitive fields (emails, phones, internal IDs)
- GraphQL with no query depth or complexity limits (DoS vector)
- Stack traces or database errors in production API responses
- No pagination on list endpoints (unbounded data extraction)
- GraphQL batch queries with no rate limiting

### Medium
- `SELECT *` in API handlers returning more fields than the client needs
- No request body validation schema on mutation endpoints
- Path/query parameters not type-validated
- Missing `Content-Type` validation (accepts unexpected content types)
- No API versioning strategy
- Missing `X-Content-Type-Options: nosniff` on API responses
- Deprecated endpoints still active without sunset headers

### Context Check
1. Do create/update endpoints validate and allow-list input fields before passing to ORM?
2. Do list endpoints select only necessary fields, or return full database objects?
3. Is GraphQL introspection disabled in production?
4. Are there query depth and complexity limits on GraphQL endpoints?
5. Do error handlers strip stack traces and internal details in production?
6. Do list endpoints enforce pagination with reasonable defaults?
7. Is request body validation (Zod, Joi, class-validator) applied to all mutation endpoints?

### NOT Vulnerable
- Explicit field destructuring before ORM calls: `const { name, email } = validatedBody`
- Zod/Joi/Yup schema validation that strips unknown fields before database operations
- API responses using DTOs or `select` clauses to return only needed fields
- GraphQL introspection disabled in production (`introspection: process.env.NODE_ENV !== 'production'`)
- Query depth limiting via `graphql-depth-limit` or equivalent
- Pagination enforced with sensible defaults and maximum limits
- Generic error responses in production with detailed errors only in development
- Request validation middleware on all endpoints

### Files to Check
- `pages/api/**/*.{ts,js}`, `app/api/**/*.{ts,js}`
- `**/routes/**/*.{ts,js}`, `**/controllers/**/*.{ts,js}`
- `**/graphql/**/*.{ts,js}`, `**/schema/**/*.{ts,js}`, `**/resolvers/**/*.{ts,js}`
- `**/middleware/**/*.{ts,js}`
- `**/trpc/**/*.{ts,js}`, `**/routers/**/*.{ts,js}`
- `**/dto/**/*.{ts,js}`, `**/models/**/*.{ts,js}`
- `**/error*.{ts,js}`, `**/handler*.{ts,js}`

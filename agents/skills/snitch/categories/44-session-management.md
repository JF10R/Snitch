## CATEGORY 44: Session Management & CSRF

> **OWASP references:** A07:2025 Authentication Failures (CWE-384 Session Fixation), A01:2025 Broken Access Control (CWE-613 Insufficient Session Expiration, CWE-352 Cross-Site Request Forgery).
>
> **Cross-reference:** Category 4 (Authentication) covers login flows, password policies, and MFA. Category 39 (Token Lifetimes) covers JWT/refresh token expiration. This category focuses on session mechanics: cookie flags, session fixation, storage backends, concurrent session handling, and CSRF protection (token validation, framework middleware, Origin/Referer verification).

### Detection
- Session libraries: `express-session`, `iron-session`, `@hono/session`, `flask-session`, `django.contrib.sessions`
- Cookie handling: `Set-Cookie`, `cookie-parser`, `cookies`, `js-cookie`, `nookies`
- Session stores: `connect-redis`, `connect-mongo`, `connect-pg-simple`, `memorystore`
- Framework session configs: `next-auth` session options, `lucia` session management
- JWT session patterns: `jsonwebtoken`, `jose`, stateless session in cookies
- CSRF libraries: `csurf`, `csrf-csrf`, `csrf`, `tiny-csrf`, `lusca`
- Framework CSRF: `django.middleware.csrf`, `@rails/csrf`, `gorilla/csrf`, `antiforgery` (.NET)
- Frontend frameworks with built-in CSRF: Next.js Server Actions, SvelteKit form actions, Remix actions

### What to Search For

**Missing cookie security flags:**
- `Set-Cookie` without `Secure` flag (sent over HTTP)
- `Set-Cookie` without `HttpOnly` flag (accessible to JavaScript — XSS can steal session)
- `Set-Cookie` without `SameSite` attribute (vulnerable to CSRF)
- `SameSite=None` without `Secure` (rejected by browsers, but indicates CSRF exposure intent)
- Cookie `Domain` set too broadly (`.example.com` when only `app.example.com` needed)
- Cookie `Path` set to `/` when a narrower path would suffice

**Session fixation:**
- Session ID not regenerated after successful login
- Same session token used before and after authentication
- Session ID accepted from URL query parameters or POST body (not just cookies)
- No call to `req.session.regenerate()` or equivalent after authentication

**Insecure session storage:**
- In-memory session store in production (`express-session` default `MemoryStore`)
- Session data stored in `localStorage` (accessible to XSS)
- Session tokens in URL parameters (leaked via Referer header, browser history, server logs)
- Session data in unsigned or unencrypted cookies (client-side tampering)

**Session lifecycle issues:**
- No session expiration (idle or absolute timeout)
- Session not destroyed on logout (only cookie cleared, server-side session persists)
- No maximum session duration (sessions that live forever if active)
- Concurrent sessions not limited (no mechanism to invalidate other sessions)

**Session token quality:**
- Session IDs generated with weak randomness (`Math.random()`, sequential IDs)
- Short session tokens (< 128 bits of entropy)
- Session tokens containing decodable user data (predictable patterns)
- Session tokens not rotated periodically during long-lived sessions

**Cross-domain session issues:**
- Session cookies shared across subdomains unnecessarily
- Session data accessible across origins via CORS + credentials
- Embedded iframes sharing parent session without explicit opt-in

**Missing CSRF tokens on state-changing endpoints:**
- POST/PUT/PATCH/DELETE routes with no CSRF token validation
- Form submissions without a hidden CSRF token field
- AJAX requests to state-changing endpoints without CSRF header (e.g., `X-CSRF-Token`)
- API endpoints that accept both cookie auth and form submissions without CSRF protection
- State-changing GET requests (should be POST/PUT/DELETE with CSRF)

**Missing CSRF middleware:**
- Express app without `csurf` or `csrf-csrf` middleware on state-changing routes
- Django settings with `django.middleware.csrf.CsrfViewMiddleware` removed or `@csrf_exempt` on sensitive views
- Rails controller with `skip_before_action :verify_authenticity_token` on sensitive actions
- No global CSRF middleware and no per-route CSRF checks

**Weak CSRF implementations:**
- CSRF token not tied to user session (static or predictable tokens)
- CSRF token transmitted only in cookie without double-submit validation
- CSRF token not rotated after login or privilege escalation
- CSRF token validation using timing-unsafe string comparison
- Token stored in localStorage (accessible to XSS, defeating CSRF purpose)

**Origin/Referer validation issues:**
- No `Origin` or `Referer` header check on state-changing requests
- Origin validation with substring match instead of exact match (e.g., `evil-example.com` matching `example.com`)
- Allowing null Origin without additional validation
- Referer check that accepts any path from the same domain (doesn't prevent subdomain attacks)

**Framework-specific CSRF gaps:**
- Next.js: API routes using Pages Router without CSRF protection (App Router Server Actions have built-in CSRF)
- Express: `cors()` with `credentials: true` but no CSRF middleware
- Django: views decorated with `@csrf_exempt` on password change, email change, or payment endpoints
- SPA + API: cookie-based auth with no CSRF protection (relying solely on CORS is insufficient)

### Critical
- Session ID in URL query parameter (exposed in Referer, logs, browser history)
- Session tokens generated with `Math.random()` or other weak PRNG
- Session fixation: no session regeneration after login (attacker can pre-set session ID)
- Session cookie without `HttpOnly` AND application has known XSS vectors
- State-changing endpoints (password change, email change, fund transfer) with no CSRF protection of any kind
- `@csrf_exempt` on Django views handling authentication or payment operations
- CSRF token that is static, predictable, or not tied to the user session

### High
- `Set-Cookie` missing `Secure` flag on session cookies (MITM can intercept)
- `Set-Cookie` missing `HttpOnly` flag on session cookies (XSS can steal sessions)
- `Set-Cookie` missing `SameSite` attribute (CSRF exposure)
- In-memory session store (`MemoryStore`) used in production (data loss on restart, no scaling)
- Session not destroyed server-side on logout (only cookie cleared)
- No session expiration configured (idle or absolute)
- Session data stored in `localStorage` (XSS accessible)
- No CSRF middleware installed on Express/Fastify app using cookie-based authentication
- `skip_before_action :verify_authenticity_token` on Rails controllers handling sensitive operations
- SPA with cookie-based API auth and no CSRF token or double-submit cookie pattern
- POST endpoints accepting `application/x-www-form-urlencoded` with cookie auth but no CSRF validation
- Origin/Referer validation using substring or regex match instead of exact domain comparison

### Medium
- No concurrent session limit (user cannot see or revoke other sessions)
- Session tokens not rotated during long-lived sessions
- Cookie `Domain` broader than necessary
- No absolute session timeout (only idle timeout)
- Session cookie `SameSite=None` (required for cross-site use but increases CSRF surface)
- Unsigned session cookies (client-side tampering possible)
- CSRF token not rotated after login or privilege escalation
- CSRF token stored in localStorage instead of a meta tag or cookie
- Missing CSRF protection on non-critical but state-changing endpoints (profile update, settings change)
- No `Origin` header validation as a secondary defense alongside token-based CSRF
- API endpoints accepting both JSON and form-encoded content types without CSRF on the form path

### Context Check
1. Are session cookies set with `Secure`, `HttpOnly`, and `SameSite` flags?
2. Is the session ID regenerated after successful login?
3. What is the session storage backend — in-memory, Redis, database?
4. Is the session destroyed server-side on logout, or only the cookie cleared?
5. Are session expiration timeouts configured (idle + absolute)?
6. How are session tokens generated — cryptographically secure random?
7. Can users see and revoke active sessions?
8. Does the application use cookie-based authentication (session cookies, `credentials: 'include'`)?
9. Is a CSRF middleware or framework-level CSRF protection enabled globally?
10. Are there any `@csrf_exempt`, `skip_before_action :verify_authenticity_token`, or equivalent exemptions?
11. Do state-changing endpoints validate a CSRF token, double-submit cookie, or Origin header?
12. Does the SPA use token-based auth (Bearer tokens in headers) instead of cookies? If so, CSRF is not applicable.
13. Are Server Actions (Next.js App Router) or equivalent framework features providing built-in CSRF?

### NOT Vulnerable
- Session cookies with `Secure; HttpOnly; SameSite=Lax` (or `Strict`)
- Session ID regenerated on authentication state changes (login, privilege escalation)
- Server-side session store (Redis, database) with proper TTL
- Session fully destroyed (server + cookie) on logout
- Idle timeout (15-30 min for sensitive apps) + absolute timeout (8-24 hours)
- Session tokens generated with `crypto.randomBytes()` or equivalent CSPRNG (>= 128 bits)
- Concurrent session management with ability to list and revoke sessions
- Periodic session rotation during long-lived sessions
- CSRF middleware enabled globally (e.g., `app.use(csrf())`, Django `CsrfViewMiddleware` in MIDDLEWARE)
- All forms include a CSRF token in a hidden field (`<input type="hidden" name="_csrf">`)
- Double-submit cookie pattern with server-side validation
- SPA using Bearer token authentication (no cookies) — CSRF not applicable
- Next.js App Router Server Actions (have built-in CSRF protection)
- Origin/Referer validated with exact domain match on all state-changing requests
- API-only endpoints that reject `application/x-www-form-urlencoded` and only accept JSON with proper CORS

### Files to Check
- `**/session*.{ts,js,py}`, `**/cookie*.{ts,js,py}`
- `**/auth/**/*.{ts,js}`, `**/login*.{ts,js}`
- `**/middleware/**/*.{ts,js}`
- `**/config/**/*.{ts,js}` (session configuration)
- `app.{ts,js}`, `server.{ts,js}` (Express/Fastify session setup)
- `**/logout*.{ts,js}`, `**/signout*.{ts,js}`
- `next.config.*`, `nuxt.config.*` (framework session options)
- `**/csrf*.{ts,js,py,rb}`, `**/middleware*.{py,rb}`
- `**/routes/**/*.{ts,js}`, `**/api/**/*.{ts,js}`
- `**/controllers/**/*.{rb,py}`, `**/views/**/*.py`
- `**/settings.py`, `**/config/**/*.{rb,py}` (framework CSRF config)
- `**/forms/**/*.{tsx,jsx,html}`, `**/*.form.{tsx,jsx}`

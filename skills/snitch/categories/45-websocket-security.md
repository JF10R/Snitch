## CATEGORY 45: WebSocket Security

> **OWASP references:** A01:2025 Broken Access Control (CWE-284), A07:2025 Authentication Failures (CWE-287 for missing WS auth).
>
> **Cross-reference:** Category 8 (CORS) covers HTTP origin policies. Category 7 (Rate Limiting) covers HTTP request throttling. This category focuses on WebSocket-specific risks: authentication on upgrade, origin validation, message validation, and connection management.

### Detection
- WebSocket libraries: `ws`, `socket.io`, `@socket.io/`, `uWebSockets.js`, `websocket`, `sockjs`, `engine.io`
- Framework WebSocket support: `fastify-websocket`, `express-ws`, `@hono/websocket`, `channels` (Django)
- Real-time services: `pusher`, `ably`, `@supabase/realtime-js`, `phoenix` (Elixir channels)
- WebSocket route patterns: `wss://`, `ws://`, `upgrade` handlers, `on('connection')`

### What to Search For

**Missing authentication on WebSocket connections:**
- WebSocket upgrade handlers with no authentication check
- `wss.on('connection')` handler that does not verify token/session before accepting
- Socket.io `io.on('connection')` without authentication middleware
- Relying solely on the initial HTTP handshake cookie without re-validating
- No token verification in WebSocket `upgrade` event

**Missing origin validation:**
- WebSocket server accepting connections from any origin
- No `Origin` header check on upgrade request
- Socket.io with `cors: { origin: '*' }` or no CORS config
- `verifyClient` callback missing or always returning `true`

**Message validation:**
- Client messages parsed with `JSON.parse()` and used without schema validation
- Message types/events not validated against an allowed list
- User-supplied data from WebSocket messages used in database queries without sanitization
- Binary messages accepted without content-type or size validation
- Messages broadcast to other clients without sanitization (stored XSS via WebSocket)

**Authorization on channels/rooms:**
- Users can subscribe to any room/channel without ownership check
- No per-message authorization (user sends message to channel they shouldn't access)
- Admin/privileged channels joinable without role verification
- Room names derived from user input without validation (room enumeration)

**Connection management:**
- No maximum connections per user/IP (DoS via connection exhaustion)
- No message rate limiting per connection (flood attack)
- No maximum message size limit (memory exhaustion)
- No idle timeout on WebSocket connections (resource leak)
- No heartbeat/ping-pong mechanism (stale connection detection)

**Data exposure:**
- Sensitive data broadcast to all connected clients (not scoped to authorized recipients)
- WebSocket error messages exposing server internals
- Debug/verbose logging of WebSocket message contents containing PII
- Server state information leaked through WebSocket events

**Transport security:**
- `ws://` (unencrypted) used instead of `wss://` in production
- WebSocket connection URLs hardcoded with `ws://` protocol
- No TLS certificate validation on WebSocket client connections

### Critical
- WebSocket server with no authentication — any client can connect and receive data
- Client messages used directly in SQL queries or shell commands without sanitization
- Sensitive data (PII, tokens, financial data) broadcast to all connections without scoping

### High
- No origin validation on WebSocket upgrade (CSWSH — Cross-Site WebSocket Hijacking)
- Socket.io / WS server with `cors: { origin: '*' }` or no origin check
- No message validation schema — arbitrary JSON accepted and processed
- Users can join any channel/room without authorization check
- `ws://` (unencrypted) WebSocket URLs in production code
- No per-connection message rate limiting (flood DoS vector)

### Medium
- No maximum message size limit (memory exhaustion vector)
- No idle timeout or heartbeat on WebSocket connections (stale connection leak)
- No maximum connections per user/IP
- WebSocket messages broadcast without HTML/XSS sanitization
- Error messages on WebSocket exposing server internals
- No reconnection backoff strategy on client (thundering herd on server restart)

### Context Check
1. Is authentication verified on the WebSocket upgrade/connection event?
2. Is the `Origin` header validated before accepting WebSocket connections?
3. Are incoming messages validated against a schema before processing?
4. Is channel/room subscription gated by authorization checks?
5. Are there rate limits, message size limits, and connection limits?
6. Is `wss://` used exclusively in production?
7. Is sensitive data scoped to authorized recipients only?

### NOT Vulnerable
- Authentication middleware on WebSocket upgrade (token/session verified before connection accepted)
- `Origin` header validated against an allowlist in `verifyClient` or equivalent
- All incoming messages validated with schema (Zod, Joi, or typed event handlers)
- Channel/room access gated by ownership or role checks
- Per-connection rate limiting, max message size, and max connections per IP
- `wss://` exclusively in production with valid TLS certificates
- Sensitive data sent only to authorized, scoped recipients
- Heartbeat/ping-pong with idle timeout for stale connection cleanup

### Files to Check
- `**/ws*.{ts,js}`, `**/websocket*.{ts,js}`, `**/socket*.{ts,js}`
- `**/io.{ts,js}`, `**/realtime*.{ts,js}`, `**/channels*.{ts,js}`
- `**/events/**/*.{ts,js}`, `**/handlers/**/*.{ts,js}`
- `**/middleware/**/*.{ts,js}` (WebSocket auth middleware)
- `app.{ts,js}`, `server.{ts,js}` (WebSocket server setup)
- `**/config/**/*.{ts,js}` (Socket.io/WS configuration)

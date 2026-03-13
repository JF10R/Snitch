# Scan Menu & Category Selection

This file is loaded by SKILL.md at STEP 1. It defines the interactive menu flow, category groupings, smart detection logic, and name mapping.

---

## INTERACTIVE SCAN SELECTION

When the skill is invoked with NO arguments:

**MANDATORY: Before outputting any text — before reading any files — your very first tool call
MUST be `AskUserQuestion`.** Do not print a menu, do not greet the user, do not describe what
you are about to do. Call the tool immediately. The tool renders native UI (buttons, checkboxes)
inside Claude Code — this is what replaces the text menu.

Only fall back to the text menu below if the `AskUserQuestion` tool call itself returns a
hard error.

### Interactive Menu (AskUserQuestion Flow)

**Call `AskUserQuestion` now — do not output anything first.**

Three sequential `AskUserQuestion` calls. Each shows checkboxes for a slice of the 47 categories. Accumulate all checked items across all three calls, then run the union.

---

#### Call 1 of 3 — Core Security (Cats 1–12) + Scan Mode

Call `AskUserQuestion` with 4 questions:

**Q1** `multiSelect: true` | header: `"Security"`
- **💉 SQL Injection** (Cat 1) — attackers can run database commands through your app
- **🎭 XSS** (Cat 2) — attackers can inject scripts into pages your users see
- **🔑 Hardcoded Secrets** (Cat 3) — API keys or passwords sitting in your source code
- **🔐 Auth & Login** (Cat 4) — weak login security, broken sessions, open redirects

**Q2** `multiSelect: true` | header: `"Networking"`
- **🌐 SSRF** (Cat 5) — your server can be tricked into fetching internal URLs
- **🐘 Supabase** (Cat 6) — missing row-level security, exposed service keys
- **🚦 Rate Limiting** (Cat 7) — no limits on login attempts or sensitive endpoints
- **🌍 CORS** (Cat 8) — other websites can make requests to your API

**Q3** `multiSelect: true` | header: `"Code & Cloud"`
- **🔒 Crypto** (Cat 9) — weak hashing, bad randomness, hardcoded encryption keys
- **💣 Dangerous Patterns** (Cat 10) — risky code like dynamic evaluation or shell commands
- **☁️ Cloud** (Cat 11) — overly permissive IAM, exposed cloud credentials
- **👁️ Data Leaks** (Cat 12) — passwords or tokens showing up in logs or error messages

**Q4** `multiSelect: false` | header: `"Scan Mode"`
- **Continue →** pick more categories on the next pages
- **Quick Scan** auto-detect what matters based on your tech stack
- **Full System Scan** check everything (all 47 categories)

> If Q4 = **Quick Scan**: run smart detection + any Q1–Q3 boxes already checked; stop here.
> If Q4 = **Full System Scan**: run all 47; stop here.
> If Q4 = **Continue →**: proceed to Call 2 with Q1–Q3 selections accumulated.

---

#### Call 2 of 3 — Modern Stack + Compliance + Performance (Cats 13–26, 39)

Call `AskUserQuestion` with 4 questions:

**Q1** `multiSelect: true` | header: `"Auth & Payments"`
- **🏢 Auth Providers** (Cat 14) — Clerk, Auth0, or NextAuth set up wrong
- **⏱️ Token & Session Lifetimes** (Cat 39) — sessions that expire too soon, never, or don't log out properly
- **💳 Stripe** (Cat 13) — secret keys exposed, webhooks not verified
- **🤖 AI APIs** (Cat 15) — prompt injection, jailbreaks, leaked keys, unsafe AI output, over-permissioned agents

**Q2** `multiSelect: true` | header: `"Data & Messaging"`
- **🗄️ Database** (Cat 17) — connection strings exposed, raw queries with user input
- **📦 Redis & Cache** (Cat 18) — credentials exposed, sensitive data stored unencrypted
- **📱 SMS** (Cat 19) — Twilio tokens exposed, webhooks not validated
- **📧 Email** (Cat 16) — SendGrid/Resend keys exposed, can be used to spam

**Q3** `multiSelect: true` | header: `"Compliance"`
- **🏥 HIPAA** (Cat 20) — patient data in logs, missing encryption, no audit trail
- **📋 SOC 2** (Cat 21) — no audit logs, weak passwords, sessions that never expire
- **💰 PCI-DSS** (Cat 22) — storing raw card numbers or CVVs, weak encryption
- **🇪🇺 GDPR** (Cat 23) — no way to delete or export user data

**Q4** `multiSelect: true` | header: `"Performance"`
- **💾 Memory Leaks** (Cat 24) — event listeners and timers that never get cleaned up
- **🔄 N+1 Queries** (Cat 25) — database calls inside loops that should be batched
- **🐢 Slow Code** (Cat 26) — blocking I/O, unbounded queries, heavy imports

---

#### Call 3 of 3 — Infrastructure, Supply Chain & Governance (Cats 27–47) + Scope

Call `AskUserQuestion` with 4 questions:

**Q1** `multiSelect: true` | header: `"Supply Chain"`
- **📦 Dependencies** (Cat 27) — known vulnerabilities in your npm packages
- **🔓 Authorization** (Cat 28) — users can access or edit other users' data
- **📎 File Uploads** (Cat 29) — no file type checks, dangerous filenames
- **🧩 Input Validation** (Cat 30) — path traversal, prototype pollution, regex denial-of-service
- **🔗 AI Tool Supply Chain** (Cat 41) — MCP servers, skills, plugins with exfiltration or injection risks

**Q2** `multiSelect: true` | header: `"Infrastructure"`
- **🔧 CI/CD Pipelines** (Cat 31) — secrets hardcoded in GitHub Actions or workflows
- **🛡️ Security Headers** (Cat 32) — missing CSP, HSTS, or clickjacking protection
- **🧹 Unused Packages** (Cat 33) — dead dependencies, deprecated libs, bundle bloat
- **🚇 Tunnels & DNS** (Cat 40) — ngrok/cloudflared credentials exposed, hardcoded resolvers, dev tunnels in production
- **🐳 Container & Docker** (Cat 42) — running as root, unpinned images, secrets in build args, missing healthchecks

**Q3** `multiSelect: true` | header: `"Governance & API"`
- **🔏 FIPS Crypto** (Cat 34) — non-compliant algorithms, weak TLS, small key sizes
- **🏛️ Certifications** (Cat 35) — ISO 27001, FedRAMP, CMMC control gaps
- **🔄 Disaster Recovery** (Cat 36) — no health checks, no graceful shutdown, no backups
- **🗂️ Data & Monitoring** (Cats 37+38) — no structured logging, no alerts, no data retention policy, PII not labeled
- **🌐 API Security** (Cat 43) — mass assignment, excessive data exposure, GraphQL introspection
- **🍪 Session Management & CSRF** (Cat 44) — insecure cookies, session fixation, missing expiration, CSRF token validation
- **🔌 WebSocket Security** (Cat 45) — missing WS auth, origin validation, message flooding
- **⚠️ Error Handling** (Cat 46) — empty catch blocks, fail-open auth, unhandled rejections
- **🔏 Software Integrity** (Cat 47) — missing SRI, unsigned webhooks, unsafe deserialization

**Q4** `multiSelect: false` | header: `"Scope"`
- **Entire codebase** scan all source files (Recommended)
- **Changed files only** restrict to files modified since last commit (`git diff HEAD --name-only`)

---

#### AskUserQuestion Behavior Rules

After all three calls (or fewer if Quick/Full shortcut used):

1. **Accumulate** all checked categories from every question across all calls into a single set
2. **Full System Scan shortcut** → overrides accumulated set; scan all 47
3. **Quick Scan shortcut** → run smart detection + merge any manually checked cats
4. **Nothing checked** after Call 3 → display: "Please select at least one category." Re-present Call 1
5. **Diff scope selected** → run `git diff HEAD --name-only`; restrict scan to those files only
6. **Other (free text)** on any question → parse as category numbers or names; add to the accumulated set

### Text Menu (Error Fallback Only)

**Only use this if the `AskUserQuestion` tool call returned a hard error.**
Do not use this as a default. The native UI is always preferred.

If `AskUserQuestion` is unavailable, display this menu instead:

```
╔════════════════════════════════════════════════════════════════════╗
║                   🔐 Security Audit for [project-name]           ║
╠════════════════════════════════════════════════════════════════════╣
║ What would you like to scan?                                      ║
╠════════════════════════════════════════════════════════════════════╣
║ [1] Quick Scan (Recommended)                                      ║
║     - SQL Injection, XSS, Hardcoded Secrets, Auth, SSRF           ║
║     - Smart detection selects 5-10 relevant categories             ║
║     - Fast, covers the most common issues                         ║
╠════════════════════════════════════════════════════════════════════╣
║ [2] Web Security                                                   ║
║     - SQL Injection, XSS, CORS, SSRF, Dangerous Patterns          ║
║     - Logging & Data Exposure                                      ║
║     - Focus on web application vulnerabilities                     ║
╠════════════════════════════════════════════════════════════════════╣
║ [3] Secrets & Authentication                                      ║
║     - Hardcoded Secrets, Authentication, Rate Limiting            ║
║     - Focus on credential and access control issues               ║
╠════════════════════════════════════════════════════════════════════╣
║ [4] Modern Stack                                                   ║
║     - Stripe, Auth Providers, AI APIs, Email, Twilio              ║
║     - Database, Redis, Supabase, Cloud Security                   ║
║     - Focus on modern service integrations                        ║
╠════════════════════════════════════════════════════════════════════╣
║ [5] Compliance (HIPAA/SOC2/PCI/GDPR)                              ║
║     - HIPAA, SOC 2, PCI-DSS, GDPR                                  ║
║     - Regulatory compliance requirements                           ║
╠════════════════════════════════════════════════════════════════════╣
║ [6] Performance                                                    ║
║     - Memory Leaks, N+1 Queries, Performance Problems             ║
║     - Focus on runtime performance and efficiency                  ║
╠════════════════════════════════════════════════════════════════════╣
║ [7] Infrastructure & Supply Chain                                  ║
║     - Dependencies (CVE/0-day audit), Authorization/IDOR          ║
║     - File Uploads, Input Validation, CI/CD Security              ║
║     - Security Headers, Unused Dependencies & Bloat               ║
║     - Focus on infrastructure and supply chain risks               ║
╠════════════════════════════════════════════════════════════════════╣
║ [8] Full System Scan                                              ║
║     - All 47 categories                                           ║
║     - Comprehensive but uses more tokens                          ║
╠════════════════════════════════════════════════════════════════════╣
║ [9] Governance & Compliance (Extended)                             ║
║     - FIPS 140-3, Governance Certs, BC/DR, Monitoring             ║
║     - Data Classification & Lifecycle, Token Lifetimes             ║
║     - Focus on regulatory and operational resilience               ║
╠════════════════════════════════════════════════════════════════════╣
║ [10] Custom Selection                                              ║
║      - Pick specific categories individually                       ║
║      - Select by name or number                                    ║
╠════════════════════════════════════════════════════════════════════╣
║ [11] Scan Changed Files Only (--diff)                              ║
║      - Run Git diff and scan only modified files                   ║
║      - Good for pre-commit checks                                 ║
╠════════════════════════════════════════════════════════════════════╣
║ [0] Exit                                                           ║
╠════════════════════════════════════════════════════════════════════╣
║ Enter your choice (0-11):                                          ║
╚════════════════════════════════════════════════════════════════════╝
```

### Text Menu Behavior Rules

*(These apply when `AskUserQuestion` is unavailable and the text fallback menu is shown.)*

#### If User Enters 0 (Exit)
- Display: "Security audit cancelled. No changes made."
- Exit the skill without scanning

#### If User Enters 1 (Quick Scan)
- Detect tech stack from package.json (or equivalent)
- Select 5-10 relevant categories based on dependencies
- Always include: Categories 1, 2, 3, 4 (SQLi, XSS, Secrets, Auth)
- Add relevant categories based on detected dependencies
- Display: "Quick Scan selected. Scanning X categories..."
- Proceed with scan

#### If User Enters 2-9 (Presets)
- Scan the predefined category groups (see mapping below)
- Display: "Web Security scan selected. Scanning Y categories..."
- Proceed with scan

#### If User Enters 10 (Custom Selection)
- Present category selection menu (see below)
- Accept both category numbers AND names
- Display: "Custom scan selected. Scanning Z categories..."
- Proceed with scan

#### If User Enters 11 (Diff Mode)
- Run `git diff HEAD --name-only` to get changed files
- Scan only changed files + their dependencies
- Display: "Diff scan selected. Scanning changed files..."
- Proceed with scan

#### If User Enters Invalid Input
- Display: "Invalid choice. Please enter 0-11."
- Re-display menu

#### If Arguments Provided (Skip Menu)
- If user runs with arguments (e.g., `/securitybridge --categories=1,2,3`):
- SKIP the interactive menu entirely
- Use the provided arguments to determine what to scan
- Proceed directly to execution

---

### Category Group Mappings

#### Group 2: Web Security
Categories: 1, 2, 5, 8, 10, 12, 43, 44, 45
- SQL Injection (1)
- Cross-Site Scripting (2)
- SSRF (5)
- CORS Configuration (8)
- Dangerous Code Patterns (10)
- Logging & Data Exposure (12)
- API Security (43)
- Session Management & CSRF (44)
- WebSocket Security (45)

#### Group 3: Secrets & Authentication
Categories: 3, 4, 7, 39
- Hardcoded Secrets (3)
- Authentication Issues (4)
- Rate Limiting (7)
- Token & Session Lifetimes (39)

#### Group 4: Modern Stack
Categories: 6, 11, 13, 14, 15, 16, 17, 18, 19, 39, 41
- Supabase Security (6)
- Cloud Security (11)
- Stripe Security (13)
- Auth Providers (14)
- AI API Security (15)
- Email Services (16)
- Database Security (17)
- Redis/Cache Security (18)
- SMS/Communication (19)
- Token & Session Lifetimes (39)
- AI Tool Supply Chain (41)

#### Group 5: Compliance
Categories: 20, 21, 22, 23
- HIPAA (20)
- SOC 2 (21)
- PCI-DSS (22)
- GDPR (23)

#### Group 6: Performance
Categories: 24, 25, 26
- Memory Leaks (24)
- N+1 Queries (25)
- Performance Problems (26)

#### Group 7: Infrastructure & Supply Chain
Categories: 27, 28, 29, 30, 31, 32, 33, 40, 41, 42, 43, 44, 45, 46, 47
- Dependency Vulnerabilities (27)
- Authorization & Access Control (28)
- File Upload Security (29)
- Input Validation & ReDoS (30)
- CI/CD Pipeline Security (31)
- Security Headers (32)
- Unused Dependencies & Bloat (33)
- Tunnels & DNS Security (40)
- AI Tool Supply Chain (41)
- Container & Docker Security (42)
- API Security (43)
- Session Management (44)
- WebSocket Security (45)
- Error Handling & Fail-Safe Defaults (46)
- Software & Data Integrity (47)

#### Group 8: Full System Scan (47 categories)
Categories: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47

#### Group 9: Governance & Compliance (Extended)
Categories: 34, 35, 36, 37, 38
- FIPS 140-3 / Cryptographic Compliance (34)
- Security Governance Certifications (35)
- Business Continuity & Disaster Recovery (36)
- Infrastructure Monitoring & Observability (37)
- Data Classification & Lifecycle (38)

---

### Smart Detection Logic (Quick Scan - Option 1)

Quick Scan always includes: Categories 1, 2, 3, 4

Then adds categories based on detected dependencies:

#### Detection Method
1. Read `package.json` (or equivalent for other languages)
2. Parse dependencies and devDependencies
3. Check for security-relevant packages

#### Dependency → Category Mapping

**Always Add:**
- Category 1 (SQL Injection) - if any database package found
- Category 2 (XSS) - if any frontend framework found
- Category 3 (Hardcoded Secrets) - always
- Category 4 (Authentication) - if any auth package found
- Category 12 (Logging and Data Exposure) - always (any project can log sensitive data)

**Conditional Adds:**

Found `stripe` or `@stripe/stripe-js`:
- Add Category 13 (Stripe Security)

Found `@supabase/supabase-js` or `@supabase/ssr`:
- Add Category 6 (Supabase Security)

Found `openai`, `@anthropic-ai/sdk`, `ai`, `@ai-sdk/openai`, `@langchain/core`, `langchain`, `@google/generative-ai`, `cohere-ai`, `@modelcontextprotocol/sdk`, or `llamaindex`:
- Add Category 15 (AI API Security)

Found `resend`, `@sendgrid/mail`, or `postmark`:
- Add Category 16 (Email Services)

Found `@upstash/redis`, `ioredis`, or `redis`:
- Add Category 18 (Redis/Cache Security)

Found `twilio`:
- Add Category 19 (SMS/Communication)

Found `@clerk/nextjs`, `@auth0/nextjs-auth0`, or `next-auth`:
- Add Category 14 (Auth Providers)

Found `@aws-sdk/*`, `@google-cloud/*`, or `@azure/*`:
- Add Category 11 (Cloud Security)

Found `pg`, `mysql2`, `@prisma/client`, or `drizzle-orm`:
- Add Category 17 (Database Security)

Found `fetch`, `axios`, `got`, or `node-fetch`:
- Add Category 5 (SSRF)

Found any auth package (`jsonwebtoken`, `passport`, `next-auth`, `@clerk/nextjs`, `@auth0/nextjs-auth0`, `better-auth`, `express-session`):
- Add Category 7 (Rate Limiting)

Found any auth/session/JWT package (`jsonwebtoken`, `jose`, `next-auth`, `@auth/core`, `better-auth`, `@clerk/nextjs`, `@auth0/nextjs-auth0`, `express-session`, `iron-session`, `lucia`):
- Add Category 39 (Token & Session Lifetime Analysis)

Found `cors` package:
- Add Category 8 (CORS Configuration)

Found Keywords: `patient`, `medical`, `diagnosis`, `prescription`, `mrn`, `phi`:
- Add Category 20 (HIPAA)

Found Keywords: `audit`, `logging`, `compliance`, `mfa`:
- Add Category 21 (SOC 2)

Found Keywords: `card`, `payment`, `stripe`, `cvv`, `pan`:
- Add Category 22 (PCI-DSS)

Found Keywords: `consent`, `gdpr`, `data-export`, `data-delete`:
- Add Category 23 (GDPR)

Found Keywords: `fips`, `fips140`, `nist`, `cipher`, `tls_min`, `openssl`:
- Add Category 34 (FIPS / Cryptographic Compliance)

Found Keywords: `iso27001`, `fedramp`, `cmmc`, `govcloud`, `cui`, `nist800`, `ato`:
- Add Category 35 (Governance Certifications)

Found any React/Vue/Angular framework or any database package (`@prisma/client`, `drizzle-orm`, `pg`, `mysql2`, `mongoose`):
- Add Category 24 (Memory Leaks)

Found any ORM (`@prisma/client`, `drizzle-orm`, `typeorm`, `sequelize`, `mongoose`):
- Add Category 25 (N+1 Queries)

Found any web framework/ORM (`next`, `express`, `fastify`, `@prisma/client`, `drizzle-orm`) or `lodash` or `moment`:
- Add Category 26 (Performance Problems)

**Always Add:**
- Category 27 (Dependency Vulnerabilities) - applies to every project with a package manifest
- Category 33 (Unused Dependencies & Bloat) - applies to every project with a package manifest

Found any auth/database/API route package (`next-auth`, `@clerk/nextjs`, `@auth0/nextjs-auth0`, `@prisma/client`, `drizzle-orm`, `express`, `fastify`):
- Add Category 28 (Authorization & Access Control / IDOR)

Found `multer`, `formidable`, `busboy`, or `@uploadthing/*`:
- Add Category 29 (File Upload Security)

Found any web framework (`next`, `express`, `fastify`, `koa`, `hono`):
- Add Category 30 (Input Validation & ReDoS)

Found `.github/workflows` directory exists:
- Add Category 31 (CI/CD Pipeline Security)

Found any web framework (`next`, `express`, `fastify`):
- Add Category 32 (Security Headers)

Found `opossum`, `cockatiel`, or patterns matching circuit breaker / retry / graceful shutdown:
- Add Category 36 (Business Continuity & Disaster Recovery)

Found `@sentry/node`, `@datadog/datadog-api-client`, `newrelic`, `prom-client`, `@opentelemetry/*`, `dd-trace`, `@grafana/*`:
- Add Category 37 (Infrastructure Monitoring & Observability)

Found `cron`, `node-cron`, `@upstash/qstash` with data cleanup patterns, or `ttl`, `retention`, `purge`, `anonymize` keywords:
- Add Category 38 (Data Classification & Lifecycle)

Found `ngrok`, `.ngrok2/`, `.ngrok/`, `NGROK_AUTHTOKEN` in env/config, or `cloudflared`, `.cloudflared/`, `TUNNEL_TOKEN`, `trycloudflare.com` URLs:
- Add Category 40 (Tunnels & DNS Security)

Found `wrangler.toml`, `wrangler.jsonc`, `.dev.vars`, `miniflare`, `CLOUDFLARE_API_TOKEN`, `CF_API_TOKEN`:
- Add Category 40 (Tunnels & DNS Security)

Found `.cursor/mcp.json`, `claude_desktop_config.json`, `mcp.json`, `.claude/agents/`, `.claude/skills/`, `ai-plugin.json`, `.well-known/ai-plugin.json`, or `@modelcontextprotocol/sdk`:
- Add Category 41 (AI Tool Supply Chain)

Found `Dockerfile`, `docker-compose.yml`, `compose.yml`, `.dockerignore`, or `skaffold.yaml`:
- Add Category 42 (Container & Docker Security)

Found `graphql`, `@apollo/server`, `apollo-server`, `type-graphql`, `nexus`, `pothos`, `graphql-yoga`, `mercurius`, or `@trpc/server`:
- Add Category 43 (API Security)

Found `express-session`, `iron-session`, `connect-redis`, `connect-mongo`, `connect-pg-simple`, `lucia`, `csurf`, `csrf-csrf`, `lusca`, or cookie-based session patterns:
- Add Category 44 (Session Management & CSRF)

Found `ws`, `socket.io`, `@socket.io/`, `uWebSockets.js`, `engine.io`, `pusher`, `ably`, or `@supabase/realtime-js`:
- Add Category 45 (WebSocket Security)



Found any web framework, or any `try`, `catch`, `async` patterns in route handlers (applies to all projects with HTTP endpoints):
- Add Category 46 (Error Handling & Fail-Safe Defaults)

Found external `<script src="https://` tags in HTML/JSX, or webhook endpoints, or `yaml.load`, `pickle`, `JSON.parse` on untrusted input, or `Dockerfile`:
- Add Category 47 (Software & Data Integrity)

#### Example Output

```
Quick Scan selected.
Detected tech stack: Next.js, Prisma, Stripe, Supabase
Selected categories: 1, 2, 3, 4, 6, 13, 17 (7 categories)
Starting scan...
```

---

### Custom Selection Menu (Option 9)

When user selects Option 9, present this menu:

```
══════════════════════════════════════════════════════════════════════
                   Select Categories to Scan
══════════════════════════════════════════════════════════════════════

Core Security
  [ 1] SQL Injection (1)              [ 2] XSS (2)
  [ 3] Hardcoded Secrets (3)          [ 4] Authentication (4)
  [ 5] SSRF (5)                       [ 6] Supabase (6)
  [ 7] Rate Limiting (7)              [ 8] CORS (8)
  [ 9] Cryptography (9)              [10] Dangerous Patterns (10)
  [11] Cloud Security (11)            [12] Data Exposure (12)

Modern Stack
  [13] Stripe (13)                   [14] Auth Providers (14)
  [15] AI APIs (15)                  [16] Email Services (16)
  [17] Database (17)                 [18] Redis/Cache (18)
  [19] SMS/Communication (19)

Compliance
  [20] HIPAA (20)                    [21] SOC 2 (21)
  [22] PCI-DSS (22)                  [23] GDPR (23)

Performance
  [24] Memory Leaks (24)             [25] N+1 Queries (25)
  [26] Performance (26)

Infrastructure & Supply Chain
  [27] Dependencies (27)             [28] Authorization/IDOR (28)
  [29] File Uploads (29)             [30] Input Validation (30)
  [31] CI/CD Security (31)           [32] Security Headers (32)
  [33] Unused Dependencies (33)      [40] Tunnels & DNS (40)

Governance & Compliance (Extended)
  [34] FIPS 140-3 (34)               [35] Gov Certifications (35)
  [36] BC/DR (36)                    [37] Monitoring (37)
  [38] Data Classification (38)      [39] Token Lifetimes (39)

Advanced
  [41] AI Supply Chain (41)          [42] Container/Docker (42)
  [43] API Security (43)            [44] Session & CSRF (44)
  [45] WebSocket Security (45)
  [46] Error Handling (46)          [47] Software Integrity (47)


══════════════════════════════════════════════════════════════════════

Enter selection by NUMBER or NAME, separated by spaces:

Examples:
  - By number: "1 3 5 13"
  - By name: "sql injection secrets auth stripe"
  - Mixed: "1 secrets auth 13"

Your selection:
```

#### Custom Selection Processing

**Parse Input:**
- Split input by spaces
- For each item, check if it's a number or name
- Map names to category numbers (case-insensitive, partial match)
- Remove duplicates
- Validate all categories are in range 1-47

**Examples:**

Input: `"1 3 5 13"`
→ Selected: 1, 3, 5, 13

Input: `"sql injection secrets auth stripe"`
→ Parsed: "sql injection" → 1, "secrets" → 3, "auth" → 4, "stripe" → 13
→ Selected: 1, 3, 4, 13

Input: `"1 secrets auth 13"`
→ Parsed: 1, "secrets" → 3, "auth" → 4, 13
→ Selected: 1, 3, 4, 13

Input: `"1 1 3 3"`
→ Deduplicated: 1, 3
→ Selected: 1, 3

Input: `"99 xyz"`
→ Invalid categories detected
→ Display: "Invalid categories: 99, xyz. Please enter 1-47 or valid names."
→ Re-display menu

#### Name to Category Mapping

Support flexible matching:

```
"sql" or "sql injection" → 1
"xss" or "cross-site scripting" → 2
"secrets" or "hardcoded secrets" → 3
"auth" or "authentication" → 4
"ssrf" or "server-side request forgery" → 5
"supabase" → 6
"rate" or "rate limiting" → 7
"cors" → 8
"crypto" or "cryptography" → 9
"dangerous" or "dangerous patterns" → 10
"cloud" → 11
"logging" or "data exposure" → 12
"stripe" → 13
"providers" or "auth providers" → 14
"ai" or "ai apis" → 15
"email" → 16
"database" or "db" → 17
"redis" or "cache" → 18
"sms" or "twilio" or "communication" → 19
"hipaa" → 20
"soc" or "soc2" → 21
"pci" or "pcidss" → 22
"gdpr" → 23
"memory" or "memory leaks" → 24
"n+1" or "n1" or "n plus 1" → 25
"performance" or "perf" → 26
"dependencies" or "supply chain" or "deps" → 27
"authorization" or "idor" or "access control" → 28
"upload" or "file upload" → 29
"input" or "validation" or "redos" → 30
"cicd" or "ci/cd" or "pipeline" or "github actions" → 31
"headers" or "csp" or "security headers" → 32
"unused" or "bloat" or "unused dependencies" or "dead packages" → 33
"fips" or "fips140" or "fips 140" or "cryptographic compliance" → 34
"iso" or "iso27001" or "fedramp" or "cmmc" or "governance" or "nist" → 35
"bcdr" or "bc/dr" or "business continuity" or "disaster recovery" or "circuit breaker" → 36
"monitoring" or "observability" or "apm" or "tracing" or "alerting" → 37
"data classification" or "data lifecycle" or "retention" or "pii" or "data labeling" → 38
"token" or "token lifetime" or "session lifetime" or "token expiry" or "refresh token" or "session timeout" → 39
"tunnel" or "ngrok" or "cloudflared" or "cloudflare tunnel" or "wrangler" or "miniflare" or "dns resolver" or "dns security" → 40
"ai supply chain" or "mcp" or "mcp server" or "plugin" or "skill" or "tool supply chain" or "agent supply chain" → 41
"container" or "docker" or "dockerfile" or "docker-compose" or "compose" or "k8s" or "kubernetes" → 42
"api" or "api security" or "graphql" or "mass assignment" or "rest" or "rest api" or "data exposure" → 43
"session" or "session management" or "cookie" or "session fixation" or "cookie security" or "csrf" or "cross-site request forgery" or "xsrf" → 44
"websocket" or "ws" or "socket" or "socket.io" or "real-time" or "realtime" → 45
"error handling" or "fail-safe" or "fail-open" or "catch" or "error boundary" or "unhandled rejection" → 46
"integrity" or "sri" or "subresource integrity" or "webhook signature" or "deserialization" or "lockfile" or "toctou" → 47
```

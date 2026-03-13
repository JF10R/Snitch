## CATEGORY 47: Software & Data Integrity

> **OWASP references:** A08:2025 Software and Data Integrity Failures (CWE-494 Download of Code Without Integrity Check, CWE-502 Deserialization of Untrusted Data, CWE-829 Inclusion of Functionality from Untrusted Control Sphere).
>
> **Cross-reference:** Category 31 (CI/CD Security) covers pipeline integrity. Category 27 (Dependencies) covers known CVEs. This category focuses on runtime integrity: subresource integrity (SRI), unsigned code/webhooks, lockfile enforcement, unsafe deserialization, and TOCTOU file operations. Category 10 (Dangerous Patterns) covers unsafe deserialization as code execution. This category focuses on deserialization in the integrity/supply-chain context.

### Detection
- CDN script tags: `<script src="https://`, `<link href="https://` (external resources)
- Webhook handlers: `webhook`, `hook`, `/api/webhook`, `verify`, `signature`
- Deserialization: `JSON.parse`, `yaml.load`, `pickle.loads`, `unserialize`, `ObjectInputStream`
- Package install patterns: `npm install`, `pip install`, `go get` in CI/production scripts
- File operations: `fs.readFile` + `fs.writeFile`, `open()` + `write()`, `os.rename`
- Auto-update mechanisms: `update`, `auto-update`, `self-update`, `upgrade`

### What to Search For

**Missing Subresource Integrity (SRI):**
- `<script src="https://...">` without `integrity` attribute (CDN scripts can be tampered with)
- `<link rel="stylesheet" href="https://...">` without `integrity` attribute
- Dynamically loaded external scripts (`document.createElement('script')`) without integrity verification
- External resources loaded from third-party CDNs (cdnjs, unpkg, jsdelivr) without SRI hashes

**Unsigned or unverified webhooks:**
> **Scope note:** Category 13 (Stripe) covers Stripe-specific webhook verification. This section covers generic webhook patterns (GitHub, Svix, custom HMAC).
- Webhook endpoints that process payloads without verifying a signature header
- Missing `X-Hub-Signature-256` (GitHub), `Stripe-Signature`, `Svix-Signature` verification
- Webhook signature verification using timing-unsafe comparison (`===` instead of `timingSafeEqual`)
- Webhook handlers that trust the payload body without checking HMAC
- Webhook secret hardcoded instead of from environment variable

**Lockfile integrity:**
- `npm install` (without `--frozen-lockfile` or `ci`) in production/CI Dockerfiles or scripts
- `pip install -r requirements.txt` without hash checking (`--require-hashes`)
- Missing lockfile (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`) in repository
- `go install` without version pinning in CI scripts
- Lockfile present but not committed to git (in `.gitignore`)

**Unsafe deserialization:**
- `yaml.load()` (Python) without `Loader=SafeLoader` — allows arbitrary code execution
- `pickle.loads()` or `pickle.load()` on untrusted input — arbitrary code execution
- `JSON.parse()` on untrusted input used to reconstruct objects with prototype chains
- `unserialize()` (PHP) on user-controlled data
- Custom deserialization that instantiates classes based on type fields from untrusted input
- `ObjectInputStream` (Java) on untrusted data without input filtering

**TOCTOU (Time-of-Check-Time-of-Use) in file operations:**
- Checking file existence/permissions then performing operations in separate steps
- `fs.existsSync(path)` followed by `fs.readFileSync(path)` (file can change between calls)
- `os.path.exists(path)` followed by `open(path)` without atomic operation
- `fs.access()` followed by `fs.readFile()` in async code (race condition window)
- File permission check then file open without using `O_NOFOLLOW` or equivalent (symlink attack)

**Auto-update without signature verification:**
- Application self-update mechanisms that download and execute code without verifying signatures
- Plugin/extension installation from URLs without integrity verification
- Dynamic code loading (`import()`, `require()`) from user-controlled or remote paths
- Configuration files fetched from remote URLs and applied without validation

### Critical
- `yaml.load()` (Python) on untrusted input without `SafeLoader` — arbitrary code execution
- `pickle.loads()` on user-supplied or network-received data — arbitrary code execution
- Webhook endpoint processing payments/auth without any signature verification
- Auto-update mechanism that downloads and executes code without signature verification

### High
- External CDN scripts (`<script src="https://...">`) without `integrity` attribute in production HTML
- `npm install` (not `npm ci`) in production Dockerfile or CI pipeline
- Webhook signature verification using `===` instead of `crypto.timingSafeEqual`
- `JSON.parse()` on untrusted input used to merge into objects (prototype pollution vector)
- Missing lockfile in repository (dependency versions not pinned)
- Custom deserialization that instantiates classes based on untrusted type discriminators

### Medium
- External CSS loaded from CDN without `integrity` attribute
- TOCTOU: file existence check followed by separate file read/write operation
- `pip install` without `--require-hashes` in production deployment
- Webhook handler that logs unverified payloads (log injection risk)
- Lockfile present but listed in `.gitignore` (not committed)
- Dynamically created `<script>` elements loading external URLs without integrity check

### Context Check
1. Are external scripts and stylesheets loaded with `integrity` and `crossorigin` attributes?
2. Do webhook endpoints verify signature headers before processing payloads?
3. Is `npm ci` (or equivalent frozen install) used in CI/CD and production, not `npm install`?
4. Is there a lockfile committed to the repository?
5. Are deserialization functions called on untrusted input? Is a safe loader/allowlist used?
6. Are file operations atomic, or do they have TOCTOU gaps?
7. Do auto-update or plugin mechanisms verify code signatures before execution?

### NOT Vulnerable
- All external scripts and stylesheets include `integrity="sha384-..."` and `crossorigin="anonymous"`
- Webhook signature verified using `crypto.timingSafeEqual` or framework-provided verifier
- `npm ci` / `yarn install --frozen-lockfile` / `pnpm install --frozen-lockfile` used in CI and Docker
- Lockfile committed and kept up to date
- Python YAML loaded with `yaml.safe_load()` or `Loader=SafeLoader`
- No `pickle` on untrusted data; using `json` or `msgpack` with schema validation instead
- File operations use atomic patterns (write-to-temp-then-rename, `O_EXCL` flags)
- Auto-update mechanisms verify GPG/code signatures before applying updates
- `JSON.parse()` results validated with a schema (Zod, Joi, ajv) before use

### Files to Check
- `**/*.html`, `**/index.html`, `**/layout.{tsx,jsx}`, `**/document.{tsx,jsx}` (script/link tags)
- `**/webhook*.{ts,js,py}`, `**/hook*.{ts,js,py}`, `**/api/webhook*`
- `Dockerfile*`, `docker-compose*.yml`, `.github/workflows/*.yml` (install commands)
- `**/deserializ*.{ts,js,py}`, `**/parse*.{ts,js,py}`, `**/load*.{py}`
- `**/file*.{ts,js,py}`, `**/upload*.{ts,js,py}`, `**/fs*.{ts,js}`
- `**/update*.{ts,js,py}`, `**/plugin*.{ts,js,py}`
- `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml` (check if committed)

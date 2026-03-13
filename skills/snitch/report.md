# Report Format & Standards Reference

This file is loaded by SKILL.md at STEP 3 (Generate Report). It defines the standards mapping tables, report template, and optional SARIF output format.

---

## STANDARDS REFERENCE

Tag each finding with the applicable CWE, OWASP Top 10:2025 category, and approximate CVSS 4.0 score. Use the tables below. Non-security categories (24–26) have no standards mapping — omit tags for those.

### OWASP Top 10:2025 + CWE Mapping

| Cat | Name | OWASP Top 10:2025 | Primary CWE |
|-----|------|--------------------|-------------|
| 1 | SQL Injection | A05 Injection | CWE-89 |
| 2 | XSS | A05 Injection | CWE-79 |
| 3 | Hardcoded Secrets | A07 Authentication Failures | CWE-798 |
| 4 | Auth & Login | A07 Authentication Failures | CWE-287 |
| 5 | SSRF | A10 Server-Side Request Forgery | CWE-918 |
| 6 | Supabase | A01 Broken Access Control | CWE-862 |
| 7 | Rate Limiting | A04 Insecure Design | CWE-770 |
| 8 | CORS | A05 Injection | CWE-346 |
| 9 | Crypto | A04 Cryptographic Failures | CWE-327 |
| 10 | Dangerous Patterns | A05 Injection | CWE-94 |
| 11 | Cloud | A02 Security Misconfiguration | CWE-16 |
| 12 | Data Leaks | A09 Security Logging and Alerting Failures | CWE-532 |
| 13 | Stripe | A07 Authentication Failures | CWE-798 |
| 14 | Auth Providers | A07 Authentication Failures | CWE-287 |
| 15 | AI APIs | A07 Authentication Failures | CWE-798 |
| 16 | Email | A07 Authentication Failures | CWE-798 |
| 17 | Database | A05 Injection | CWE-89 |
| 18 | Redis & Cache | A04 Cryptographic Failures | CWE-312 |
| 19 | SMS (Twilio) | A07 Authentication Failures | CWE-798 |
| 20 | HIPAA | A02 Security Misconfiguration | CWE-200 |
| 21 | SOC 2 | A09 Security Logging and Alerting Failures | CWE-778 |
| 22 | PCI-DSS | A04 Cryptographic Failures | CWE-311 |
| 23 | GDPR | A01 Broken Access Control | CWE-359 |
| 24 | Memory Leaks | N/A | N/A |
| 25 | N+1 Queries | N/A | N/A |
| 26 | Performance | N/A | N/A |
| 27 | Dependencies | A03 Software Supply Chain Failures | CWE-1395 |
| 28 | Authorization (IDOR) | A01 Broken Access Control | CWE-639 |
| 29 | File Uploads | A04 Insecure Design | CWE-434 |
| 30 | Input Validation | A05 Injection | CWE-20 |
| 31 | CI/CD Security | A02 Security Misconfiguration | CWE-200 |
| 32 | Security Headers | A02 Security Misconfiguration | CWE-693 |
| 33 | Unused Dependencies | A03 Software Supply Chain Failures | CWE-1104 |
| 34 | FIPS 140-3 | A04 Cryptographic Failures | CWE-327 |
| 35 | Governance Certs | A02 Security Misconfiguration | CWE-693 |
| 36 | BC/DR | A02 Security Misconfiguration | CWE-636 |
| 37 | Monitoring | A09 Security Logging and Alerting Failures | CWE-778 |
| 38 | Data Classification | A01 Broken Access Control | CWE-200 |
| 39 | Token Lifetimes | A07 Authentication Failures | CWE-613 |
| 40 | Tunnels & DNS | A02 Security Misconfiguration | CWE-200 |
| 41 | AI Tool Supply Chain | A03 Software Supply Chain Failures | CWE-1395 |
| 42 | Container & Docker | A02 Security Misconfiguration | CWE-16 |
| 43 | API Security | A01 Broken Access Control | CWE-284 |
| 44 | Session Management & CSRF | A07 Authentication Failures | CWE-384 |
| 45 | WebSocket Security | A01 Broken Access Control | CWE-284 |
| 46 | Error Handling | A10 Mishandling of Exceptional Conditions | CWE-755 |
| 47 | Software & Data Integrity | A08 Software/Data Integrity Failures | CWE-494 |

### CVSS 4.0 Severity Alignment

| Severity | CVSS 4.0 Range | Example |
|----------|---------------|---------|
| Critical | 9.0 – 10.0 | RCE, auth bypass, mass data leak |
| High | 7.0 – 8.9 | SQLi, stored XSS, SSRF to internal |
| Medium | 4.0 – 6.9 | Reflected XSS, CORS miscfg, missing headers |
| Low | 0.1 – 3.9 | Info disclosure, verbose errors |

---

## FINAL REPORT FORMAT

```markdown
# Security Audit Report

## Summary
- **Overall Risk:** [Critical/High/Medium/Low]
- **Findings:** X Critical, X High, X Medium, X Low
- **Standards:** CWE Top 25 (2025), OWASP Top 10 (2025), CVSS 4.0

## Critical Findings

### 1. [Title]
- **Severity:** [Critical/High/Medium/Low] | CVSS 4.0: ~[score]
- **CWE:** CWE-[id] ([name])
- **OWASP:** A[nn]:2025 [category name]
- **File:** path/to/file.js:47
- **Evidence:** [exact code from file, secrets replaced with X's]
- **Risk:** [What could happen]
- **Fix:** [Specific remediation]

## Passed Checks
- [ ] No SQL injection found (Category 1)
- [ ] Proper password hashing (Category 9)
- [ ] RLS enabled on all Supabase tables (Category 6)
- [ ] Stripe webhook signatures verified (Category 13)
- [ ] AI API keys server-only, prompts sanitized, output treated as untrusted, agents least-privilege (Category 15 - AI API Security)
- [ ] Database connections use parameterized queries (Category 17)
- [ ] PHI encrypted at rest (Category 20 - HIPAA)
- [ ] Audit logging on sensitive routes (Category 21 - SOC 2)
- [ ] No raw card data stored (Category 22 - PCI-DSS)
- [ ] Data deletion endpoints exist (Category 23 - GDPR)
- [ ] Event listeners properly cleaned up (Category 24 - Memory Leaks)
- [ ] No database queries inside loops (Category 25 - N+1 Queries)
- [ ] No synchronous file I/O in request handlers (Category 26 - Performance)
- [ ] Lockfile present and committed (Category 27 - Dependencies)
- [ ] Resource ownership verified on all endpoints (Category 28 - Authorization)
- [ ] File uploads validated and sanitized (Category 29 - File Uploads)
- [ ] Input validation with schema library (Category 30 - Input Validation)
- [ ] CI/CD secrets use proper references (Category 31 - CI/CD Security)
- [ ] Security headers configured (Category 32 - Security Headers)
- [ ] No unused or bloated dependencies found (Category 33 - Unused Dependencies)
- [ ] FIPS-approved algorithms and key sizes in use (Category 34 - FIPS 140-3)
- [ ] Governance certification controls implemented (Category 35 - ISO 27001/FedRAMP/CMMC)
- [ ] Health checks, graceful shutdown, and circuit breakers in place (Category 36 - BC/DR)
- [ ] APM, structured logging, and alerting configured (Category 37 - Monitoring)
- [ ] Data classification, retention, and deletion lifecycle defined (Category 38 - Data Classification)
- [ ] Token lifetimes appropriate for app type, refresh flow implemented, logout invalidates tokens (Category 39 - Token Lifetimes)
- [ ] No tunnel credentials in git, no dev tunnels in production, DNS resolvers configurable (Category 40 - Tunnels & DNS)
- [ ] MCP servers version-pinned, tools least-privilege, no exfiltration vectors (Category 41 - AI Tool Supply Chain)
- [ ] Containers run as non-root, images pinned, no secrets in layers, healthchecks present (Category 42 - Container & Docker)
- [ ] API inputs validated, fields allow-listed, GraphQL introspection disabled in production (Category 43 - API Security)
- [ ] Session cookies secure (HttpOnly, Secure, SameSite), sessions regenerated on login, server-side expiration, CSRF tokens validated on state-changing endpoints (Category 44 - Session Management & CSRF)
- [ ] WebSocket connections authenticated, origin validated, messages schema-validated, rate-limited (Category 45 - WebSocket Security)
- [ ] Error handling fail-closed in auth/security paths, no empty catch blocks in critical flows, error boundaries in place (Category 46 - Error Handling)
- [ ] External scripts have SRI hashes, webhooks signatures verified, lockfile committed, no unsafe deserialization (Category 47 - Software Integrity)

## Compound Risks

_Combinations of findings that create elevated risk when present together:_

<!-- Only include combinations where BOTH sides were actually found in this audit -->
<!-- Example combinations to check for: -->
<!-- - Hardcoded secret (Cat 3) + no rate limiting (Cat 7) + no monitoring (Cat 37) = "undetectable key abuse" -->
<!-- - Missing auth (Cat 28) + IDOR (Cat 28) + no logging (Cat 12) = "silent data exfiltration path" -->
<!-- - Prompt injection risk (Cat 15) + excessive agency (Cat 41) + no human approval = "autonomous agent compromise" -->
<!-- - Missing CSRF + session fixation (Cat 44) = "session-riding attack chain" -->
<!-- - Fail-open auth error (Cat 46) + missing monitoring (Cat 37) = "silent auth bypass" -->
<!-- - No SRI (Cat 47) + XSS vectors (Cat 2) = "supply-chain-assisted XSS" -->
```

**IMPORTANT:** When reporting findings involving secrets, ALWAYS redact the actual values:
- `sk_live_abc123` → `sk_live_XXXXXX`
- `password: "secret123"` → `password: "XXXXXXXX"`
- `postgresql://user:pass@host` → `postgresql://user:XXXX@host`

---

## SARIF OUTPUT (Optional)

When the user requests SARIF output, or when generating the audit report, also offer to save findings as `SECURITY_AUDIT_REPORT.sarif.json` for integration with GitHub Security tab, VS Code SARIF Viewer, or CI/CD pipelines.

Use this template — populate `results[]` from findings:

```json
{
  "$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/main/sarif-2.1/schema/sarif-schema-2.1.0.json",
  "version": "2.1.0",
  "runs": [{
    "tool": {
      "driver": {
        "name": "Snitch",
        "version": "5.2.0",
        "informationUri": "https://github.com/JF10R/Snitch",
        "rules": []
      }
    },
    "results": []
  }]
}
```

Each finding maps to a SARIF result:
- `ruleId` → category number + CWE (e.g., `snitch/01-sql-injection/CWE-89`)
- `level` → `error` (Critical/High), `warning` (Medium), `note` (Low)
- `message.text` → finding title + risk description
- `locations[0].physicalLocation.artifactLocation.uri` → file path
- `locations[0].physicalLocation.region.startLine` → line number
- `properties.confidence` → High/Medium/Low
- `properties.owasp` → OWASP Top 10 category

Each rule in `rules[]`:
- `id` → same as `ruleId`
- `shortDescription.text` → category name
- `helpUri` → OWASP/CWE reference URL
- `properties.tags` → `["security", "CWE-XXX", "OWASP-ANN"]`

---

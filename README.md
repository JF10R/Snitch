```
   _____ _   ____________________  __
  / ___// | / /  _/_  __/ ____/ / / /
  \__ \/  |/ // /  / / / /   / /_/ /
 ___/ / /|  // /  / / / /___/ __  /
/____/_/ |_/___/ /_/  \____/_/ /_/
```

Evidence-based security auditing for AI coding assistants. Zero false positives.

Compatible with [Claude Code](https://docs.anthropic.com/en/docs/claude-code) · [Gemini CLI](https://github.com/google-gemini/gemini-cli) · [Codex CLI](https://github.com/openai/codex) · [OpenCode](https://github.com/opencode-ai/opencode) · [Antigravity](https://github.com/neplextech/antigravity) · [Cursor](https://www.cursor.com/)

---

## Why Snitch

Traditional scanners flood you with hundreds of findings — half of them are `YOUR_API_KEY_HERE` in a comment. Snitch is different: every finding must be backed by real code evidence. No file read? No finding. Can't quote the exact line? No finding. Didn't check for a fix nearby? No finding.

Findings are tagged with **CWE**, **OWASP Top 10:2025**, and **CVSS 4.0** references for direct GRC ingestion.

---

## Installation

### Claude Code

```
/plugin marketplace add JF10R/Snitch
/plugin install snitch@JF10R-Snitch
```

### Gemini CLI

```bash
gemini extensions install https://github.com/JF10R/Snitch.git
```

### Codex CLI

```bash
git clone https://github.com/JF10R/Snitch.git
cp -r Snitch/agents/skills/snitch ~/.codex/skills/snitch
```

Per-project: use `.agents/skills/snitch` instead.

### OpenCode

```bash
git clone https://github.com/JF10R/Snitch.git
cp -r Snitch/skills/snitch ~/.config/opencode/skills/snitch
```

Per-project: `.opencode/skills/snitch`

### Antigravity

```bash
git clone https://github.com/JF10R/Snitch.git
cp -r Snitch/skills/snitch ~/.gemini/antigravity/skills/snitch
```

Per-project: `.agent/skills/snitch`

### Cursor

```bash
git clone https://github.com/JF10R/Snitch.git
cp -r Snitch/skills/snitch .cursor/skills/snitch
```

<details>
<summary>Updating / Uninstalling</summary>

| Platform | Update | Uninstall |
|----------|--------|-----------|
| Claude Code | `/plugin marketplace update JF10R-Snitch` | `/plugin uninstall snitch@JF10R-Snitch` |
| Gemini CLI | `gemini extensions update snitch` | `gemini extensions uninstall snitch` |
| Codex CLI | Re-clone and copy | `rm -rf ~/.codex/skills/snitch` |
| OpenCode | Re-clone and copy | `rm -rf ~/.config/opencode/skills/snitch` |
| Antigravity | Re-clone and copy | `rm -rf ~/.gemini/antigravity/skills/snitch` |
| Cursor | Re-clone and copy | `rm -rf .cursor/skills/snitch` |

</details>

---

## Usage

```
/snitch
```

Select categories from the interactive menu, or run directly:

```
/snitch --categories=1,2,3,13
/snitch --diff
```

**Quick Scan** detects your stack automatically (`package.json`, imports, config files) and only audits relevant categories.

**`--diff`** scans only staged/unstaged changes — ideal as a pre-commit check.

### After the scan

- **Fix one by one** — walk through each finding individually
- **Fix all** — auto-patch everything at once
- **Run another scan** — check additional categories
- **Done** — exit

---

## Categories

40 audit categories organized by domain:

### Application Security

| # | Category | Description |
|---|----------|-------------|
| 01 | SQL Injection | Parameterized queries, ORM misuse |
| 02 | XSS | Output encoding, DOM injection |
| 03 | Hardcoded Secrets | API keys, passwords, tokens in source |
| 04 | Authentication | Login flows, password handling, MFA |
| 05 | SSRF | Server-side request forgery |
| 07 | Rate Limiting | Brute-force protection, throttling |
| 08 | CORS | Cross-origin misconfiguration |
| 09 | Cryptography | Weak algorithms, key management |
| 10 | Dangerous Patterns | `eval()`, dynamic code execution |
| 28 | Authorization | Broken access control, IDOR |
| 29 | File Uploads | Validation, path traversal |
| 30 | Input Validation | ReDoS, injection vectors |
| 32 | Security Headers | CSP, HSTS, X-Frame-Options |
| 39 | Token Lifetimes | Session expiry, logout effectiveness |

### Services & Integrations

| # | Category | Description |
|---|----------|-------------|
| 06 | Supabase | Row-level security, exposed service keys |
| 13 | Stripe | API keys, webhook verification |
| 14 | Auth Providers | Clerk, Auth0, NextAuth configuration |
| 15 | AI APIs | Claude, OpenAI, Gemini key exposure |
| 16 | Email | SMTP credentials, spam abuse vectors |
| 17 | Database | Connection strings, query security |
| 18 | Redis | Authentication, exposed instances |
| 19 | SMS | Twilio tokens, message injection |

### Infrastructure

| # | Category | Description |
|---|----------|-------------|
| 11 | Cloud Providers | AWS, GCP, Azure, Vercel, Cloudflare |
| 12 | Data Leaks | Logs, error messages, debug output |
| 31 | CI/CD | Pipeline secrets, deployment security |
| 40 | Tunnels & DNS | ngrok, cloudflared, DNS configuration |

### Compliance

| # | Category | Description |
|---|----------|-------------|
| 20 | HIPAA | Protected health information |
| 21 | SOC 2 | Audit trails, access controls |
| 22 | PCI-DSS | Payment card data handling |
| 23 | GDPR | Data deletion, consent, EU requirements |
| 34 | FIPS 140-3 | Cryptographic module compliance |
| 35 | Governance | ISO 27001, FedRAMP, CMMC |
| 38 | Data Classification | Sensitivity labeling, handling policies |

### Performance & Maintenance

| # | Category | Description |
|---|----------|-------------|
| 24 | Memory Leaks | Event listeners, uncleaned resources |
| 25 | N+1 Queries | ORM batching, query optimization |
| 26 | Performance | Blocking I/O, CPU-bound operations |
| 27 | Dependencies | Known CVEs, outdated packages |
| 33 | Unused Dependencies | Dead code, bundle bloat |
| 36 | BCDR | Backup, disaster recovery |
| 37 | Monitoring | Observability, alerting gaps |

---

## How It Works

Snitch is a skill file (`SKILL.md`) — no runtime, no build step, no dependencies. It guides AI assistants through structured security analysis with built-in anti-hallucination rules:

1. **Read** the actual source files before reporting
2. **Verify** each finding with exact file path and line number
3. **Check context** — is there a fix nearby? Is this test code? Server or client?
4. **Prove it** — no evidence, no finding

---

## Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE)

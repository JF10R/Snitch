## CATEGORY 3: Hardcoded Secrets

### Detection
- Any project with source code (universally applicable)
- `.env` files, config files, source files with string literals
- CI/CD configuration files

### What to Search For
- API keys assigned as string literals
- Passwords in code
- AWS access keys (AKIA prefix)
- Stripe keys (sk_live_, sk_test_)
- Private keys in source files

### Actually Vulnerable
- Real API keys assigned to variables
- Real passwords hardcoded in source
- AWS access keys embedded in code
- Private keys stored in source files

### NOT Vulnerable
- Environment variable references (e.g., `process.env.X`, `os.environ[]`, `ENV["X"]`)
- Template placeholders
- Example values in comments
- Test/development placeholder values
- .env.example with dummy values
- Security scanner pattern definitions
- Real secrets in `.env*` files that are gitignored AND not tracked by git — **skip or Low only** (see Gitignore Verification below)

### Context Check
1. Is this a real secret or a placeholder?
2. Is it in a test/example file?
3. Is it documentation or actual code?

### Gitignore Verification (REQUIRED for local config/env files)
Before flagging any secret found in a local config or environment file (`.env*`, `local.settings.json`, `appsettings.Development.json`, etc.), you MUST run these steps in order:
1. **Check ignore rules**: Grep for the filename pattern in `.gitignore` (or equivalent VCS ignore file)
2. **Check tracking**: Run `git ls-files <file>` — if the output is empty, the file was never committed
3. **Check history**: Run `git log --all --diff-filter=A -- <file>` — if empty, the file never entered history
4. **Decision**:
   - Ignored + not tracked + no history → **Skip** (not a finding — local-only file)
   - Ignored + but WAS tracked historically → **Critical** (secret in git history, must rotate + purge)
   - NOT ignored → **Critical** (will be or already is committed)

### Files to Check
- `.env*`, `**/*.config.*`, `**/config/**`
- `docker-compose*.yml`, `Dockerfile*`
- CI/CD files: `.github/workflows/*`, `.gitlab-ci.yml`

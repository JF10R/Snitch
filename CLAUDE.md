# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Snitch is a security audit plugin (v5.2.0) for AI coding assistants. It has **no runtime, no build step, no dependencies** — it's entirely markdown-based skill files that guide AI through structured security analysis.

## Architecture

```
skills/snitch/
  SKILL.md                  # Core: anti-hallucination rules, FP prevention, execution flow (~340 lines)
  menu.md                   # Interactive scan selection, text fallback, groups, smart detection (~620 lines)
  report.md                 # Standards tables, report template, compound risks, SARIF (~250 lines)
  categories/XX-name.md     # 47 individual category detection guides

agents/skills/snitch/       # Mirror of skills/snitch/ — MUST be kept in sync

commands/snitch.toml        # Claude Code slash command definition (references skills/snitch/SKILL.md)
.claude-plugin/             # Plugin metadata (plugin.json + marketplace.json)
gemini-extension.json       # Gemini CLI extension metadata
```

**The two skill directories (`skills/` and `agents/`) must always contain identical content.** Any edit to one must be mirrored to the other.

### How It Executes

1. User runs `/snitch` → `commands/snitch.toml` loads `skills/snitch/SKILL.md`
2. SKILL.md loads `menu.md` on demand (STEP 1) for interactive scan selection
3. For each selected category, the corresponding `categories/XX-name.md` file provides detection patterns, vulnerable/not-vulnerable examples, context checks, and file globs
4. SKILL.md loads `report.md` on demand (STEP 3) for standards tables, report template, and SARIF format
5. Findings require evidence: file path, line number, quoted code — enforced by 7 anti-hallucination rules in SKILL.md

### Category File Structure

Each `categories/XX-name.md` follows this pattern:
- **Detection** — imports/packages indicating the tech is in use
- **What to Search For** — grep patterns and file globs
- **Actually Vulnerable** — concrete examples of real issues
- **NOT Vulnerable** — false positives to skip
- **Context Check** — questions before reporting
- **Files to Check** — glob patterns

## Critical Rules When Editing

### Report Generation Safety
When writing security audit reports, **do not reproduce dangerous pattern strings verbatim** (e.g., `eval`, `innerHTML`, `child_process`). Instead:
- Reference by file path and line number
- Describe the pattern type (e.g., "uses dynamic code evaluation")
- Quote only minimal non-triggering portions

This prevents output from being blocked by security hooks that scan for dangerous substrings.

### Finding Tags (Required)
Every finding must include: CWE reference, OWASP Top 10:2025 mapping, CVSS 4.0 score, severity level, confidence level (best effort), file path, line number, code quote, and fix recommendation. Injection-class findings should include data flow evidence (source → sink).

## Commit Conventions

```
<type>: <subject>    (50 char max, present tense, no period)
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

## Adding a New Category

1. Create `skills/snitch/categories/XX-name.md` following the existing pattern
2. Copy to `agents/skills/snitch/categories/XX-name.md`
3. Update `menu.md` (add to AskUserQuestion flow, text menu, groups, smart detection, name mapping)
4. Update `SKILL.md` (add to category file listing, standards table if applicable)
5. Mirror both files to `agents/skills/snitch/`
6. Test against a real project (positive and negative cases)
5. See `docs/guidelines/skill-development-guidelines.md` for full guide

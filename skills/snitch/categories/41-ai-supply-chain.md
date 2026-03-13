## CATEGORY 41: AI Tool Supply Chain

> **OWASP references:** A03:2025 Software Supply Chain Failures (CWE-1395). Also covers OWASP Top 10 for Agentic Applications: ASI01 (Excessive Agency), ASI03 (Insecure Tool/Function Use), ASI05 (Improper Multi-Agent Orchestration).
>
> **Cross-reference:** Category 15 (AI APIs) covers prompt injection and API key exposure. This category focuses on the supply chain risk of AI tools themselves — MCP servers, skills, plugins, and extensions that execute with elevated privileges.

### Detection
- MCP configuration files: `.cursor/mcp.json`, `claude_desktop_config.json`, `mcp.json`, `.claude/agents/*.md`, `.claude/skills/**/*.md`
- Plugin manifests: `.claude-plugin/plugin.json`, `plugin.json`, `ai-plugin.json`, `.well-known/ai-plugin.json`
- Skill/command definitions: `commands/*.toml`, `.claude/commands/*.md`
- Agent orchestration configs: `autogen`, `crewai`, `langchain/agents`, agent YAML/JSON definitions
- Tool registration patterns: `server.tool()`, `server.setRequestHandler`, `registerTool`, `addTool`, `createTool`
- Extension marketplaces: Copilot extensions, Cursor plugins, Windsurf extensions, Claude Code skills

### What to Search For

**Unvetted MCP servers:**
- MCP server packages installed from npm/pip without pinned versions or integrity hashes
- MCP servers running with `npx` or `bunx` fetching latest from registry at runtime
- MCP servers not in a lockfile (installed ad-hoc via CLI)
- Custom MCP servers with no code review or audit trail

**Tool description poisoning:**
- MCP tool descriptions containing instruction-like text ("always", "you must", "ignore previous")
- Tool descriptions that reference other tools or attempt to influence model behavior
- Hidden Unicode or zero-width characters in tool names or descriptions
- Tool descriptions that change between versions (supply chain attack vector)

**Credential theft via tools:**
- MCP servers requesting environment variables beyond their stated scope
- Tools that read `.env`, credential files, or SSH keys
- Tools with filesystem access broader than their purpose requires
- Tools that make outbound HTTP requests to domains unrelated to their function

**Data exfiltration via tools:**
- Tools that send file contents, code snippets, or conversation context to external servers
- MCP servers with network access that also have filesystem read access (dangerous combination)
- Tools that encode data in URLs, headers, or query parameters to external endpoints
- Skill files that instruct the AI to read and transmit sensitive files

**Prompt injection via tools:**
- Tool outputs containing instruction-like text that could hijack the agent
- Tools returning markdown with hidden instructions (HTML comments, zero-width characters)
- Tool results that reference other tools or attempt to chain unauthorized actions
- RAG-sourced tool descriptions that could be poisoned by document injection

**Over-privileged agents:**
- Agent configs granting write/delete/execute when only read is needed
- MCP servers running with admin/root database credentials
- Tools with `dangerouslySkipPermissions` or equivalent bypass flags
- Agent orchestration with no human-in-the-loop for destructive actions

**Plugin/extension integrity:**
- Plugins loaded from URLs without integrity verification (no hash/signature check)
- Extensions auto-updating without version pinning
- Plugin manifests with overly broad permission scopes
- Marketplace extensions with low download counts or no verified publisher

### Critical
- MCP server that reads credentials/env vars AND makes outbound HTTP requests (exfiltration vector)
- Tool description containing hidden instructions that manipulate agent behavior
- Skill/plugin file instructing the AI to read secrets, tokens, or private keys and include them in output
- Agent with shell execution capability + network access + no human approval gate
- MCP server running as `npx package@latest` with no lockfile pinning (arbitrary code execution on update)

### High
- MCP servers installed without version pinning or integrity hashes
- Tools with filesystem access broader than their stated purpose
- Agent configs granting write/delete permissions when only read is needed
- Custom MCP servers with no code review, audit, or provenance verification
- Plugin/extension loading from URL with no integrity check
- Tool descriptions longer than 500 characters (higher risk of hidden instructions)

### Medium
- MCP server packages not in the project's lockfile (installed ad-hoc)
- Tools making outbound requests to third-party domains (even if seemingly benign)
- Agent orchestration configs with no iteration/recursion limits
- Skill files with no clear provenance or authorship
- Extensions from unverified marketplace publishers

### Context Check
1. Is each MCP server version-pinned in a lockfile, or fetched at runtime?
2. Do tool descriptions contain only factual capability descriptions, or do they include instruction-like language?
3. Does each tool have the minimum permissions needed for its stated function?
4. Are there MCP servers with both filesystem read AND outbound network access?
5. Is there a human approval step for tools that write, delete, or execute?
6. Are custom tools/skills code-reviewed before deployment?
7. Do agent configs set iteration limits and timeout bounds?

### NOT Vulnerable
- MCP servers pinned to exact versions with integrity hashes in lockfile
- Tool descriptions that are purely factual and under 200 characters
- Tools with scoped permissions matching their stated purpose (read-only tools have read-only access)
- MCP servers running in sandboxed environments with no outbound network access
- Human-in-the-loop confirmation for all destructive tool actions
- Skills/plugins from verified publishers with public source code and audit trail
- Agent configs with explicit iteration limits, timeouts, and permission boundaries

### Files to Check
- `.cursor/mcp.json`, `claude_desktop_config.json`, `mcp.json`
- `.claude/agents/**/*.md`, `.claude/skills/**/*.md`, `.claude/commands/**/*.md`
- `commands/*.toml`
- `.claude-plugin/**`, `ai-plugin.json`, `.well-known/ai-plugin.json`
- `**/mcp*.{ts,js,py}`, `**/server.{ts,js,py}` (MCP server implementations)
- `**/tools/**`, `**/plugins/**`, `**/extensions/**`
- `package.json`, `package-lock.json`, `bun.lockb`, `requirements.txt`, `pyproject.toml`
- `**/agent*.{yml,yaml,json,toml}`, `**/crew*.{yml,yaml}`, `**/autogen*.{json,py}`

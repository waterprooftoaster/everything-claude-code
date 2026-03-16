# Next.js Claude Code Configuration

A curated `.claude` configuration for Next.js projects, extracted from [everything-claude-code](https://github.com/anthropics/everything-claude-code).

## What's Included

- **9 agents** — planner, architect, tdd-guide, code-reviewer, security-reviewer, build-error-resolver, e2e-runner, refactor-cleaner, database-reviewer
- **16 commands** — /plan, /tdd, /code-review, /e2e, /build-fix, /test-coverage, and more
- **21 skills** — frontend-patterns, api-design, tdd-workflow, e2e-testing, security-review, and more
- **14 rules** — coding style, security, testing, TypeScript patterns, git workflow
- **12 hooks** — auto-format, type-check, quality gates, console.log detection
- **9 MCP servers** — Vercel, Playwright, GitHub, Supabase, and more

## Installation

1. Copy `.claude/` and `CLAUDE.md` into your Next.js project root:

```bash
cp -r .claude/ /path/to/your-nextjs-project/.claude/
cp CLAUDE.md /path/to/your-nextjs-project/CLAUDE.md
```

2. Configure MCP server credentials in `.claude/settings.json` — replace all `YOUR_*_HERE` placeholders with your actual API keys:

   - `GITHUB_PERSONAL_ACCESS_TOKEN` — GitHub PAT for PR/issue operations
   - `YOUR_PROJECT_REF` — Supabase project reference (or remove the server)
   - `YOUR_EXA_API_KEY_HERE` — Exa API key for web search (or remove the server)

3. Remove any MCP servers you don't need from `.claude/settings.json`.

4. Customize `CLAUDE.md` for your specific project (database, auth, file structure, etc.).

## Customization

- **CLAUDE.md** — Edit to match your project's stack, conventions, and file structure
- **`.claude/settings.json`** — Add/remove MCP servers and hooks
- **`.claude/rules/`** — Add project-specific rules or edit existing ones
- **`.claude/agents/`** — Add domain-specific agents

## Requirements

- [Claude Code](https://claude.ai/code) CLI installed
- Node.js (for hook scripts)

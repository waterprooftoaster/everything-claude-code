# CLAUDE.md — Next.js Project Configuration

This file provides guidance to Claude Code when working with Next.js projects.

## Project Overview

**Stack:** Next.js (App Router), TypeScript, React Server Components, Tailwind CSS

**Architecture:** Server Components by default. Client Components only for interactivity. Server Actions for mutations. API routes for webhooks and external integrations.

## Critical Rules

### TypeScript

- Strict mode enabled — no `any` types, no `@ts-ignore`
- Zod schemas for all input validation (API routes, forms, server actions, env vars)
- Prefer `interface` for object shapes, `type` for unions/intersections
- Export types from `src/types/` for shared use

### Components

- **Server Components** (default): No `'use client'`, no `useState`/`useEffect`
- **Client Components**: `'use client'` at top, keep minimal — extract logic to custom hooks
- Colocate component, styles, and tests in the same directory
- Prefer composition over prop drilling

### Data Fetching

- Fetch data in Server Components using `async/await`
- Use `cache()` and `unstable_cache()` for request deduplication
- Validate all external data with Zod before use
- Use `select()` with explicit column lists, not `select('*')`
- All user-facing queries must include pagination/limits

### Server Actions

```typescript
'use server'

import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1).max(100),
})

export async function createItem(formData: FormData) {
  const parsed = schema.safeParse({ name: formData.get('name') })
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() }
  }
  // ... implementation
  return { success: true, data }
}
```

### API Response Format

```typescript
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }
```

### Code Style

- No emojis in code or comments
- Immutable patterns only — spread operator, never mutate
- No `console.log` in production code
- Proper error handling with try/catch at every level
- Many small files (200-400 lines) over few large files (800 max)

## File Structure

```
src/
  app/
    (auth)/              # Auth-related pages
    (dashboard)/         # Protected pages
    api/
      webhooks/          # Webhook handlers
    layout.tsx           # Root layout with providers
    page.tsx             # Landing page
  components/
    ui/                  # Reusable UI components
    forms/               # Form components with validation
  hooks/                 # Custom React hooks
  lib/
    utils.ts             # General utilities
  types/                 # Shared TypeScript types
```

## Testing Strategy

- **Unit tests:** Vitest for utilities, hooks, and component logic
- **Integration tests:** API routes, server actions, database operations
- **E2E tests:** Playwright for critical user flows
- **Coverage target:** 80%+

```bash
/tdd                     # TDD workflow for new features
/e2e                     # Generate and run Playwright tests
/test-coverage           # Verify coverage meets threshold
```

## Available Agents

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| planner | Implementation planning | Complex features, refactoring |
| architect | System design | Architectural decisions |
| tdd-guide | Test-driven development | New features, bug fixes |
| code-reviewer | Code review | After writing code |
| security-reviewer | Security analysis | Before commits |
| build-error-resolver | Fix build errors | When `next build` fails |
| e2e-runner | E2E testing | Critical user flows |
| refactor-cleaner | Dead code cleanup | Code maintenance |
| database-reviewer | Database review | Schema changes, queries |

## Available Commands

| Command | Purpose |
|---------|---------|
| `/plan` | Create implementation plan for a feature |
| `/tdd` | Test-driven development workflow |
| `/code-review` | Review code quality |
| `/e2e` | Generate and run E2E tests |
| `/build-fix` | Fix build errors |
| `/test-coverage` | Check test coverage |
| `/quality-gate` | Run quality gate checks |
| `/refactor-clean` | Clean up dead code |
| `/update-docs` | Update documentation |
| `/learn` | Extract patterns from sessions |
| `/skill-create` | Generate skills from git history |
| `/prompt-optimize` | Optimize prompts |
| `/model-route` | Route to optimal model |
| `/checkpoint` | Create a checkpoint |
| `/aside` | Sidebar conversation |
| `/verify` | Verification loop |

## Key Skills

| Skill | Purpose |
|-------|---------|
| tdd-workflow | Red-green-refactor TDD process |
| frontend-patterns | React/Next.js component patterns |
| api-design | REST/GraphQL API design |
| backend-patterns | Server-side architecture |
| e2e-testing | Playwright E2E test patterns |
| security-review | Security analysis checklist |
| database-migrations | Safe migration strategies |
| deployment-patterns | CI/CD and deployment |
| docker-patterns | Containerization |
| coding-standards | Code quality standards |

## Workflows

### Planning a feature
```bash
/plan "Add team invitations with email notifications"
```

### Developing with TDD
```bash
/tdd
# Follows red-green-refactor cycle automatically
```

### Before committing
```bash
/code-review
/quality-gate
```

### Before release
```bash
/e2e
/test-coverage
```

## Git Conventions

- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- Feature branches from `main`, PRs required
- CI runs: lint, type-check, unit tests, E2E tests
- Deploy: preview on PR, production on merge to `main`

## MCP Servers

This configuration includes 9 MCP servers (configured in `.claude/settings.json`):

- **vercel** — Deployment management
- **playwright** — Browser automation and E2E testing
- **github** — PR, issue, and repo operations
- **supabase** — Database operations
- **memory** — Persistent memory across sessions
- **sequential-thinking** — Chain-of-thought reasoning
- **context7** — Live documentation lookup
- **magic** — Magic UI components
- **exa-web-search** — Web search and research

Replace `YOUR_*_HERE` placeholders in `.claude/settings.json` with your actual API keys.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Claude Code extension** — a collection of agents, skills, commands, hooks, rules, and MCP configurations that enhance Claude Code with battle-tested development workflows.

## Architecture

- **agents/** — Specialized subagents for delegation (planner, code-reviewer, tdd-guide, etc.)
- **skills/** — Workflow definitions and domain knowledge (coding standards, patterns, testing)
- **commands/** — Slash commands invoked by users (/tdd, /plan, /e2e, etc.)
- **hooks/** — Trigger-based automations (pre/post-tool hooks for formatting, quality gates, reminders)
- **rules/** — Always-follow guidelines (security, coding style, testing requirements)
- **mcp-configs/** — MCP server configurations for external integrations
- **examples/** — Example CLAUDE.md files
- **scripts/hooks/** — Node.js hook scripts referenced by `hooks/hooks.json`
- **scripts/lib/** — Shared utilities for hook scripts

## Key Commands

- `/tdd` — Test-driven development workflow
- `/plan` — Implementation planning
- `/e2e` — Generate and run E2E tests
- `/code-review` — Quality review
- `/build-fix` — Fix build errors
- `/learn` — Extract patterns from sessions
- `/skill-create` — Generate skills from git history

## Formats

- **Agents:** Markdown with YAML frontmatter (name, description, tools, model)
- **Skills:** Markdown with clear sections (When to Use, How It Works, Examples)
- **Commands:** Markdown with description frontmatter
- **Hooks:** JSON with matcher conditions and command hooks in `hooks/hooks.json`

File naming: lowercase with hyphens (e.g., `python-reviewer.md`, `tdd-workflow.md`)

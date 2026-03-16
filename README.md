# everything-claude-code

Forked from [anthropics/claude-code-todo-demo](https://github.com/anthropics/claude-code-todo-demo) (originally **everything-claude-code**) and distilled back into Claude Code only — agents, skills, commands, hooks, rules, and MCP configs.

The `main` branch holds the full collection. Each project-type branch is a curated, portable `.claude/` directory I actually use for that kind of project. Copy the branch contents into your project root and go.

## Branches

| Branch | Stack | What's in it |
|--------|-------|--------------|
| `main` | All | Full collection — 15 agents, 81 skills, 26 commands, hooks, rules for TS/Go/Kotlin/Python/Perl/PHP/Swift |
| `nextjs` | Next.js / TypeScript | 9 agents, 16 commands, 21 skills, 14 rules, 12 hooks, 9 MCP servers |
| `obsidian` | Obsidian plugins | Tailored for Obsidian plugin development |

## Quick start

```bash
# Pick a branch
git clone -b nextjs https://github.com/waterprooftoaster/everything-claude-code.git /tmp/ecc

# Copy into your project
cp -r /tmp/ecc/.claude/ /path/to/your-project/.claude/
cp /tmp/ecc/CLAUDE.md /path/to/your-project/CLAUDE.md

# Edit .claude/settings.json — replace YOUR_*_HERE placeholders with real keys
# Customize CLAUDE.md for your specific project
```

## How it works

Each branch contains:

- **`CLAUDE.md`** at the root — project instructions Claude Code reads automatically
- **`.claude/`** directory — agents, commands, skills, rules, hooks, scripts, MCP server configs

The `.claude/settings.json` on each branch combines hook definitions (with paths rewritten to `.claude/scripts/hooks/`) and curated MCP servers. Everything is self-contained — no symlinks, no plugin root references.

## Adding a new project type

1. Create a new branch from `main`
2. Keep only the agents, commands, skills, and rules relevant to that stack
3. Build a `settings.json` with the right hooks and MCP servers
4. Write a `CLAUDE.md` tailored to the framework
5. Delete everything else

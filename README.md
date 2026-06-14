# Claude Code Config

My global Claude Code configuration. Everything needed to reproduce my exact setup on a fresh machine.

## What's In This Repo

```
claude-config/
├── settings.json              # Permissions, hooks, plugins, thinking toggle
├── agents/                    # Domain agents for delegated implementation
│   ├── backend.md             # Server-side logic, APIs, services
│   ├── frontend.md            # Client/UI code, components, pages
│   ├── database.md            # Schema, migrations, data layer
│   ├── test.md                # Test writing and validation
│   └── docs.md                # Documentation updates (no Bash)
├── commands/                  # Slash commands (user-owned)
│   ├── prp-plan-team.md       # Agent-aware planning (fork of /prp-plan)
│   ├── prp-implement-team.md  # Orchestrator delegation (fork of /prp-implement)
│   ├── grill-me.md            # Stress-test an idea
│   ├── grill-with-docs.md     # Grill against existing docs
│   ├── to-prd.md              # Synthesize conversation into PRD
│   ├── to-issues.md           # Break PRD into vertical slice issues
│   ├── triage.md              # Classify + write agent brief
│   ├── diagnose.md            # 6-phase bug diagnosis loop
│   ├── tdd.md                 # Test-driven development
│   ├── improve-codebase-architecture.md
│   ├── write-a-skill.md       # Create new agent skills
│   └── zoom-out.md            # Step back and reassess
├── rules/
│   ├── common/                # 9 global rules (all languages)
│   │   ├── agents.md          # Agent orchestration and parallel execution
│   │   ├── coding-style.md    # Immutability, file organization, error handling
│   │   ├── documentation.md   # Doc structure, frontmatter, when to create docs
│   │   ├── git-workflow.md    # Commit format, PR workflow, feature implementation
│   │   ├── hooks.md           # Hook types, auto-accept, TodoWrite usage
│   │   ├── patterns.md        # Skeleton projects, repository pattern, API responses
│   │   ├── performance.md     # Model selection, context window, extended thinking
│   │   ├── security.md        # Mandatory checks, secret management, response protocol
│   │   └── testing.md         # 80% coverage, TDD workflow, test types
│   └── typescript/            # 5 TypeScript-specific rules
│       ├── coding-style.md
│       ├── hooks.md
│       ├── patterns.md
│       ├── security.md
│       └── testing.md
├── hooks/
│   └── sensitive-path-guard.sh  # Blocks writes to .env, .ssh, credentials, etc.
├── skills/                    # Custom skills (directory format)
│   ├── learn/
│   │   ├── SKILL.md           # Save learnings to Obsidian vault
│   │   └── CONVENTIONS.md     # Vault formatting rules
│   ├── obsidian/
│   │   ├── SKILL.md           # Manage Obsidian vault notes, blog ideas, indexes
│   │   └── CONVENTIONS.md     # Vault formatting rules
│   ├── pick-up/
│   │   ├── SKILL.md           # Route triaged issues to right workflow
│   │   └── ROUTING.md         # Routing table, decision signals, pipeline diagram
│   ├── plan-tasks/
│   │   ├── SKILL.md           # Plan tasks for Pi orchestrator
│   │   └── TASK-FORMAT.md     # Task JSON schema and rules
│   └── project-docs/
│       ├── SKILL.md           # Manage project docs/ with consistent structure
│       └── TEMPLATES.md       # Frontmatter templates per category
└── LICENSE
```

## Setup (Fresh Machine)

### Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed
- GitHub CLI (`gh`) authenticated

### Step 1: Clone this repo

```bash
git clone https://github.com/ayong/claude-config.git ~/github/personal/claude-config
```

### Step 2: Install plugins

```bash
# Everything Claude Code (provides /prp-plan, /prp-implement, /feature-dev, /plan, etc.)
claude plugins add everything-claude-code@everything-claude-code

# GSD - Get Shit Done (provides /gsd-* skills, agents, hooks, workflows)
# https://github.com/gsd-build/get-shit-done
npx get-shit-done-cc --claude --global

# Caveman mode (compressed communication)
claude plugins add caveman@caveman

# UI/UX design skills
claude plugins add ui-ux-pro-max@ui-ux-pro-max-skill
claude plugins add frontend-design@claude-plugins-official
```

### Step 3: Configure MCP servers

Add the Obsidian MCP server (required by `/learn` and `/obsidian` skills):

```bash
claude mcp add obsidian -- npx @bitbonsai/mcpvault@latest "/path/to/your/obsidian/vault"
```

Replace the vault path with your actual Obsidian vault location. On macOS with iCloud sync, this is typically:

```
~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Your Vault Name
```

### Step 4: Copy config files

```bash
REPO=~/github/personal/claude-config

# Settings (permissions, hooks, plugins)
cp "$REPO/settings.json" ~/.claude/settings.json

# Rules
cp -r "$REPO/rules/" ~/.claude/rules/

# Custom hooks
cp "$REPO/hooks/sensitive-path-guard.sh" ~/.claude/hooks/

# Custom skills
cp -r "$REPO/skills/"* ~/.claude/skills/

# Domain agents
cp -r "$REPO/agents/"* ~/.claude/agents/

# Custom commands
cp -r "$REPO/commands/"* ~/.claude/commands/
```

### Step 5: Fix paths in settings.json

The `settings.json` contains hardcoded paths referencing `$HOME`. After copying, update hook paths to match your home directory:

```bash
sed -i '' "s|/Users/ayong|$HOME|g" ~/.claude/settings.json
```

### Step 6: Verify

Start a new Claude Code session and check:

```
/pick-up          # Should be available
/triage           # Should be available
/prp-plan-team    # Agent-aware planning
/grill-me         # Should be available
/gsd-help         # From GSD plugin
```

## Workflow Pipeline

My idea-to-implementation pipeline:

```
/grill-me        → Stress-test the idea (conversation)
/to-prd          → Synthesize into PRD (GitHub issue)
/to-issues       → Break into vertical slices (GitHub issues)
/triage          → Classify + write agent brief (labels + comment)
/pick-up #N      → Route to right workflow:
  ├── bug        → /diagnose (6-phase loop)
  └── enhancement
      ├── clear  → /prp-plan-team → /prp-implement-team (delegated to domain agents)
      └── unclear → /feature-dev (interactive)
```

### Skill Sources

| Source | Skills | Install Method |
|--------|--------|----------------|
| **This repo** | `/pick-up`, `/learn`, `/obsidian`, `/plan-tasks`, `/project-docs`, `/grill-me`, `/grill-with-docs`, `/to-prd`, `/to-issues`, `/triage`, `/tdd`, `/diagnose`, `/prp-plan-team`, `/prp-implement-team`, `/improve-codebase-architecture`, `/write-a-skill`, `/zoom-out` + 5 domain agents | Copy to `~/.claude/` |
| **ECC plugin** | `/prp-plan`, `/prp-implement`, `/feature-dev`, `/plan`, `/blueprint`, `/multi-plan`, `/multi-execute`, `/code-review`, `/build-fix`, etc. | `claude plugins add` |
| **GSD plugin** | `/gsd-plan-phase`, `/gsd-execute-phase`, `/gsd-quick`, `/gsd-fast`, `/gsd-autonomous`, `/gsd-discuss-phase`, etc. | GSD installer |
| **Caveman** | `/caveman`, `/caveman-commit`, `/caveman-review` | `claude plugins add` |

## What's NOT in This Repo

These are managed by plugins or are transient — don't version them:

- `~/.claude/agents/gsd-*.md` — GSD plugin manages these
- `~/.claude/skills/gsd-*` — GSD plugin manages these
- `~/.claude/hooks/gsd-*` — GSD plugin manages these
- `~/.claude/get-shit-done/` — GSD framework internals
- `~/.claude/plugins/` — Plugin cache/data (managed by `claude plugins`)
- `~/.claude/sessions/`, `session-data/`, `history.jsonl` — Personal session data

## Permissions Philosophy

The `settings.json` allows common safe operations without prompting:

**Auto-allowed:** File read/write/edit, glob, grep, git operations (add, commit, status, log, diff, branch, checkout, stash), npm/pnpm run/test, node, prettier, eslint, tsc.

**Explicitly denied:** curl, wget, ssh, sudo, eval, exec, chmod, chown, `git push --force`, `git reset --hard`.

**Hook-guarded:** Writes to sensitive paths (.env, .ssh, credentials) blocked by `sensitive-path-guard.sh`.

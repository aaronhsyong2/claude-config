# Claude Code Config

My global Claude Code configuration. Everything needed to reproduce my exact setup on a fresh machine.

## What's In This Repo

```
claude-config/
├── settings.json              # Permissions, hooks, plugins, thinking toggle
├── CLAUDE.md                  # Global instructions (gstack skills, agent house style)
├── agents/                    # Domain agents for delegated implementation
│   ├── backend.md             # Server-side logic, APIs, services
│   ├── frontend.md            # Client/UI code, components, pages
│   ├── database.md            # Schema, migrations, data layer
│   ├── test.md                # Test writing and validation
│   ├── docs.md                # Documentation updates (no Bash)
│   └── trello-standup.md      # Uni Enrol standup board (needs Trello MCP)
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
│   ├── visual-plan.md         # Wrapper → visual-plan skill
│   ├── visual-recap.md        # Wrapper → visual-recap skill
│   ├── visual-docs.md         # Wrapper → visual-docs skill (fully local)
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
│   ├── learn-obsidian/
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
│   ├── project-docs/
│   │   ├── SKILL.md           # Manage project docs/ with consistent structure
│   │   └── TEMPLATES.md       # Frontmatter templates per category
│   ├── to-pr-plan/            # Group issues into ordered PR batches
│   │   ├── SKILL.md
│   │   ├── FORMAT.md
│   │   └── SOURCES.md
│   ├── visual-docs/           # Fully-local interactive docs/specs → standalone HTML
│   │   ├── SKILL.md
│   │   ├── references/        # authoring blocks, multi-file specs
│   │   ├── scripts/           # Node compiler (build.mjs) + theme/runtime assets
│   │   └── examples/spec-demo # Worked multi-file spec
│   ├── visual-plan/           # Agent-Native interactive visual plans
│   │   ├── SKILL.md
│   │   ├── agent-native-skill.json
│   │   └── references/        # canvas, wireframe, document-quality, exemplar
│   └── visual-recap/          # Agent-Native visual recaps (PR/branch/diff)
│       ├── SKILL.md
│       ├── agent-native-skill.json
│       └── references/
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

The current Claude Code CLI installs plugins in two steps — add the marketplace, then install from it (`claude plugins add X@Y` no longer exists).

```bash
# ECC — Everything Claude Code (provides /prp-plan, /prp-implement, /feature-dev,
# /plan, /multi-plan, /multi-execute, /code-review, /build-fix, etc.)
# NOTE: the plugin is `ecc@ecc` from affaan-m/ECC — NOT `everything-claude-code`,
# which is a slimmed-down public release that lacks the PRP/blueprint/multi commands.
claude plugins marketplace add affaan-m/ECC
claude plugins install ecc@ecc

# Caveman mode (compressed communication)
claude plugins marketplace add JuliusBrussee/caveman
claude plugins install caveman@caveman

# UI/UX design skills
claude plugins marketplace add nextlevelbuilder/ui-ux-pro-max-skill
claude plugins install ui-ux-pro-max@ui-ux-pro-max-skill

# Frontend design (from the built-in official marketplace)
claude plugins install frontend-design@claude-plugins-official

# Warp — terminal/agent helpers
claude plugins marketplace add warpdotdev/claude-code-warp
claude plugins install warp@claude-code-warp

# GSD - Get Shit Done (provides /gsd-* skills, agents, hooks, workflows)
# https://github.com/gsd-build/get-shit-done
# Run this BEFORE copying settings.json — it installs the gsd-* hooks that
# settings.json references and writes correct, machine-specific hook paths.
npx get-shit-done-cc --claude --global
```

### Step 3: Configure MCP servers

Add the Obsidian MCP server (required by `/learn-obsidian` and `/obsidian` skills):

```bash
claude mcp add obsidian -- npx @bitbonsai/mcpvault@latest "/path/to/your/obsidian/vault"
```

Replace the vault path with your actual Obsidian vault location. On macOS with iCloud sync, this is typically:

```
~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Your Vault Name
```

Add the Trello MCP server (required by the `trello-standup` agent):

```bash
claude mcp add trello \
  -e TRELLO_API_KEY=your_trello_api_key \
  -e TRELLO_TOKEN=your_trello_token \
  -- npx -y @delorenj/mcp-server-trello
```

Get an API key + token from https://trello.com/power-ups/admin (create a Power-Up, then generate a token). Keep both out of git — they are secrets, never commit real values.

### Step 4: Copy config files

```bash
REPO=~/github/personal/claude-config

# Settings (permissions, hooks, plugins)
cp "$REPO/settings.json" ~/.claude/settings.json

# Global instructions
cp "$REPO/CLAUDE.md" ~/.claude/CLAUDE.md

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

The committed `settings.json` hardcodes macOS paths (`/Users/ayong`). After copying, rewrite them to your home directory.

```bash
# macOS:
sed -i '' "s|/Users/ayong|$HOME|g" ~/.claude/settings.json
# Linux:
sed -i "s|/Users/ayong|$HOME|g" ~/.claude/settings.json
```

> If you ran the GSD installer (Step 2) **before** copying, GSD will have already written a `settings.json` with correct hook paths for your machine. In that case, don't blindly overwrite it — merge the repo's `permissions`, the `sensitive-path-guard.sh` hook, the prettier-on-save hook, and `alwaysThinkingEnabled` into GSD's version instead of running the `cp` in Step 4.

### Step 6: Verify

Start a new Claude Code session and check:

```
/pick-up          # Should be available
/triage           # Should be available
/prp-plan-team    # Agent-aware planning
/grill-me         # Should be available
/visual-plan      # Agent-Native visual plan
/visual-recap     # Agent-Native visual recap
/visual-docs      # Fully-local interactive docs/specs → standalone HTML
/gsd-help         # From GSD plugin
```

### `trello-standup` agent setup

The `trello-standup` agent manages the Uni Enrol **Daily Stand-Up** board. It needs the Trello MCP server (Step 3) — without it the `mcp__trello__*` tools are unavailable and the agent can't run.

1. Add the Trello MCP server with your own key + token (Step 3 above). Both are secrets — set them as `-e` env vars, never commit them.
2. Copy the agent: it ships in `agents/trello-standup.md` and lands in `~/.claude/agents/` via the Step 4 `cp`.
3. The board/list/workspace IDs are hardcoded in the agent for the Uni Enrol workspace. Using it for a different board? Edit those IDs, or tell the agent to re-fetch with `get_lists` / `list_boards_in_workspace` — it treats the IDs as a cache and re-resolves stale ones.

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
| **This repo** | `/pick-up`, `/learn-obsidian`, `/obsidian`, `/plan-tasks`, `/project-docs`, `/to-pr-plan`, `/visual-docs`, `/grill-me`, `/grill-with-docs`, `/to-prd`, `/to-issues`, `/triage`, `/tdd`, `/diagnose`, `/prp-plan-team`, `/prp-implement-team`, `/improve-codebase-architecture`, `/write-a-skill`, `/zoom-out` + 6 domain agents | Copy to `~/.claude/`. `visual-docs` needs a one-time `npm install` in `skills/visual-docs/scripts/` |
| **Agent-Native** (`visual-plan`, `visual-recap`) | `/visual-plan`, `/visual-recap` | Versioned here as files; created via the [Agent-Native template-plan doc](https://www.agent-native.com/docs/template-plan). Copy to `~/.claude/`; refresh with `npx @agent-native/core@latest skills update <name>` |
| **ECC plugin** (`ecc@ecc`, from affaan-m/ECC) | `/prp-plan`, `/prp-implement`, `/prp-commit`, `/feature-dev`, `/plan`, `/multi-plan`, `/multi-execute`, `/code-review`, `/build-fix`, etc. | `marketplace add` + `install` |
| **GSD plugin** | `/gsd-plan-phase`, `/gsd-execute-phase`, `/gsd-quick`, `/gsd-fast`, `/gsd-autonomous`, `/gsd-discuss-phase`, etc. | GSD installer |
| **Caveman** | `/caveman`, `/caveman-commit`, `/caveman-review` | `marketplace add` + `install` |
| **Warp** (`warp@claude-code-warp`) | terminal/agent helpers | `marketplace add` + `install` |

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

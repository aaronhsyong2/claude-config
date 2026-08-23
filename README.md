# Claude Code Config

My global Claude Code configuration. Everything needed to reproduce my exact setup on a fresh machine.

## What's In This Repo

```
claude-config/
├── settings.json              # Permissions, hooks, plugins, thinking toggle
├── CLAUDE.md                  # Global instructions (browsing, agent house style)
├── agents/                    # Domain agents + vendored review specialists
│   ├── backend.md             # Server-side logic, APIs, services
│   ├── frontend.md            # Client/UI code, components, pages
│   ├── database.md            # Schema, migrations, data layer
│   ├── test.md                # Test writing and validation
│   ├── docs.md                # Documentation updates (no Bash)
│   ├── code-reviewer.md       # ↓ the 10 agents /ecc-review-pr spawns (vendored from ECC)
│   ├── code-simplifier.md
│   ├── comment-analyzer.md
│   ├── database-reviewer.md
│   ├── pr-test-analyzer.md
│   ├── react-reviewer.md
│   ├── security-reviewer.md
│   ├── silent-failure-hunter.md
│   ├── type-design-analyzer.md
│   └── typescript-reviewer.md
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
│   ├── zoom-out.md            # Step back and reassess
│   ├── ecc-code-review.md     # Local diff / PR review (vendored from ECC)
│   └── ecc-review-pr.md       # Multi-agent PR review (vendored from ECC)
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
│   ├── sensitive-path-guard.sh  # Blocks writes to .env, .ssh, credentials, etc.
│   ├── statusline.js            # Statusline: model | task | dir | context usage
│   └── suggest-compact.js       # Optional PreToolUse compaction nudge (not wired by default)
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
│   ├── strategic-compact/
│   │   └── SKILL.md           # Compact at logical boundaries (vendored from ECC)
│   └── to-pr-plan/
│       ├── SKILL.md           # Group epic issues into PR batches
│       ├── FORMAT.md
│       └── SOURCES.md
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
# Caveman mode (compressed communication)
claude plugins marketplace add JuliusBrussee/caveman
claude plugins install caveman@caveman

# UI/UX design skills
claude plugins marketplace add nextlevelbuilder/ui-ux-pro-max-skill
claude plugins install ui-ux-pro-max@ui-ux-pro-max-skill

# Frontend design (from the built-in official marketplace)
claude plugins install frontend-design@claude-plugins-official
```

> **No ECC plugin, no GSD, no gstack.** All three were removed after a usage
> audit — see [Removed: ECC, GSD, and gstack](#removed-ecc-gsd-and-gstack). The
> ECC pieces actually used are vendored into this repo and install with Step 4.

### Step 3: Configure MCP servers

```bash
# Browser automation — navigation, screenshots, console/network, Lighthouse
claude mcp add chrome-devtools --scope user -- npx -y chrome-devtools-mcp@latest

# Obsidian vault (required by /learn-obsidian and /obsidian)
claude mcp add obsidian -- npx @bitbonsai/mcpvault@latest "/path/to/your/obsidian/vault"
```

Replace the vault path with your actual Obsidian vault location. On macOS with iCloud sync, this is typically:

```
~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Your Vault Name
```

### Step 4: Copy config files

```bash
REPO=~/github/personal/claude-config

# Settings (permissions, hooks, plugins, statusline)
cp "$REPO/settings.json" ~/.claude/settings.json

# Global instructions
cp "$REPO/CLAUDE.md" ~/.claude/CLAUDE.md

# Rules
cp -r "$REPO/rules/" ~/.claude/rules/

# Hooks (guard + statusline + optional compaction nudge)
mkdir -p ~/.claude/hooks && cp "$REPO/hooks/"* ~/.claude/hooks/

# Custom skills
cp -r "$REPO/skills/"* ~/.claude/skills/

# Domain agents + vendored review specialists
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

`settings.json` references two hooks by absolute path — `sensitive-path-guard.sh`
(PreToolUse on `Write|Edit`) and `statusline.js` (statusLine). Both ship in
`hooks/`, so Step 4 + the `sed` above are all that's needed.

### Step 6: Verify

Start a new Claude Code session and check:

```
/pick-up            # Should be available
/triage             # Should be available
/prp-plan-team      # Agent-aware planning
/grill-me           # Should be available
/ecc-review-pr      # Multi-agent PR review (vendored)
```

The statusline should render `model │ task │ dir │ context`. If it's blank,
`~/.claude/hooks/statusline.js` is missing or the path in `settings.json`
wasn't rewritten.

## Workflow Pipeline

My idea-to-implementation pipeline:

```
/grill-me        → Stress-test the idea (conversation)
/to-prd          → Synthesize into PRD (GitHub issue)
/to-issues       → Break into vertical slices (GitHub issues)
/to-pr-plan      → Group into PR batches with dependency order
/triage          → Classify + write agent brief (labels + comment)
/pick-up #N      → Route to right workflow:
  ├── bug        → /diagnose (6-phase loop)
  └── enhancement
      ├── clear  → /prp-plan-team → /prp-implement-team (delegated to domain agents)
      └── unclear → interactive planning
```

Review side:

```
/ecc-code-review → Local uncommitted diff, or a PR by number
/ecc-review-pr   → Full multi-agent PR review; spawns code-reviewer,
                   comment-analyzer, pr-test-analyzer, silent-failure-hunter,
                   type-design-analyzer, code-simplifier
```

### Skill Sources

| Source | Skills | Install Method |
|--------|--------|----------------|
| **This repo** | `/pick-up`, `/learn-obsidian`, `/obsidian`, `/plan-tasks`, `/project-docs`, `/to-pr-plan`, `/grill-me`, `/grill-with-docs`, `/to-prd`, `/to-issues`, `/triage`, `/tdd`, `/diagnose`, `/prp-plan-team`, `/prp-implement-team`, `/improve-codebase-architecture`, `/write-a-skill`, `/zoom-out`, `/ecc-code-review`, `/ecc-review-pr`, `/strategic-compact` + 15 agents | Copy to `~/.claude/` |
| **Caveman** | `/caveman`, `/caveman-commit`, `/caveman-review` | `marketplace add` + `install` |
| **Matt Pocock skills** | `/setup-matt-pocock-skills` and friends | External — see [mattpocock/skills](https://github.com/mattpocock/skills) |

## Removed: ECC, GSD, and gstack

All three were removed on 2026-08-24 after auditing 608 session transcripts for
actual invocations (`<command-name>`, `Skill` tool, `subagent_type`).

**GSD (`get-shit-done`) — removed entirely.** Zero invocations, ever: 0 of 67
skills, 0 of 33 agents, 0 `/gsd:*` commands. It still cost ~2,081 tokens of
context per session (it appeared in 335 sessions) and installed 9 hooks —
including PreToolUse on `Write|Edit` ×3 and PostToolUse on
`Bash|Edit|Write|MultiEdit|Agent|Task` — that spawned a process on nearly every
tool call while no-op'ing, since all of them are gated on a `.planning/`
directory. Removed: `~/.claude/skills/gsd-*`, `~/.claude/agents/gsd-*.md`,
`~/.claude/hooks/gsd-*`, `~/.claude/get-shit-done/`, the installer state files,
and the 9 hook entries in `settings.json`.

`gsd-statusline.js` was the one piece worth keeping — it is not workflow-coupled.
It lives on as `hooks/statusline.js`, decoupled from the GSD name.

**ECC (`ecc@ecc`) — uninstalled, the used parts vendored.** Only 3 of its ~363
commands and skills were ever invoked (`/ecc:strategic-compact` ×170,
`/ecc:code-review` ×120, `/ecc:review-pr` ×104), plus 10 of its 67 agents — all
of them spawned by those two review commands. The plugin cost ~6,166 tokens of
context per session and 191 MB on disk. A plugin is a read-only bundle and can't
be partially trimmed, so the used pieces were copied into this repo instead:

- `commands/ecc-code-review.md`, `commands/ecc-review-pr.md` — prefixed `ecc-`
  to avoid colliding with Claude Code's built-in `/code-review`
- `skills/strategic-compact/`
- the 10 agents listed in the tree above
- `hooks/suggest-compact.js` — the script `strategic-compact` documents. Not
  wired in `settings.json` (it never was); add a PreToolUse `Edit|Write` entry
  if you want the automatic nudge.

**gstack — removed entirely.** 3 invocations ever, all `/browse`, out of 47
skills. Zero `/ship`, `/review`, `/qa`, `/codex`, `/autopilot`, `/design-*`,
`/office-hours`, `/canary`, `/retro`, `/cso`, `/investigate`, `/careful`,
`/guard`. It cost ~5,852 tokens of context per session for the skill listing,
plus ~672 more for the hand-written duplicate of that listing in `CLAUDE.md`
(which loaded twice in this repo, since the user and project copies are
identical), and **2.0 GB** on disk — two byte-identical copies of gstack 1.26.3.0
at `~/.claude/skills/gstack` and `~/.agents/skills/gstack`, 703 MB of
`node_modules` each.

Removed: 48 skill stubs from `~/.claude/skills/`, 48 from `~/.agents/skills/`,
both payload trees, and the gstack block in `CLAUDE.md`. Preserved in
`~/.agents/skills/`: `caveman`, `learned`, `easypg-pre-deploy-branch-check`,
`setup-matt-pocock-skills`, and the `source-command-*` originals.

Browsing moved to the `chrome-devtools` MCP, added standalone
(`claude mcp add chrome-devtools --scope user -- npx -y chrome-devtools-mcp@latest`)
because the previous one came from the ECC plugin and went with it.
`~/.claude/daemon*` and `homunculus/` were left alone — that is Claude Code's own
auth supervisor, not gstack's browse daemon.

Also cleaned up: 10 broken symlinks in `~/.claude/skills/` (`diagnose`,
`grill-me`, `grill-with-docs`, `improve-codebase-architecture`, `tdd`,
`to-issues`, `to-prd`, `triage`, `write-a-skill`, `zoom-out`) that pointed at a
nonexistent `~/.agents/skills/` target. Those commands were never broken — they
resolve from `~/.claude/commands/*.md` — but the dead links showed up as
nameless entries in the skill listing.

## What's NOT in This Repo

These are managed elsewhere or are transient — don't version them:

- `~/.agents/skills/source-command-*` — upstream sources for the Matt Pocock commands
- `~/.claude/plugins/` — Plugin cache/data (managed by `claude plugins`)
- `~/.claude/sessions/`, `session-data/`, `history.jsonl` — Personal session data

## Permissions Philosophy

The `settings.json` allows common safe operations without prompting:

**Auto-allowed:** File read/write/edit, glob, grep, git operations (add, commit, status, log, diff, branch, checkout, stash), npm/pnpm run/test, node, prettier, eslint, tsc.

**Explicitly denied:** curl, wget, ssh, sudo, eval, exec, chmod, chown, `git push --force`, `git reset --hard`.

**Hook-guarded:** Writes to sensitive paths (.env, .ssh, credentials) blocked by `sensitive-path-guard.sh`.

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
│   ├── write-a-skill.md       # Create new agent skills (dropped upstream, ours now)
│   ├── zoom-out.md            # Step back and reassess (dropped upstream, ours now)
│   ├── visual-plan.md         # Wrapper → visual-plan skill
│   ├── visual-recap.md        # Wrapper → visual-recap skill
│   ├── visual-docs.md         # Wrapper → visual-docs skill
│   ├── ecc-code-review.md     # Local diff / PR review (vendored from ECC)
│   └── ecc-review-pr.md       # Multi-agent PR review (vendored from ECC)
├── rules/
│   ├── common/                # 10 global rules (all languages)
│   │   ├── agents.md          # Agent orchestration and parallel execution
│   │   ├── coding-style.md    # Immutability, file organization, error handling
│   │   ├── documentation.md   # Doc structure, frontmatter, when to create docs
│   │   ├── git-workflow.md    # Commit format, PR workflow, feature implementation
│   │   ├── hooks.md           # Hook types, auto-accept, TodoWrite usage
│   │   ├── patterns.md        # Skeleton projects, repository pattern, API responses
│   │   ├── performance.md     # Model selection, context window, extended thinking
│   │   ├── security.md        # Mandatory checks, secret management, response protocol
│   │   ├── testing.md         # 80% coverage, TDD workflow, test types
│   │   └── unslop.md          # Cut AI tells from all writing (vendored from pstack)
│   └── typescript/            # 5 TypeScript-specific rules
│       ├── coding-style.md
│       ├── hooks.md
│       ├── patterns.md
│       ├── security.md
│       └── testing.md
├── hooks/
│   ├── caveman-activate.js      # SessionStart: injects skills/caveman/SKILL.md as context
│   ├── caveman-mode-tracker.js  # UserPromptSubmit: /caveman level switching + reinforcement
│   ├── caveman-config.js        # Shared mode resolver + symlink-safe flag file I/O
│   ├── sensitive-path-guard.sh  # Blocks writes to .env, .ssh, credentials, etc.
│   └── suggest-compact.js       # Optional PreToolUse compaction nudge (not wired by default)
├── skills/                    # Custom skills (directory format)
│   ├── caveman/               # Compressed replies (vendored from the caveman plugin)
│   │   ├── SKILL.md           # PATCHED: added the "With unslop" composition section
│   │   └── LICENSE
│   ├── caveman-commit/        # Compressed commit messages
│   ├── caveman-review/        # Compressed PR review comments
│   ├── caveman-compress/      # Compress a memory file in place
│   ├── caveman-help/          # Mode reference card
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
│   ├── to-pr-plan/
│   │   ├── SKILL.md           # Group epic issues into PR batches
│   │   ├── FORMAT.md
│   │   └── SOURCES.md
│   ├── visual-plan/           # Agent-Native visual plan
│   ├── visual-recap/          # Agent-Native visual recap
│   ├── visual-docs/           # Interactive docs/specs → standalone HTML
│   │   ├── SKILL.md           # needs a one-time npm install in scripts/
│   │   ├── references/
│   │   ├── examples/
│   │   └── scripts/
│   │
│   │                          # --- vendored from mattpocock/skills @ 5b15a47 ---
│   ├── triage/                # Issue state machine + agent-ready briefs
│   │   ├── SKILL.md
│   │   ├── AGENT-BRIEF.md
│   │   └── OUT-OF-SCOPE.md
│   ├── to-spec/               # Conversation -> spec on the issue tracker
│   ├── to-tickets/            # Spec -> tracer-bullet tickets with blocking edges
│   ├── diagnosing-bugs/       # Feedback-loop-first diagnosis (+ scripts/)
│   ├── grill-with-docs/       # 7-line shim: grilling + domain-modeling
│   ├── grilling/              # The interview primitive (rounds, frontier)
│   ├── domain-modeling/       # CONTEXT.md glossary + ADRs
│   │   ├── SKILL.md
│   │   ├── ADR-FORMAT.md      # PATCHED: docs/decisions/, 3-digit, our frontmatter
│   │   └── CONTEXT-FORMAT.md
│   ├── codebase-design/       # Deep-module vocabulary (module/interface/seam)
│   │   ├── SKILL.md
│   │   ├── DEEPENING.md
│   │   └── DESIGN-IT-TWICE.md
│   ├── improve-codebase-architecture/
│   │   ├── SKILL.md           # Deepening survey -> HTML report -> grill
│   │   └── HTML-REPORT.md
│   ├── tdd/                   # Red-green-refactor
│   │   ├── SKILL.md
│   │   ├── mocking.md
│   │   └── tests.md
│   ├── wayfinder/             # Multi-session work as decision tickets
│   ├── prototype/             # Throwaway artifact to settle a design question
│   │   ├── SKILL.md
│   │   ├── LOGIC.md
│   │   └── UI.md
│   ├── research/              # Background agent -> cited markdown in repo
│   ├── resolving-merge-conflicts/   # Resolve by intent, never --abort
│   ├── writing-for-agents/    # Writing skills, AGENTS.md, CLAUDE.md
│   │
│   │                          # --- vendored from cursor/plugins pstack @ bdf7aa3 ---
│   ├── why/                   # Decision archaeology across 7 evidence categories
│   │   ├── SKILL.md           # PATCHED: MCP discovery via ToolSearch, Claude models
│   │   └── references/        # epistemics, prompts, 8 per-source playbooks
│   ├── how/                   # Subsystem walkthrough + architecture critique
│   │   ├── SKILL.md           # PATCHED: critic panel is lens-diverse, not model-diverse
│   │   └── references/        # explorer / explainer / critic prompts, rubric
│   ├── blast-radius/          # What a small diff breaks elsewhere, proven by running it
│   └── show-me-your-work/     # TSV decision log for unattended runs
│       ├── SKILL.md           # PATCHED: transcript path is ~/.claude/projects/
│       ├── references/decision-log-template.tsv
│       └── scripts/log.sh
│       ├── SKILL.md
│       └── SKILL-MECHANICS.md
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

None. Skip this step.

This config runs with **zero plugins installed**. Everything it needs is in this
repo and installs with Step 4. Verify with:

```bash
claude plugin list      # -> "No plugins installed."
```

The last plugin standing was `caveman@caveman`. It was vendored on 2026-08-26 and
uninstalled: its three hook scripts live in `hooks/`, its five skills in `skills/`,
and its two hook entries in `settings.json`. `caveman-activate.js` reads
`../skills/caveman/SKILL.md` relative to its own directory, which resolves the same
under `~/.claude/` as it did inside the plugin, so nothing in the scripts needed
changing.

Uninstalled and not replaced: `ui-ux-pro-max@ui-ux-pro-max-skill` (1 use in five
months), `frontend-design@claude-plugins-official` (0), `ruby-lsp@claude-plugins-official`
(0). Their marketplaces were deregistered too. The two Anthropic marketplaces stay
registered so `claude plugin install` still resolves if you ever want one.

> **No ECC plugin, no GSD, no gstack.** All three were removed after a usage
> audit — see [Removed: ECC, GSD, and gstack](#removed-ecc-gsd-and-gstack). The
> ECC pieces actually used are vendored into this repo and install with Step 4.

### Step 3: Configure MCP servers

MCP servers live in `~/.claude.json`, **not** in this repo. That file also holds
session state and OAuth material, so it is never committed. The `add` commands
below carry no credentials and are safe to keep here; the HTTP servers each do a
browser OAuth handshake on first use.

```bash
# --- stdio ---

# Browser automation — navigation, screenshots, console/network, Lighthouse
claude mcp add chrome-devtools --scope user -- npx -y chrome-devtools-mcp@latest

# Obsidian vault (required by /learn-obsidian and /obsidian)
claude mcp add obsidian -- npx @bitbonsai/mcpvault@latest "/path/to/your/obsidian/vault"

# --- http (OAuth on first use) ---

claude mcp add --transport http context7   https://mcp.context7.com/mcp
claude mcp add --transport http supabase   https://mcp.supabase.com/mcp
claude mcp add --transport http atlassian  https://mcp.atlassian.com/v1/mcp
claude mcp add --transport http cloudflare https://bindings.mcp.cloudflare.com/mcp
claude mcp add --transport http Jam        https://mcp.jam.dev/mcp
```

Replace the vault path with your actual Obsidian vault location. On macOS with iCloud sync, this is typically:

```
~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Your Vault Name
```

Gmail, Google Calendar, and Google Drive are provisioned by the Claude account,
not configured here — they appear in `claude mcp list` on any machine you sign
in on.

Verify with `claude mcp list`. "Needs authentication" is expected until you use
a server for the first time.

> `railway-mcp-server` was configured at some point and no longer connects
> (`-32000: Connection closed`). It is deliberately not in the list above.
> Remove it with `claude mcp remove railway-mcp-server` if it is still present.

### Step 4: Copy config files

```bash
REPO=~/github/personal/claude-config

# Settings (permissions + the three wired hooks)
cp "$REPO/settings.json" ~/.claude/settings.json

# Global instructions
cp "$REPO/CLAUDE.md" ~/.claude/CLAUDE.md

# Rules
cp -r "$REPO/rules/" ~/.claude/rules/

# Hooks (sensitive-path guard, caveman activation, optional compaction nudge)
mkdir -p ~/.claude/hooks && cp "$REPO/hooks/"* ~/.claude/hooks/

# Custom skills
mkdir -p ~/.claude/skills && cp -r "$REPO/skills/"* ~/.claude/skills/

# Domain agents + vendored review specialists
mkdir -p ~/.claude/agents && cp -r "$REPO/agents/"* ~/.claude/agents/

# Custom commands
mkdir -p ~/.claude/commands && cp -r "$REPO/commands/"* ~/.claude/commands/
```

**Optional: the `visual-*` skills.** `visual-plan`, `visual-recap`, and
`visual-docs` are tracked here but not installed on every machine. To skip them:

```bash
rm -rf ~/.claude/skills/visual-{plan,recap,docs}
rm -f  ~/.claude/commands/visual-{plan,recap,docs}.md
```

`visual-docs` also needs a one-time `npm install` in its `scripts/` directory
before it will run, so leaving it out costs nothing if you are not using it.

### Step 5: Fix paths in settings.json

The committed `settings.json` hardcodes macOS paths (`/Users/ayong`). After copying, rewrite them to your home directory.

```bash
# macOS:
sed -i '' "s|/Users/ayong|$HOME|g" ~/.claude/settings.json
# Linux:
sed -i "s|/Users/ayong|$HOME|g" ~/.claude/settings.json
```

`settings.json` references three hooks by absolute path, all shipped in `hooks/`,
so Step 4 plus the `sed` above are all that is needed:

| Hook | Event |
|------|-------|
| `sensitive-path-guard.sh` | `PreToolUse` on `Write\|Edit` — blocks writes to `.env`, `.ssh`, credentials |
| `caveman-activate.js` | `SessionStart` — injects `skills/caveman/SKILL.md` as context |
| `caveman-mode-tracker.js` | `UserPromptSubmit` — `/caveman` level switching, per-turn reinforcement |

Those three are the *only* hooks wired. There is no statusline: `settings.json`
has no `statusLine` key and `hooks/statusline.js` was deleted, because the file
was GSD's and still carried its update-check code paths after GSD was removed.
`hooks/suggest-compact.js` ships but is deliberately unwired.

### Step 6: Verify

Start a new Claude Code session and check:

```
/pick-up            # Route a triaged issue to the right workflow
/triage             # Issue state machine
/prp-plan-team      # Agent-aware planning
/grilling           # The interview primitive (was /grill-me before the fork)
/why                # Decision archaeology
/ecc-review-pr      # Multi-agent PR review (vendored)
/caveman-help       # Caveman mode reference card
```

Caveman mode should announce itself in the first turn's context. If it does not,
check that `settings.json` points at `~/.claude/hooks/caveman-activate.js` with
the path rewritten by Step 5, and that `~/.claude/skills/caveman/SKILL.md` exists
— the hook reads it at runtime and silently falls back to a shorter built-in
ruleset when it is missing.

```bash
claude plugin list      # -> "No plugins installed."
claude mcp list         # -> the servers from Step 3
node ~/.claude/hooks/caveman-activate.js | head -1   # -> CAVEMAN MODE ACTIVE — level: full
```

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
| **This repo (own)** | `/pick-up`, `/learn-obsidian`, `/obsidian`, `/plan-tasks`, `/project-docs`, `/to-pr-plan`, `/prp-plan-team`, `/prp-implement-team`, `/write-a-skill`, `/zoom-out` + 15 agents | Copy to `~/.claude/` |
| **Agent-Native** | `/visual-plan`, `/visual-recap`, `/visual-docs` | Copy to `~/.claude/`; `visual-docs` needs a one-time `npm install` in `skills/visual-docs/scripts/`. Refresh with `npx @agent-native/core@latest skills update <name>` |
| **This repo (vendored, ECC)** | `/ecc-code-review`, `/ecc-review-pr`, `/strategic-compact` | Copy to `~/.claude/` |
| **This repo (vendored, Matt Pocock)** | `/triage`, `/to-spec`, `/to-tickets`, `/diagnosing-bugs`, `/grill-with-docs`, `/grilling`, `/domain-modeling`, `/codebase-design`, `/improve-codebase-architecture`, `/tdd`, `/wayfinder`, `/prototype`, `/research`, `/resolving-merge-conflicts`, `/writing-for-agents` | Copy to `~/.claude/` — see below |
| **This repo (vendored, pstack)** | `/why`, `/how`, `/blast-radius`, `/show-me-your-work` + the `unslop` rule | Copy to `~/.claude/` — see below |
| **This repo (vendored, caveman)** | `/caveman`, `/caveman-commit`, `/caveman-review`, `/caveman-compress`, `/caveman-help` | Copy to `~/.claude/` — needs `hooks/caveman-*.js` and the two `settings.json` hook entries |
| **Matt Pocock (external)** | `/setup-matt-pocock-skills` | Still symlinked from `~/.agents/skills/` — run per repo before the engineering flows |

## Upstream Sources

Every external repo and plugin this config draws on, and what came from each.

### Vendored — forked into this repo, now ours to edit

| Source | Pinned at | What we took |
|--------|-----------|--------------|
| [`mattpocock/skills`](https://github.com/mattpocock/skills) | `5b15a47` (2026-08-24) | 15 skills: `/triage`, `/to-spec`, `/to-tickets`, `/diagnosing-bugs`, `/grill-with-docs`, `/grilling`, `/domain-modeling`, `/codebase-design`, `/improve-codebase-architecture`, `/tdd`, `/wayfinder`, `/prototype`, `/research`, `/resolving-merge-conflicts`, `/writing-for-agents` |
| [`cursor/plugins`](https://github.com/cursor/plugins/tree/main/pstack) → `pstack` (MIT, Lauren Tan) | `bdf7aa3` (2026-08-26) | 4 skills of 44: `/why`, `/how`, `/blast-radius`, `/show-me-your-work`, plus `unslop` distilled into `rules/common/unslop.md` |
| [`affaan-m/ECC`](https://github.com/affaan-m/ECC) — Everything Claude Code (`ecc@ecc`) | uninstalled 2026-08-24 | `/ecc-code-review`, `/ecc-review-pr`, `/strategic-compact`, 10 review agents |
| [`JuliusBrussee/caveman`](https://github.com/JuliusBrussee/caveman) (MIT) | `84cc3c14` (2026-08-26) | 5 skills (`/caveman`, `-commit`, `-review`, `-compress`, `-help`), 3 hook scripts, 2 `settings.json` hook entries |
| [Agent-Native](https://www.npmjs.com/package/@agent-native/core) | tracks latest | `/visual-plan`, `/visual-recap`, `/visual-docs` |

Vendored copies diverge from upstream on purpose. Sync by diffing, never by
overwriting. Known divergences:

- `domain-modeling/ADR-FORMAT.md` points at `docs/decisions/` with three-digit
  numbering and the frontmatter from `rules/common/documentation.md`.
- Codex-only `agents/openai.yaml` is stripped from every Matt Pocock skill.
- The four pstack skills were written for Cursor. Subagent types, model slugs,
  the `readonly` flag, MCP discovery, and the transcript path were all rewritten
  for Claude Code. `/how`'s critic panel traded model diversity for lens
  diversity because only Claude models are available here.

### Plugins — none

Zero plugins installed, by design. `claude plugin list` returns
"No plugins installed." Everything above is vendored or symlinked, so a fresh
machine reproduces this config from Step 4 alone with no marketplace round-trip.

Uninstalled on 2026-08-26 with their marketplaces deregistered:

| Plugin | Uses | Disposition |
|--------|------|-------------|
| `caveman@caveman` | 4529 | Vendored into this repo, see above |
| `ui-ux-pro-max@ui-ux-pro-max-skill` | 1 | Dropped |
| `frontend-design@claude-plugins-official` | 0 | Dropped |
| `ruby-lsp@claude-plugins-official` | 0 | Dropped |

The two Anthropic marketplaces (`claude-plugins-official`, `claude-code-plugins`)
remain registered. They install nothing on their own and keep
`claude plugin install` working if a plugin is ever wanted again.

### External symlinks — managed outside this repo

| Path | Source | Provides |
|------|--------|----------|
| `~/.claude/skills/setup-matt-pocock-skills` | `~/.agents/skills/` | Per-repo config for the engineering pipeline. Run once per repo |
| `~/.claude/skills/build-an-agent` | `~/.config/agents/` | House style for authoring agents and skills |

### Referenced but not adopted

- **`mattpocock/skills`** — `ask-matt` (router over 6 skills we didn't take),
  and the `in-progress/` and `misc/` categories.
- **`pstack`** — `poteto-mode` and its 22 playbooks (416K, bun lockfile,
  graphite throughout), `interrogate` / `arena` / `swarm` (adversarial signal
  comes from multi-vendor model diversity, which does not survive the port; the
  `Workflow` tool and the review agents already cover the fan-out),
  `setup-pstack` (writes `.cursor/rules/*.mdc`), the 21 `principle-*` skills,
  and 12 others that duplicate skills already here.

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

`gsd-statusline.js` was kept at the time as `hooks/statusline.js`. That was a
rename, not a decoupling: the file still declared `gsd-hook-version: 1.42.3`,
read `~/.cache/gsd/gsd-update-check.json`, and could still print
`⬆ /gsd:update` or `⚠ stale hooks — run /gsd:update` for a plugin that no longer
existed. It was deleted on 2026-08-26 along with the `statusLine` key, and
`caveman-activate.js` lost its "statusline setup needed" nudge so it does not
fire every session. No statusline is configured now.

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
`~/.agents/skills/`: `caveman`, `learned`, `setup-matt-pocock-skills`, the
`source-command-*` originals, and one machine-local work skill not tracked here.

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

- `~/.claude.json` — MCP server definitions, session state, and OAuth material.
  Reproduce the servers with Step 3 instead; never commit this file
- `~/.agents/skills/source-command-*` — upstream sources for the Matt Pocock commands
- `~/.claude/plugins/` — Plugin cache/data (managed by `claude plugin`). Nothing
  is installed; the directory only holds the two Anthropic marketplace clones
- `~/.claude/sessions/`, `session-data/`, `history.jsonl` — Personal session data

### Installed here but intentionally untracked

Present in `~/.claude/` on this machine, deliberately absent from the repo:

| Path | Why |
|------|-----|
| `skills/build-an-agent` | Symlink to `~/.config/agents/`, managed there |
| `skills/setup-matt-pocock-skills` | Symlink to `~/.agents/skills/`, run once per repo |
| One project-specific pre-deploy skill | Names a client project; the repo is project-agnostic |

### Tracked here but not installed on this machine

`visual-plan`, `visual-recap`, and `visual-docs` (skills and command wrappers).
They came in from another machine and are kept in the repo, but not installed
here. See the note in [Step 4](#step-4-copy-config-files).

### Removed hard dependencies

`settings.json` previously wired **11 hook events** to Comnyang
(`/Applications/Comnyang.app` plus a hook script under
`~/Library/Application Support/`). The app is not functional, so every one of
those entries was removed on 2026-08-26 — they would have fired against a
missing binary on any other machine. Three hooks remain, all shipped in `hooks/`.

## Permissions Philosophy

The `settings.json` allows common safe operations without prompting:

**Auto-allowed:** File read/write/edit, glob, grep, git operations (add, commit, status, log, diff, branch, checkout, stash), npm/pnpm run/test, node, prettier, eslint, tsc.

**Explicitly denied:** curl, wget, ssh, sudo, eval, exec, chmod, chown, `git push --force`, `git reset --hard`.

**Hook-guarded:** Writes to sensitive paths (.env, .ssh, credentials) blocked by `sensitive-path-guard.sh`.

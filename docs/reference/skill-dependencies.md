---
title: "Orchestrator Skill Dependencies"
category: reference
tags:
  - orchestrator
  - skills
  - dependencies
  - fork-tracking
created: 2026-05-02
updated: 2026-05-02
status: active
related:
  - "[Claude Orchestrator PRD](../guide/claude-orchestrator-prd.md)"
---

# Orchestrator Skill Dependencies

Comprehensive list of skills the orchestrator pipeline relies on, their source, and fork status.

## Pipeline Overview

```
/setup-matt-pocock-skills  (prerequisite — configures issue tracker, labels, domain docs)
        │
/grill-me → /to-prd → /to-issues → /to-pr-plan → /triage → /pick-up
                                                                 │
                    ┌────────────────────────────────────────────┘
                    ├── /diagnose          (bugs)
                    ├── /prp-plan          (clear enhancements)
                    ├── /prp-implement     (execute plan)
                    ├── /feature-dev       (unclear enhancements)
                    ├── /tdd              (test-driven development)
                    ├── /code-review       (post-implementation)
                    └── /prp-pr            (create PR)
```

## Prerequisites

### /setup-matt-pocock-skills

**Source:** `mattpocock/skills` (GitHub) — install via `npx skills@latest add mattpocock/skills`
**Status:** NOT INSTALLED — must be added to `~/.claude/commands/` or `claude-config`

This skill is a **prerequisite** for all Matt Pocock skills to function. Without it, skills like `/to-prd`, `/to-issues`, and `/triage` fail because they don't know what labels to use or where the issue tracker is.

**What it configures (per project):**

1. **Issue Tracker Selection**
   - GitHub Issues (default), GitLab Issues, local markdown files (`.scratch/`), or custom
   - Examines git remotes and repo structure to propose defaults

2. **Triage Label Vocabulary**
   - Maps 5 canonical states to actual repo label names:

   | Canonical State | Purpose | Default Label |
   |----------------|---------|---------------|
   | `needs-triage` | Initial evaluation required | `needs-triage` |
   | `needs-info` | Waiting on reporter | `needs-info` |
   | `ready-for-agent` | Fully specified for automated agent | `ready-for-agent` |
   | `ready-for-human` | Requires human implementation | `ready-for-human` |
   | `wontfix` | Will not receive action | `wontfix` |

   Category labels also needed: `bug`, `enhancement`

3. **Domain Documentation Layout**
   - Single-context: One `CONTEXT.md` + `docs/adr/` at root
   - Multi-context: `CONTEXT-MAP.md` pointing to distributed contexts (monorepos)

**Output files written to target project:**
- `docs/agents/issue-tracker.md` — which tracker to use and how
- `docs/agents/triage-labels.md` — label mapping table
- `docs/agents/domain.md` — documentation layout config
- `## Agent skills` block in `CLAUDE.md` or `AGENTS.md`

**Supporting docs included in the skill:**
- `issue-tracker-github.md` — GitHub-specific conventions using `gh` CLI
- `issue-tracker-gitlab.md` — GitLab configuration
- `issue-tracker-local.md` — Local markdown file setup (uses `.scratch/` directory)

**Key insight:** Matt Pocock skills DO support local issue tracking — but only when this setup skill configures it. The skills themselves are tracker-agnostic; they read from `docs/agents/issue-tracker.md` to know where to publish.

**Action required:** Install this skill and run it on each project repo before using `/to-prd`, `/to-issues`, or `/triage`. For leadforge-project, this means creating the 5 triage labels on GitHub and generating the `docs/agents/` config files.

## Skills by Source

### Local — Claude Config (owned, no fork needed)

| Skill | Path | Pipeline Step | Notes |
|-------|------|---------------|-------|
| `/pick-up` | `skills/pick-up/` | Route triaged issue to workflow | Routes to downstream skills |
| `/to-pr-plan` | `skills/to-pr-plan/` | Group issues into PR batches | NEW — created for orchestrator |
| `/project-docs` | `skills/project-docs/` | Write documentation | Used by `/to-pr-plan` to persist PR plans |
| `/plan-tasks` | `skills/plan-tasks/` | Break work into tasks | Pi orchestrator support |
| `/learn` | `skills/learn/` | Save learnings to Obsidian | Not in orchestrator pipeline |
| `/obsidian` | `skills/obsidian/` | Manage Obsidian notes | Not in orchestrator pipeline |

### Matt Pocock — External (need to fork)

**Source repo:** `mattpocock/skills` — install via `npx skills@latest add mattpocock/skills`

| Skill | Path | Pipeline Step | Fork Priority | Notes |
|-------|------|---------------|---------------|-------|
| `/setup-matt-pocock-skills` | NOT INSTALLED | Prerequisite for all below | CRITICAL — install immediately | Configures issue tracker, labels, domain docs |
| `/grill-me` | `commands/grill-me.md` | Stress-test ideas | LOW — interactive | N/A (conversation) |
| `/grill-with-docs` | `commands/grill-with-docs.md` | Grill with doc context | LOW — interactive | N/A (conversation) |
| `/to-prd` | `commands/to-prd.md` | Convert context to PRD | HIGH — creates epic issue | Tracker-agnostic, reads `docs/agents/issue-tracker.md` |
| `/to-issues` | `commands/to-issues.md` | Break PRD into issues | HIGH — creates work items | Tracker-agnostic, reads `docs/agents/issue-tracker.md` |
| `/triage` | `commands/triage.md` | Classify + write agent brief | HIGH — gates execution | Reads `docs/agents/triage-labels.md` for label names |
| `/tdd` | `commands/tdd.md` | Test-driven development | MED — used during implementation | N/A (code-level) |
| `/diagnose` | `commands/diagnose.md` | Debug hard bugs | LOW — on-demand | N/A (code-level) |
| `/write-a-skill` | `commands/write-a-skill.md` | Create new skills | LOW — meta-tool | N/A |
| `/improve-codebase-architecture` | `commands/improve-codebase-architecture.md` | Architecture improvements | LOW — on-demand | N/A |
| `/zoom-out` | `commands/zoom-out.md` | Step back, reassess | LOW — on-demand | N/A |

### ECC Plugin — Everything Claude Code (need to fork)

| Skill | Plugin Path | Pipeline Step | Fork Priority | Notes |
|-------|-------------|---------------|---------------|-------|
| `/prp-plan` | ECC plugin | Plan implementation | HIGH — primary planning route | Called by `/pick-up` for clear enhancements |
| `/prp-implement` | ECC plugin | Execute plan | HIGH — primary execution route | Called after `/prp-plan` |
| `/code-review` | ECC plugin | Review code | HIGH — post-implementation gate | Called before PR creation |
| `/prp-pr` | ECC plugin | Create PR | HIGH — final pipeline step | Creates branch + PR on GitHub |
| `/feature-dev` | ECC plugin | Interactive feature dev | MED — alternate route for unclear work | Called by `/pick-up` for human-needed items |
| `/build-fix` | ECC plugin | Fix build errors | MED — used during verification | Agent self-fix on build failures |

### ECC Plugin — Hooks (need to disable or replace)

| Hook ID | Action | Orchestrator Impact | Resolution |
|---------|--------|---------------------|------------|
| `pre:edit-write:gateguard-fact-force` | BLOCK | Stops autonomous writes | `ECC_GATEGUARD=off` |
| `pre:bash:dispatcher` | BLOCK (conditional) | May block bash commands | `ECC_HOOK_PROFILE=minimal` |
| `pre:config-protection` | BLOCK | Blocks config file edits | `ECC_HOOK_PROFILE=minimal` |
| `pre:mcp-health-check` | BLOCK (conditional) | Blocks unhealthy MCP calls | `ECC_HOOK_PROFILE=minimal` |
| `post:quality-gate` | Advisory | Adds noise in autonomous mode | `ECC_HOOK_PROFILE=minimal` |
| `post:edit:design-quality-check` | Advisory | Irrelevant for backend refactors | `ECC_HOOK_PROFILE=minimal` |
| PostToolUse prettier hook | Format | Conflicts with Biome projects | Replace with project-defined formatting |

### ECC Plugin — Agents (evaluate for fork)

| Agent | Used By | Fork Priority | Notes |
|-------|---------|---------------|-------|
| `code-reviewer` | Post-implementation review | MED | May want custom review criteria |
| `build-error-resolver` | Verification failures | MED | Useful for agent self-fix |
| `security-reviewer` | Pre-commit checks | LOW | Nice to have, not blocking |

## Fork Roadmap

### Phase 0: Immediate Fix

Install `/setup-matt-pocock-skills` and run it on leadforge-project to create labels and config files.

```bash
npx skills@latest add mattpocock/skills
# Then in Claude Code on the leadforge project:
/setup-matt-pocock-skills
```

### Phase 1: Orchestrator MVP

Disable ECC hooks via environment variables. No forking needed yet.

```bash
ECC_HOOK_PROFILE=minimal
ECC_GATEGUARD=off
```

### Phase 2: Core Pipeline Fork (HIGH priority)

Fork into `claude-config` to remove external dependency for execution:

1. `/setup-matt-pocock-skills` → `skills/setup-project/` (rename, generalize)
2. `/to-prd` → `skills/to-prd/` (add local mode adapter)
3. `/to-issues` → `skills/to-issues/` (add local mode adapter)
4. `/triage` → `skills/triage/` (add local mode adapter)
5. `/prp-plan` → `skills/prp-plan/`
6. `/prp-implement` → `skills/prp-implement/`
7. `/code-review` → `skills/code-review/`
8. `/prp-pr` → `skills/prp-pr/`

### Phase 3: Extended Fork (MED priority)

Fork for completeness and customization:

1. `/feature-dev` → `skills/feature-dev/`
2. `/build-fix` → `skills/build-fix/`
3. `/tdd` → `skills/tdd/` (already local, move to skills/ structure)
4. `code-reviewer` agent → `agents/code-reviewer/`
5. `build-error-resolver` agent → `agents/build-error-resolver/`

### Phase 4: Full Independence (LOW priority)

Fork remaining Matt Pocock skills and remove ECC plugin entirely:

1. `/grill-me`, `/grill-with-docs`, `/diagnose`, `/zoom-out`
2. Remove ECC from `enabledPlugins` in settings.json
3. Replace any remaining ECC hooks with local equivalents

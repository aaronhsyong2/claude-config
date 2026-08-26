---
title: "Skill Dependencies"
category: reference
tags:
  - skills
  - dependencies
  - pipeline
created: 2026-05-02
updated: 2026-08-26
status: active
related:
  - "[Claude Orchestrator PRD](../guide/claude-orchestrator-prd.md)"
---

# Skill Dependencies

What the workflow pipeline relies on, where each piece comes from, and what depends on what.

Nothing here is specific to a particular repo. Every skill reads its per-repo
configuration from `docs/agents/` (see [Prerequisite](#prerequisite)), so the
same set works across any project.

## Pipeline Overview

```
/setup-matt-pocock-skills   (prerequisite — run once per repo)
        │
/grill-with-docs → /to-spec → /to-tickets → /to-pr-plan → /pick-up
                                                              │
                    ┌─────────────────────────────────────────┘
                    ├── bug          → /diagnosing-bugs
                    └── enhancement
                        ├── clear    → /prp-plan-team → /prp-implement-team
                        └── unclear  → /grill-with-docs → /prp-plan-team
                                                              │
                                          /ecc-review-pr ─────┘
```

`/triage` is deliberately **not** in this chain. It is the on-ramp for issues
you did *not* create — inbound bug reports and feature requests — which it turns
into agent-ready issues that `/pick-up` then routes. Tickets produced by
`/to-tickets` already carry `ready-for-agent`, so triaging them is redundant.

## Prerequisite

### `/setup-matt-pocock-skills`

Still external — symlinked from `~/.agents/skills/`, not vendored into this repo.

Configures three things per repo, written to `docs/agents/`:

- **Issue tracker** — GitHub (`gh` CLI), GitLab, or local markdown under `.scratch/`
- **Triage labels** — maps the five canonical roles to this repo's label strings
- **Domain docs** — where `CONTEXT.md` and ADRs live

`/to-spec`, `/to-tickets`, `/triage`, and `/wayfinder` all read this config and
will tell the user to run setup if it is missing. The skills themselves are
tracker-agnostic.

> **Note:** setup writes to `docs/agents/`. If a repo already uses that path for
> something else, point setup elsewhere before running it.

## Triage Label Vocabulary

Shared contract between `/triage`, `/to-tickets`, and `/pick-up`. All three use
the same five roles, so no translation layer is needed:

| Role | Meaning |
|------|---------|
| `needs-triage` | Maintainer needs to evaluate this |
| `needs-info` | Waiting on the reporter |
| `ready-for-agent` | Fully specified, ready for an AFK agent |
| `ready-for-human` | Requires human implementation |
| `wontfix` | Will not be actioned |

`/to-tickets` applies `ready-for-agent` on publish. `/pick-up` routes on the
`category` + `state` pair.

## Skills by Source

### Owned — written here

| Skill | Path | Pipeline Step |
|-------|------|---------------|
| `/pick-up` | `skills/pick-up/` | Route a triaged issue to the right workflow |
| `/to-pr-plan` | `skills/to-pr-plan/` | Group tickets into PR batches |
| `/project-docs` | `skills/project-docs/` | Write documentation (used by `/to-pr-plan`) |
| `/plan-tasks` | `skills/plan-tasks/` | Break work into orchestrator tasks |
| `/learn-obsidian` | `skills/learn-obsidian/` | Save learnings (outside the pipeline) |
| `/obsidian` | `skills/obsidian/` | Manage notes (outside the pipeline) |
| `/prp-plan-team` | `commands/prp-plan-team.md` | Agent-aware planning |
| `/prp-implement-team` | `commands/prp-implement-team.md` | Orchestrated execution |
| `/write-a-skill` | `commands/write-a-skill.md` | Author new skills |
| `/zoom-out` | `commands/zoom-out.md` | Step back and reassess |

`/write-a-skill` and `/zoom-out` were dropped upstream and are fully owned here.

### Vendored from `mattpocock/skills` @ `5b15a47`

Forked on 2026-08-24 — **no longer external, safe to modify**. See the
[Removed](../../README.md) section of the README for the audit that preceded it.

| Skill | Role |
|-------|------|
| `/triage` | Issue state machine, agent-ready briefs |
| `/to-spec` | Conversation → spec on the tracker |
| `/to-tickets` | Spec → tracer-bullet tickets with blocking edges |
| `/diagnosing-bugs` | Feedback-loop-first diagnosis |
| `/grill-with-docs` | Interview + domain model (shim over the next two) |
| `/grilling` | The interview primitive |
| `/domain-modeling` | `CONTEXT.md` glossary + ADRs |
| `/codebase-design` | Deep-module vocabulary |
| `/improve-codebase-architecture` | Deepening survey → HTML report |
| `/tdd` | Red-green-refactor |
| `/wayfinder` | Multi-session work as decision tickets |
| `/prototype` | Throwaway artifact to settle a design question |
| `/research` | Background agent → cited markdown |
| `/resolving-merge-conflicts` | Resolve by intent, never `--abort` |
| `/writing-for-agents` | Writing skills, `AGENTS.md`, `CLAUDE.md` |

**Deliberate divergence from upstream:** `domain-modeling/ADR-FORMAT.md` is
repointed at `docs/decisions/` with three-digit numbering and the frontmatter
defined in `rules/common/documentation.md`. Codex-only `agents/openai.yaml` is
stripped from every skill. `ask-matt` is not adopted — it hard-references skills
that were not taken.

### Vendored from `cursor/plugins` → `pstack` @ `bdf7aa3`

Forked on 2026-08-26 (MIT). Four skills out of 44, plus the `unslop` patterns as
a rule. All four are standalone: none calls another skill, so none can break the
others.

| Skill | Role |
|-------|------|
| `/why` | Decision archaeology. Enumerates MCPs at run time, queries seven evidence categories in parallel, returns cited findings with calibrated confidence |
| `/how` | Subsystem walkthrough, placement and layering questions, optional architecture critique |
| `/blast-radius` | What a change breaks outside the diff, with the safety fact proven by running code |
| `/show-me-your-work` | TSV decision log for unattended or multi-phase runs |

**Deliberate divergence from upstream.** Everything here was written for Cursor:

- `subagent_type: generalPurpose` → `general-purpose`; the `readonly` flag has no
  Claude Code equivalent, so read-only is stated in each brief as a posture.
- Model config was read from `~/.cursor/rules/pstack-models.mdc`. Slugs are now
  fixed per role: `sonnet` to gather, `fable` to write prose, `opus` to critique.
- `/how`'s critic panel drew its adversarial signal from **model** diversity across
  four vendors. Only Claude models are available here, so it draws on **lens**
  diversity instead: four critics, one each for coupling, failure modes, change
  cost, and simplification.
- `/why`'s MCP discovery reads the tool list plus `ToolSearch`, not Cursor's
  `mcps/` directory.
- `/show-me-your-work` reads `~/.claude/projects/<slug>/<session>.jsonl`.

**Not adopted.** `poteto-mode` and its 22 playbooks (416K, bun lockfile, graphite
throughout), `interrogate` / `arena` / `swarm` (same multi-vendor premise that does
not survive the port, and `Workflow` plus the review agents already cover the
fan-out), `setup-pstack` (writes `.cursor/rules/*.mdc`), the 21 `principle-*`
skills, and 12 others that duplicate skills already here.

### Vendored from the ECC plugin

The plugin itself was removed; only the parts in actual use were kept.

| Item | Path |
|------|------|
| `/ecc-code-review` | `commands/ecc-code-review.md` |
| `/ecc-review-pr` | `commands/ecc-review-pr.md` |
| `/strategic-compact` | `skills/strategic-compact/` |
| 10 review agents | `agents/` — see README |

Prefixed `ecc-` because bare `code-review` collides with the built-in
`/code-review`.

## Inter-Skill Dependencies

Skills that call other skills via the Skill tool. Removing a dependency breaks
the caller, not just degrades it.

| Caller | Requires | Why |
|--------|----------|-----|
| `/grill-with-docs` | `/grilling`, `/domain-modeling` | It is a 7-line shim over both |
| `/improve-codebase-architecture` | `/codebase-design`, `/grilling`, `/domain-modeling` | Architecture vocabulary + the interview |
| `/wayfinder` | `/prototype`, `/research`, `/grilling` | Three of its four ticket types |
| `/pick-up` | `/diagnosing-bugs`, `/prp-plan-team`, `/grill-with-docs` | Its routing targets |
| `/to-pr-plan` | `/project-docs` | Persists the PR plan document |

None of the four pstack skills appears in this table: each is self-contained.
`/why` and `/how` are documented as companions and cross-reference each other in
prose, but neither invokes the other, so either works alone.

`/improve-codebase-architecture` also reads `CONTEXT.md` and `docs/decisions/`.
It degrades in a repo that has neither, so seed them before relying on it.

## Verification

To confirm no skill points at something that does not exist:

```bash
# every /slash-command referenced anywhere in the repo
grep -rhoE '/[a-z][a-z0-9-]{2,}' skills commands --include='*.md' | sort -u
```

Cross-check that list against `ls commands/` and `ls -d skills/*/`.

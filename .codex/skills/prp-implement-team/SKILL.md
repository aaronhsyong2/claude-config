---
name: prp-implement-team
description: Executes an agent-aware implementation plan from the canonical repository workflow. Use when asked to run prp-implement-team or implement its plan.
---

# PRP Implement Team

Resolve [commands/prp-implement-team.md](../../../commands/prp-implement-team.md) relative to this skill and read it completely, then follow it using the supplied plan as its arguments.

Adapt the canonical Claude delegation instructions to Codex as follows:

- Treat references to the `Agent` tool and `subagent_type` as calls to Codex's `spawn_agent` tool with `agent_type` set to the plan task's `agent` field.
- Resolve `backend`, `frontend`, `database`, `test`, and `docs` through the custom Codex agents discovered from `.codex/agents/` or `~/.codex/agents/`; do not look for them only under `~/.claude/agents/`.
- Give every editing agent explicit ownership of its task scope and state that it is not alone in the codebase, must preserve other agents' edits, and must accommodate concurrent changes.
- Keep the orchestrator read-only for implementation files. It may run validation and inspect diffs; delegate fixes back to the owning agent.

Preserve the canonical workflow's dependency ordering, role scopes, validation loops, reporting, and external-action approval boundaries. Where Claude-specific tool syntax conflicts with this adapter, this adapter takes precedence.

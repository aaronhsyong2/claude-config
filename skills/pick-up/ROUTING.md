# Routing Table

How `/pick-up` maps triaged issues to downstream workflows.

## Primary Routes

| Category | State | Route | Why |
|----------|-------|-------|-----|
| `bug` | `ready-for-agent` | `/diagnose` | Self-contained 6-phase loop: feedback loop → reproduce → hypothesize → instrument → fix → regression test. Runs autonomously. |
| `bug` | `ready-for-human` | `/diagnose` | Same loop. Agent pauses at checkpoints needing human input (environment access, design judgment, manual testing). |
| `enhancement` | `ready-for-agent` | `/prp-plan` → `/prp-implement` | Agent brief has clear acceptance criteria and scope. PRP captures codebase patterns, plans, executes with validation. No questions needed. |
| `enhancement` | `ready-for-human` | `/feature-dev` | Triage flagged judgment calls needed. Feature-dev's interactive phases (discover → explore → clarify → architecture → implement) resolve ambiguity before committing to code. |

## What to Pass to Each Route

### `/diagnose`

Pass as context:
- Agent brief summary
- Current behavior (the bug)
- Desired behavior (the fix)
- Reproduction steps (if in agent brief)
- Acceptance criteria (used to verify fix)

### `/prp-plan`

Pass as the feature description argument:
- Agent brief summary as the feature description
- Acceptance criteria (becomes the plan's acceptance criteria)
- Out of scope (becomes the plan's "NOT Building" section)
- Key interfaces from agent brief (guides codebase exploration)

After `/prp-plan` produces a plan file:
1. Present plan summary to user
2. Wait for user confirmation
3. Invoke `/prp-implement <plan-path>`

### `/feature-dev`

Pass as context:
- Full agent brief
- Why it's `ready-for-human` (from triage notes)
- Acceptance criteria
- Out of scope

Feature-dev will handle its own exploration and questioning phases.

## Decision Signals

When the routing table is ambiguous, use these signals to decide.

### Bug vs Enhancement (category unclear)

| Signal | Points to |
|--------|-----------|
| "X is broken / throws / fails" | `bug` |
| "X should do Y but does Z" | `bug` |
| "Add X / support Y / enable Z" | `enhancement` |
| "Change X behavior to Y" | `enhancement` (unless Y is documented behavior that regressed) |

### Agent vs Human (state unclear)

| Signal | Points to |
|--------|-----------|
| Acceptance criteria are testable and specific | `ready-for-agent` |
| Requires choosing between design alternatives | `ready-for-human` |
| Needs access to external systems for testing | `ready-for-human` |
| Purely internal logic change | `ready-for-agent` |
| Touches user-facing UX with no mockup | `ready-for-human` |

## Pipeline Context

This skill sits at the end of the idea-to-implementation pipeline:

```
/grill-me        → stress-test the idea (conversation)
/to-prd          → synthesize into PRD (GitHub issue)
/to-issues       → break into vertical slices (GitHub issues)
/triage          → classify + write agent brief (labels + comment)
/pick-up #N      → route to right workflow (this skill)
  ├── bug        → /diagnose
  └── enhancement
      ├── clear  → /prp-plan → /prp-implement
      └── unclear → /feature-dev
```

## Extending This Table

To add a new route:
1. Add a row to the "Primary Routes" table
2. Add a "What to Pass" section for the new downstream skill
3. Update decision signals if the new route introduces ambiguity

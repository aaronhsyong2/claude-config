# Routing Table

How `/pick-up` maps triaged issues to downstream workflows.

## Primary Routes

| Category | State | Route | Why |
|----------|-------|-------|-----|
| `bug` | `ready-for-agent` | `/diagnosing-bugs` | Self-contained diagnosis loop: tight feedback loop → minimise → hypothesise → instrument → fix → regression test. Runs autonomously. |
| `bug` | `ready-for-human` | `/diagnosing-bugs` | Same loop. Agent pauses at checkpoints needing human input (environment access, design judgment, manual testing). |
| `enhancement` | `ready-for-agent` | `/prp-plan-team` → `/prp-implement-team` | Agent brief has clear acceptance criteria and scope. PRP captures codebase patterns, plans with agent tags, delegates to domain agents. No questions needed. |
| `enhancement` | `ready-for-human` | `/grill-with-docs` → `/prp-plan-team` | Triage flagged judgment calls needed. Grilling resolves the ambiguity by interview and leaves the paper trail in `CONTEXT.md` and `docs/decisions/`; the sharpened brief then plans as normal. |

## What to Pass to Each Route

### `/diagnosing-bugs`

Pass as context:
- Agent brief summary
- Current behavior (the bug)
- Desired behavior (the fix)
- Reproduction steps (if in agent brief)
- Acceptance criteria (used to verify fix)

### `/prp-plan-team`

Pass as the feature description argument:
- Agent brief summary as the feature description
- Acceptance criteria (becomes the plan's acceptance criteria)
- Out of scope (becomes the plan's "NOT Building" section)
- Key interfaces from agent brief (guides codebase exploration)

After `/prp-plan-team` produces a plan file:
1. Present plan summary to user
2. Wait for user confirmation
3. Invoke `/prp-implement-team <plan-path>`

### `/grill-with-docs` → `/prp-plan-team`

Pass as context:
- Full agent brief
- Why it's `ready-for-human` (from triage notes)
- Acceptance criteria
- Out of scope

`/grill-with-docs` runs the interview to settle the judgment calls, updating `CONTEXT.md` and `docs/decisions/` inline as decisions crystallise. When the tree is resolved, hand the sharpened brief to `/prp-plan-team` exactly as in the `ready-for-agent` route above.

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
/grill-with-docs → stress-test the idea, update CONTEXT.md + ADRs
/to-spec         → synthesize into a spec (tracker issue)
/to-tickets      → break into tracer-bullet tickets with blocking edges
/to-pr-plan      → group tickets into PR batches
/pick-up #N      → route to right workflow (this skill)
  ├── bug        → /diagnosing-bugs
  └── enhancement
      ├── clear  → /prp-plan-team → /prp-implement-team
      └── unclear → /grill-with-docs → /prp-plan-team

/triage is NOT in this chain. It is the on-ramp for issues you did not
create - inbound bugs and feature requests - which it turns into
agent-ready issues that /pick-up then routes. Tickets produced by
/to-tickets are already agent-ready; do not triage them.
```

## Extending This Table

To add a new route:
1. Add a row to the "Primary Routes" table
2. Add a "What to Pass" section for the new downstream skill
3. Update decision signals if the new route introduces ambiguity

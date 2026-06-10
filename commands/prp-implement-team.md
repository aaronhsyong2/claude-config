---
description: Execute an implementation plan with rigorous validation loops (orchestrator — delegates to domain agents)
argument-hint: <path/to/plan.md>
---

> Adapted from PRPs-agentic-eng by Wirasm. Part of the PRP workflow series.
> Orchestrator fork: delegates each task to its assigned domain agent instead of implementing directly.

# PRP Implement (Orchestrator)

Execute a plan file step-by-step with continuous validation. Every change is verified immediately — never accumulate broken state.

**Core Philosophy**: Validation loops catch mistakes early. Run checks after every change. Fix issues immediately.

**Golden Rule**: If a validation fails, fix it before moving on. Never accumulate broken state.

**Orchestrator Rule**: The orchestrator does NOT edit files. It delegates each task to the assigned domain agent, validates the result, and re-delegates on failure.

---

## Phase 0 — DETECT

### Package Manager Detection

| File Exists | Package Manager | Runner |
|---|---|---|
| `bun.lockb` | bun | `bun run` |
| `pnpm-lock.yaml` | pnpm | `pnpm run` |
| `yarn.lock` | yarn | `yarn` |
| `package-lock.json` | npm | `npm run` |
| `pyproject.toml` or `requirements.txt` | uv / pip | `uv run` or `python -m` |
| `Cargo.toml` | cargo | `cargo` |
| `go.mod` | go | `go` |

### Validation Scripts

Check `package.json` (or equivalent) for available scripts:

```bash
# For Node.js projects
cat package.json | grep -A 20 '"scripts"'
```

Note available commands for: type-check, lint, test, build.

---

## Phase 1 — LOAD

Read the plan file:

```bash
cat "$ARGUMENTS"
```

Extract these sections from the plan:
- **Summary** — What is being built
- **Concern → Path Map** — Agent concern to repo path mapping
- **Patterns to Mirror** — Code conventions to follow
- **Files to Change** — What to create or modify
- **Step-by-Step Tasks** — Implementation sequence (with agent/scope/validation metadata)
- **Agent Assignments** — Summary table of task → agent → scope
- **Validation Commands** — How to verify correctness
- **Acceptance Criteria** — Definition of done

If the file doesn't exist or isn't a valid plan:
```
Error: Plan file not found or invalid.
Run /prp-plan-team <feature-description> to create a plan first.
```

**CHECKPOINT**: Plan loaded. All sections identified. Tasks parsed with agent assignments.

---

## Phase 2 — PREPARE

### Git State

```bash
git branch --show-current
git status --porcelain
```

### Branch Decision

| Current State | Action |
|---|---|
| On feature branch | Use current branch |
| On main, clean working tree | Create feature branch: `git checkout -b feat/{plan-name}` |
| On main, dirty working tree | **STOP** — Ask user to stash or commit first |
| In a git worktree for this feature | Use the worktree |

### Sync Remote

```bash
git pull --rebase origin $(git branch --show-current) 2>/dev/null || true
```

**CHECKPOINT**: On correct branch. Working tree ready. Remote synced.

---

## Phase 3 — EXECUTE

**CRITICAL: You are the ORCHESTRATOR. You must NOT use Edit, Write, or any file-modification
tool yourself. You MUST delegate every implementation task to a domain agent using the Agent
tool. If you catch yourself about to edit a file, STOP — that is the agent's job.**

### Parse Tasks

From the plan's `## Step-by-Step Tasks` section, collect all `### Task` blocks in document
order. For each block, parse the YAML metadata (`id`, `agent`, `scope`, `depends_on`,
`validation`, `parallelizable`) and the prose fields (`Goal`, `Mirror`, `Acceptance`).

### Delegation Loop

For each task in document order, respecting `depends_on` (a task never starts before its
dependencies are `done`). Never run two code-editing tasks concurrently (shared working tree).

1. **Delegate** — You MUST call the **Agent tool** with `subagent_type` set to the task's
   `agent` field (one of: `backend`, `frontend`, `database`, `test`, `docs`). These correspond
   to agent definitions in `~/.claude/agents/`. Pass this exact prompt — nothing more:

   ```
   Task <id>: <heading>
   Goal: <Goal>
   Scope (you may ONLY modify these paths): <scope globs>
   Mirror these patterns: <Mirror>
   Acceptance criteria: <Acceptance bullets>
   Validation command: <validation>
   When done, report files changed, validation result, and any OPEN QUESTION.
   ```

   Example Agent tool call for a backend task:
   ```
   Agent(subagent_type="backend", description="Implement T2 rate-limit middleware",
         prompt="Task T2: Add rate-limit middleware\nGoal: ...\nScope: ...")
   ```

   **Do NOT implement the task yourself. Do NOT use Edit/Write. Only the Agent tool.**

2. **Validate (golden rule)** — After the agent returns:
   - Run the task's `validation` command.
   - Run the plan's global validation levels (static → unit → build → integration → edge).
   - Run `git diff --name-only` and confirm every changed path matches the task's `scope`
     globs. Flag any out-of-scope edits.
   - **Pass:** mark the task `done`, continue to next task.
   - **Fail / out-of-scope / OPEN QUESTION:** re-delegate the SAME task to the SAME agent
     with the failure detail appended. Never proceed with broken state. After 2 retries,
     stop and surface the task to the user.

3. **Track progress** — Log: `[done] Task <id>: <heading> — agent: <agent> — complete`

### Handling Agent Responses

- If agent returns OPEN QUESTION: surface to user, do not proceed until resolved.
- If agent reports files outside scope: revert those files (`git checkout -- <file>`),
  re-delegate with scope reminder.
- Deviations noted by agents are captured in the report.

**CHECKPOINT**: All tasks executed. Deviations logged.

---

## Phase 4 — VALIDATE

Run all validation levels from the plan. Fix issues at each level before proceeding.

### Level 1: Static Analysis

```bash
# Type checking — zero errors required
[project type-check command]

# Linting — fix automatically where possible
[project lint command]
[project lint-fix command]
```

If lint errors remain after auto-fix, fix manually.

### Level 2: Unit Tests

Write tests for every new function (as specified in the plan's Testing Strategy).

```bash
[project test command for affected area]
```

- Every function needs at least one test
- Cover edge cases listed in the plan
- If a test fails → fix the implementation (not the test, unless the test is wrong)

### Level 3: Build Check

```bash
[project build command]
```

Build must succeed with zero errors.

### Level 4: Integration Testing (if applicable)

```bash
# Start server, run tests, stop server
[project dev server command] &
SERVER_PID=$!

# Wait for server to be ready (adjust port as needed)
SERVER_READY=0
for i in $(seq 1 30); do
  if curl -sf http://localhost:PORT/health >/dev/null 2>&1; then
    SERVER_READY=1
    break
  fi
  sleep 1
done

if [ "$SERVER_READY" -ne 1 ]; then
  kill "$SERVER_PID" 2>/dev/null || true
  echo "ERROR: Server failed to start within 30s" >&2
  exit 1
fi

[integration test command]
TEST_EXIT=$?

kill "$SERVER_PID" 2>/dev/null || true
wait "$SERVER_PID" 2>/dev/null || true

exit "$TEST_EXIT"
```

### Level 5: Edge Case Testing

Run through edge cases from the plan's Testing Strategy checklist.

**CHECKPOINT**: All 5 validation levels pass. Zero errors.

---

## Phase 5 — REPORT

### Create Implementation Report

```bash
mkdir -p .claude/PRPs/reports
```

Write report to `.claude/PRPs/reports/{plan-name}-report.md`:

```markdown
# Implementation Report: [Feature Name]

## Summary
[What was implemented]

## Assessment vs Reality

| Metric | Predicted (Plan) | Actual |
|---|---|---|
| Complexity | [from plan] | [actual] |
| Confidence | [from plan] | [actual] |
| Files Changed | [from plan] | [actual count] |

## Tasks Completed

| # | Task | Agent | Status | Notes |
|---|---|---|---|---|
| T1 | [task name] | [agent] | [done] Complete | |
| T2 | [task name] | [agent] | [done] Complete | Deviated — [reason] |

## Validation Results

| Level | Status | Notes |
|---|---|---|
| Static Analysis | [done] Pass | |
| Unit Tests | [done] Pass | N tests written |
| Build | [done] Pass | |
| Integration | [done] Pass | or N/A |
| Edge Cases | [done] Pass | |

## Files Changed

| File | Action | Lines | Agent |
|---|---|---|---|
| `path/to/file` | CREATED | +N | [agent] |
| `path/to/file` | UPDATED | +N / -M | [agent] |

## Scope Compliance
[List any out-of-scope edits detected and how they were handled, or "All edits within scope"]

## Deviations from Plan
[List any deviations with WHAT and WHY, or "None"]

## Issues Encountered
[List any problems and how they were resolved, or "None"]

## Tests Written

| Test File | Tests | Coverage |
|---|---|---|
| `path/to/test` | N tests | [area covered] |

## Next Steps
- [ ] Code review via `/review-pr`
- [ ] Create PR via `/prp-pr`
```

### Update PRD (if applicable)

If this implementation was for a PRD phase:
1. Update the phase status from `in-progress` to `complete`
2. Add report path as reference

### Archive Plan

```bash
mkdir -p .claude/PRPs/plans/completed
mv "$ARGUMENTS" .claude/PRPs/plans/completed/
```

**CHECKPOINT**: Report created. PRD updated. Plan archived.

---

## Phase 6 — OUTPUT

Report to user:

```
## Implementation Complete

- **Plan**: [plan file path] → archived to completed/
- **Branch**: [current branch name]
- **Status**: [done] All tasks complete

### Validation Summary

| Check | Status |
|---|---|
| Type Check | [done] |
| Lint | [done] |
| Tests | [done] (N written) |
| Build | [done] |
| Integration | [done] or N/A |

### Agent Summary

| Agent | Tasks | Status |
|---|---|---|
| database | N | [done] |
| backend | N | [done] |
| frontend | N | [done] |
| test | N | [done] |
| docs | N | [done] |

### Files Changed
- [N] files created, [M] files updated

### Deviations
[Summary or "None — implemented exactly as planned"]

### Artifacts
- Report: `.claude/PRPs/reports/{name}-report.md`
- Archived Plan: `.claude/PRPs/plans/completed/{name}.plan.md`

### PRD Progress (if applicable)
| Phase | Status |
|---|---|
| Phase 1 | [done] Complete |
| Phase 2 | [next] |
| ... | ... |

> Next step: Run `/review-pr` to review changes, or `/prp-pr` to create a pull request.
```

---

## Handling Failures

### Type Check Fails
1. Read the error message carefully
2. Fix the type error in the source file
3. Re-run type-check
4. Continue only when clean

### Tests Fail
1. Identify whether the bug is in the implementation or the test
2. Fix the root cause (usually the implementation)
3. Re-run tests
4. Continue only when green

### Lint Fails
1. Run auto-fix first
2. If errors remain, fix manually
3. Re-run lint
4. Continue only when clean

### Build Fails
1. Usually a type or import issue — check error message
2. Fix the offending file
3. Re-run build
4. Continue only when successful

### Integration Test Fails
1. Check server started correctly
2. Verify endpoint/route exists
3. Check request format matches expected
4. Fix and re-run

**Note**: For all failure types during Phase 3, the orchestrator re-delegates to the same agent with the failure detail rather than fixing directly. During Phase 4 (global validation), the orchestrator identifies which agent's concern the failure falls under and delegates the fix to that agent.

---

## Success Criteria

- **TASKS_COMPLETE**: All tasks from the plan executed via domain agents
- **TYPES_PASS**: Zero type errors
- **LINT_PASS**: Zero lint errors
- **TESTS_PASS**: All tests green, new tests written
- **BUILD_PASS**: Build succeeds
- **SCOPE_CLEAN**: All edits within declared task scopes
- **REPORT_CREATED**: Implementation report saved
- **PLAN_ARCHIVED**: Plan moved to `completed/`

---

## Next Steps

- Run `/review-pr` to review changes
- Run `/prp-commit` to commit with a descriptive message
- Run `/prp-pr` to create a pull request
- Run `/prp-plan-team <next-phase>` if the PRD has more phases

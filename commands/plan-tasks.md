# Plan Tasks for Pi Orchestrator

Break down a project or feature into executable tasks for the Pi task orchestrator. You (Claude Code on Opus) handle the strategic planning; Pi handles execution.

## Arguments

$ARGUMENTS — description of the work to plan. Can be a feature, bug fix, refactor, or entire project.

## Behavior

1. **Analyze the codebase** — Read relevant files to understand the current state. Use Glob, Grep, Read tools to explore.
2. **Ask 2-3 clarifying questions** — Before creating tasks, ask about edge cases, tradeoffs, and constraints. Wait for answers.
3. **Design the plan** — Break the work into 2-10 discrete tasks, ordered by dependency. Each task should be completable by a coding agent in one session.
4. **Write task files** — Write each task as a JSON file to `.pi/tasks/` in the current project.

## Task File Format

Each task is a JSON file at `.pi/tasks/TASK-N.json` with this exact structure:

```json
{
  "id": "TASK-1",
  "title": "Short imperative title",
  "phase": "ready",
  "content": "Detailed description of what to implement.\nInclude relevant file paths, function names, and expected behavior.",
  "created": "2026-04-27T12:00:00.000Z",
  "updated": "2026-04-27T12:00:00.000Z",
  "acceptanceCriteria": [
    "Criterion 1 that must be true when done",
    "Criterion 2 — be specific and testable"
  ],
  "plan": {
    "goal": "One-line goal",
    "steps": [
      "Step 1: specific action with file paths",
      "Step 2: next action"
    ],
    "validation": [
      "How to verify step 1 worked",
      "How to verify step 2 worked"
    ]
  },
  "history": []
}
```

## Counter File

Before writing tasks, read `.pi/tasks/.task-counter.json` to get the current counter. If it doesn't exist, start at 0. After writing all tasks, update the counter to the highest task number.

```json
{"counter": 5}
```

## Rules

- Set `phase` to `"ready"` (not backlog) since you're providing criteria and plans — these are ready for immediate execution.
- Every task MUST have at least one acceptance criterion.
- Every task MUST have a plan with goal, steps, and validation.
- Task content should include specific file paths, function names, and expected behavior — the executing agent (Pi worker) will only see the task, not this conversation.
- Order tasks by dependency. Note dependencies in the content field (e.g., "Depends on TASK-1 being complete").
- Keep tasks focused — one logical unit of work each. A coding agent should complete each in one session.
- Create the `.pi/tasks/` directory if it doesn't exist.

## Execution Workflow (for context)

When Pi executes these tasks:
1. Worker agent implements the task, making WIP commits after each step
2. Worker writes progress to `.pi/tasks/<TASK-ID>-progress.md` for crash recovery
3. Reviewer agent runs build/lint/types/tests/secret-scan
4. On approval: reviewer squashes WIP commits into one clean commit
5. On rejection: task goes back to ready for rework, WIP commits stay as checkpoints

## Output

After writing all task files, show a summary table:

| ID | Title | Criteria | Steps |
|----|-------|----------|-------|
| TASK-1 | ... | 3 | 4 |

Then tell the user: "Tasks are ready. Open Pi and run `/board` to see them, or `/queue start` to auto-execute."

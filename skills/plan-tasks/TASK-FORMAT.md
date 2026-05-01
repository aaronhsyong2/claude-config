# Task File Format

Schema and rules for Pi orchestrator task files.

## File Location

Each task is a JSON file at `.pi/tasks/TASK-N.json`. Create the directory if it doesn't exist.

## Schema

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

`.pi/tasks/.task-counter.json`:

```json
{"counter": 5}
```

Read before writing tasks. If missing, start at 0. Update after writing all tasks.

## Rules

- Set `phase` to `"ready"` — these have criteria and plans, ready for immediate execution.
- Every task MUST have at least one acceptance criterion.
- Every task MUST have a plan with goal, steps, and validation.
- Task content should include specific file paths, function names, and expected behavior — the executing agent only sees the task, not the planning conversation.
- Order tasks by dependency. Note dependencies in the content field (e.g., "Depends on TASK-1 being complete").
- Keep tasks focused — one logical unit of work each.

## Execution Workflow

When Pi executes these tasks:

1. Worker agent implements the task, making WIP commits after each step.
2. Worker writes progress to `.pi/tasks/<TASK-ID>-progress.md` for crash recovery.
3. Reviewer agent runs build/lint/types/tests/secret-scan.
4. On approval: reviewer squashes WIP commits into one clean commit.
5. On rejection: task goes back to ready for rework, WIP commits stay as checkpoints.

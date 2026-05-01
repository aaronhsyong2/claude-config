---
name: plan-tasks
description: Plan tasks for Pi orchestrator. Use when user wants to break down work into executable tasks for Pi, create a task board, or plan implementation steps.
---

# Plan Tasks

Break down a project or feature into executable tasks for the Pi task orchestrator. You (Claude Code on Opus) handle strategic planning; Pi handles execution.

See [TASK-FORMAT.md](TASK-FORMAT.md) for the task file schema and rules.

## Process

### 1. Analyze the codebase

Read relevant files to understand the current state. Use Glob, Grep, Read tools to explore.

### 2. Ask clarifying questions

Ask 2-3 questions about edge cases, tradeoffs, and constraints before creating tasks. Wait for answers.

### 3. Design the plan

Break the work into 2-10 discrete tasks, ordered by dependency. Each task should be completable by a coding agent in one session.

### 4. Write task files

Write each task as a JSON file to `.pi/tasks/` in the current project. See [TASK-FORMAT.md](TASK-FORMAT.md) for the exact schema.

### 5. Update counter

Read `.pi/tasks/.task-counter.json` to get the current counter (start at 0 if missing). After writing all tasks, update to the highest task number.

### 6. Present summary

Show a summary table and tell the user: "Tasks are ready. Open Pi and run `/board` to see them, or `/queue start` to auto-execute."

| ID | Title | Criteria | Steps |
|----|-------|----------|-------|
| TASK-1 | ... | 3 | 4 |

## Arguments

$ARGUMENTS — description of the work to plan. Can be a feature, bug fix, refactor, or entire project.

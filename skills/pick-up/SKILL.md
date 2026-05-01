---
name: pick-up
description: Pick up a triaged issue and route it to the right plan/execute workflow. Use when user wants to start working on a triaged issue, says "pick up", "work on", or references an issue number after triage.
---

# Pick Up

Take a triaged issue off the board and route it to the right workflow based on its labels and agent brief.

See [ROUTING.md](ROUTING.md) for the full routing table and examples.

The issue tracker and triage label vocabulary should have been provided to you — run `/setup-matt-pocock-skills` if not.

## Process

### 1. Fetch the issue

Read the argument as an issue reference (number, URL, or path). Fetch the full issue from the issue tracker: body, comments, labels.

If no argument given, query the issue tracker for issues labeled `ready-for-agent` or `ready-for-human`, present them, and let the user pick.

### 2. Validate triage state

The issue must have both a category label and a state label from triage:

- **Category:** `bug` or `enhancement`
- **State:** `ready-for-agent` or `ready-for-human`

If either label is missing, stop and tell the user to run `/triage` on the issue first. Do not guess labels.

### 3. Find the agent brief

Look for an "Agent Brief" comment on the issue (posted by `/triage`). Extract: summary, current/desired behavior, acceptance criteria, out of scope, and why it's `ready-for-human` (if applicable).

If no agent brief exists, ask the user whether to proceed with just the issue body or run `/triage` first.

### 4. Check blockers

Read the issue body for a "Blocked by" section (added by `/to-issues`). If blockers exist, check whether blocking issues are closed/resolved. If any are still open, warn the user and ask whether to proceed anyway.

### 5. Route

Classify the issue using the routing table in [ROUTING.md](ROUTING.md). Present the recommended route and reasoning to the user. Wait for confirmation before invoking.

### 6. Invoke

Run the chosen skill, passing the issue context (agent brief body, acceptance criteria, relevant issue details) as input. See [ROUTING.md](ROUTING.md) for what to pass to each downstream skill.

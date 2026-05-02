---
name: to-pr-plan
description: Group issues from an epic into PR batches with dependency ordering and branch naming. Use when user wants to create a PR plan, group issues into PRs, or prepare issues for orchestrated execution.
---

# To PR Plan

Group issues from an epic into logical PR batches. Interactive — proposes groupings, user refines, skill writes the plan via `/project-docs`.

This skill sits between `/to-issues` and `/triage` in the pipeline:

```
/grill-me → /to-prd → /to-issues → /to-pr-plan → /triage → /pick-up
```

See [FORMAT.md](FORMAT.md) for the PR plan document format (contract with the orchestrator).
See [SOURCES.md](SOURCES.md) for supported issue sources and configuration.

## Process

### 1. Determine issue source

Check for a source configuration. See [SOURCES.md](SOURCES.md) for details.

**Resolution order:**
1. Explicit argument: `/to-pr-plan github:21` or `/to-pr-plan local:issues/`
2. Project config: `.orchestrator/config.json` → `issue_source` field
3. Auto-detect: if `issues/` directory exists, use local. Otherwise attempt GitHub via `gh`.

### 2. Fetch issues

**GitHub source:**
```bash
gh issue list -R <repo> --state open --limit 100 --json number,title,body,labels
```
Filter to issues whose body contains `## Parent` referencing the epic.

**Local source:**
Read all `.md` files from the issues directory. Each file follows the standard issue template (Parent, What to build, Acceptance criteria, Blocked by). The filename or a frontmatter `id` field serves as the issue identifier.

### 3. Parse dependencies

For each issue, extract the `## Blocked by` section. Build a dependency graph:

- Parse issue references from the blocked-by text (`#NN` for GitHub, filename/id for local)
- "None" or "can start immediately" = no blockers
- Resolved blockers (closed on GitHub, or marked `status: done` locally) = not a constraint
- Blockers from outside this epic = flag to user

### 4. Propose PR groupings

Analyze issues and propose groupings based on:

- **Same pattern:** Issues following the same mechanical change across different files
- **Sequential chain:** Issues where one blocks the next in a tight chain within the same domain
- **Same migration:** Issues moving logic from the same source to the same destination pattern
- **Solo:** Issues that touch many files or are large enough to warrant their own PR

Present each proposed group:

| Field | Description |
|-------|-------------|
| **PR N** | Group number |
| **Title** | Short description of the group |
| **Issues** | List of issue identifiers and titles |
| **Grouping reason** | Why these belong together |
| **Branch prefix** | Suggested prefix (see [SOURCES.md](SOURCES.md) for defaults) |
| **Dependencies** | Which other PR groups must complete first |

Also show the proposed dependency graph between PR groups.

### 5. Interactive refinement

Ask the user:

- Does the grouping feel right? Should any groups be merged or split?
- Are the branch prefixes correct?
- Are the inter-group dependencies correct?
- Are there issues that should be standalone instead of grouped?
- Any groups that should be reordered?

Iterate until the user approves. This step is HIGH interaction — similar to `/grill-me`.

### 6. Confirm branch names

Generate branch names using the configured naming pattern (see [SOURCES.md](SOURCES.md)):

- Default format: `<prefix>/issue-<range>`
- Consecutive issue numbers compress to range: `30-33` not `30-31-32-33`
- Non-consecutive numbers list individually: `22-24-25`

Present the full list of branch names for confirmation.

### 7. Write the PR plan

Invoke `/project-docs create guide <epic-slug>-pr-plan` to write the document.

The document MUST follow the format in [FORMAT.md](FORMAT.md) exactly — the orchestrator parses this format.

### 8. Update pipeline context

After writing, remind the user:

- Next step: `/triage` each issue (or batch triage the epic)
- The PR plan is now the source of truth for orchestrated execution
- Changes to grouping require updating this document

## Arguments

$ARGUMENTS

# PR Plan Document Format

This is the contract between `/to-pr-plan` and the orchestrator. The orchestrator parses this format to build its work queue. Do not deviate from this structure.

## Document Structure

The PR plan is a guide-category doc written via `/project-docs`. It lives at `docs/guide/<epic-slug>-pr-plan.md`.

### Frontmatter

```yaml
---
title: "<Epic Title> — PR Plan"
category: guide
tags:
  - pr-grouping
  - <domain-tag>
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: active
related:
  - "[Parent Epic: #NN](https://github.com/<org>/<repo>/issues/NN)"
---
```

For local issue sources, the `related` field links to the issues directory or parent file instead.

### Header

```markdown
# <Epic Title> — PR Plan

<One-line description of why these issues are grouped this way.>
```

### PR Group Sections

Each PR group is an H2 section. The orchestrator parses these sections to build the work queue.

```markdown
## PR N: <Short Description>

**Branch:** `<prefix>/issue-<range>`
**Status:** pending | in-progress | done | merged

| Issue | Title | Status |
|-------|-------|--------|
| #30 | Extract owners.tsx server functions | Open |
| #31 | Extract clients.tsx server functions | Open |
```

#### Required fields

| Field | Format | Parsed by orchestrator |
|-------|--------|----------------------|
| Section heading | `## PR N: <title>` | Yes — PR group identifier |
| Branch | `**Branch:** \`<branch-name>\`` | Yes — worktree branch name |
| Status | `**Status:** <status>` | Yes — skip done/merged groups |
| Issue table | Markdown table with Issue, Title, Status columns | Yes — work items |

#### Status values

| Status | Meaning |
|--------|---------|
| `pending` | Not started, waiting for dependencies or scheduling |
| `in-progress` | Agent currently working on this group |
| `done` | All issues complete, PR created, awaiting review |
| `merged` | PR merged, group complete |

### Standalone Section (optional)

For issues that don't fit in any group:

```markdown
## Standalone

| Issue | Title | Notes |
|-------|-------|-------|
| #23 | Restructure lib/engine/ | Solo PR — touches many files |
```

Standalone issues are treated as individual PR groups with one issue each.

### Dependency Note (optional)

If inter-group dependencies exist, add a note after the group section:

```markdown
> Depends on: PR 1
```

The orchestrator also derives dependencies from the issues' `## Blocked by` sections, but this explicit note serves as a human-readable override.

## Parsing Rules

The orchestrator uses these regex patterns:

| Field | Pattern |
|-------|---------|
| PR group heading | `/^## PR (\d+): (.+)$/` |
| Branch | `/\*\*Branch:\*\*\s*`([^`]+)`/` |
| Status | `/\*\*Status:\*\*\s*(\w[\w-]*)/` |
| Issue ref (GitHub) | `/\| #(\d+) \|/` |
| Issue ref (local) | `/\| (\S+\.md) \|/` or `/\| (\d{3}-[\w-]+) \|/` |
| Dependency note | `/^>\s*Depends on:\s*(.+)$/` |

## Example

```markdown
---
title: "Deep Module Refactor — PR Plan"
category: guide
tags:
  - refactor
  - deep-module
  - pr-grouping
created: 2026-05-02
updated: 2026-05-02
status: active
related:
  - "[Parent Epic: #21](https://github.com/org/repo/issues/21)"
---

# Deep Module Refactor — PR Plan

Logical grouping of issues from the deep module refactor (#21) into PRs.

## PR 1: Type & Import Cleanup

**Branch:** `refactor/issue-22-24-25`
**Status:** merged

| Issue | Title | Status |
|-------|-------|--------|
| #22 | Extract inline types from route files | Closed |
| #24 | Fix await import() violations | Closed |
| #25 | Update CLAUDE.md with Tier 1 template | Closed |

## PR 2: Route Server Function Extractions

**Branch:** `refactor/issue-30-33`
**Status:** pending

| Issue | Title | Status |
|-------|-------|--------|
| #30 | Extract owners.tsx server functions | Open |
| #31 | Extract clients.tsx server functions | Open |
| #32 | Extract prospects.tsx server functions | Open |
| #33 | Extract settings.tsx server functions | Open |

## Standalone

| Issue | Title | Notes |
|-------|-------|-------|
| #23 | Restructure lib/engine/ | Solo PR — touches many files |
```

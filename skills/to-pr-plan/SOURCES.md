# Issue Sources

Configuration for where `/to-pr-plan` reads issues from and how branches are named.

## Source Types

### GitHub

Fetches issues via `gh` CLI. Requires `gh` authenticated and repo access.

**Argument format:** `github:<epic-number>` or just `<epic-number>` (default when GitHub is detected)

**Detection:** Auto-detected when the current directory is a git repo with a GitHub remote.

**Issue references:** `#NN` format (e.g., `#30`, `#31`)

### Local

Reads markdown files from a directory. Each file is one issue following the standard template (Parent, What to build, Acceptance criteria, Blocked by).

**Argument format:** `local:<path>` or `local:` (defaults to `issues/`)

**Detection:** Auto-detected when an `issues/` directory exists at the project root.

**Issue references:** Filename without extension (e.g., `001-extract-owners`, `002-extract-clients`)

**File format:**

```markdown
---
id: 001
title: Extract owners.tsx server functions
status: open | closed | done
labels:
  - enhancement
---

## Parent

epic-deep-module-refactor (filename of parent issue, or omit if standalone)

## What to build

<description>

## Acceptance criteria

- [ ] Criterion 1

## Blocked by

- 002-extract-types (filename reference)

Or "None - can start immediately" if no blockers.
```

## Project Configuration

In `.orchestrator/config.json`:

```json
{
  "issue_source": {
    "type": "github",
    "repo": "org/repo-name"
  },
  "branch_naming": {
    "pattern": "<prefix>/issue-<range>",
    "default_prefix": "feat",
    "prefixes": {
      "refactor": ["refactor", "restructure", "extract", "consolidate"],
      "feat": ["add", "create", "implement", "support"],
      "fix": ["fix", "bug", "patch", "resolve"],
      "test": ["test", "coverage", "regression"],
      "chore": ["update", "upgrade", "remove", "cleanup"]
    }
  }
}
```

### Branch naming fields

| Field | Description | Default |
|-------|-------------|---------|
| `pattern` | Branch name template. `<prefix>` and `<range>` are replaced. | `<prefix>/issue-<range>` |
| `default_prefix` | Fallback prefix when no keyword match | `feat` |
| `prefixes` | Map of prefix → title keywords for auto-suggestion | See above |

The auto-suggested prefix is based on keyword matching against the PR group title. The user always confirms or overrides during the interactive step.

### Local source fields

```json
{
  "issue_source": {
    "type": "local",
    "path": "issues/"
  }
}
```

## Resolution Order

1. **Explicit argument** takes priority: `github:21` or `local:issues/`
2. **Project config** (`.orchestrator/config.json` → `issue_source`)
3. **Auto-detect**: check for `issues/` directory, then GitHub remote

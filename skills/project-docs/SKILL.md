---
name: project-docs
description: Create, update, search, and manage project documentation in docs/ with consistent structure. Use when user wants to create docs, update docs, search docs, rebuild index, or check doc staleness.
---

# Project Docs

Manage project documentation in `docs/` following the conventions in `rules/common/documentation.md`.

See [TEMPLATES.md](TEMPLATES.md) for frontmatter templates per category.

## Subcommands

Parse `$ARGUMENTS` to determine intent:

- `create <category> <topic>` — New doc (categories: research, architecture, decision, guide, api)
- `update <path>` — Update existing doc, refresh `updated` field
- `search <query>` — Search docs by content, tags, or titles
- `index` — Rebuild `docs/INDEX.md`
- `status` — Show staleness report

## Workflows

### create

1. Ensure `docs/<category>/` exists (create if not).
2. Generate filename: kebab-case topic. ADRs use `NNN-slug.md` (zero-padded, next number).
3. Apply frontmatter template from [TEMPLATES.md](TEMPLATES.md).
4. Write file using bash heredoc (bypasses plugin write hooks):
   ```bash
   cat > docs/category/filename.md << 'EOF'
   content
   EOF
   ```
5. Rebuild `docs/INDEX.md`.
6. Confirm what was created and where.

### update

1. Read existing doc.
2. Apply changes.
3. Update `updated` field to today's date.
4. Write using bash heredoc.
5. Rebuild `docs/INDEX.md` if title or category changed.

### search

1. Grep `docs/` for query across content, frontmatter tags, and titles.
2. Present results with path, title, and excerpt.

### index

1. Scan all `.md` files in `docs/` subdirectories.
2. Parse frontmatter (title, category, status).
3. Rebuild `docs/INDEX.md` grouped by category, sorted alphabetically.
4. Exclude archived docs from main listing (list separately at bottom).

### status

1. Scan all docs for `updated` field.
2. Flag docs not updated in 90+ days as stale.
3. Flag docs with `status: draft` older than 30 days.
4. Present staleness report sorted by age.

## File Writing

Always use bash heredoc for writing `.md` files in `docs/`:

```bash
cat > docs/category/filename.md << 'EOF'
content
EOF
```

This ensures compatibility with all hook configurations.

## Arguments

$ARGUMENTS

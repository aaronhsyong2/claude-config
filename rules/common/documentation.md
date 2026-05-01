# Documentation Standards

## Structure

All project documentation lives in `docs/` at project root:

```
docs/
├── INDEX.md            # Auto-maintained directory
├── research/           # Library comparisons, domain research
├── architecture/       # System design, data flow, components
├── decisions/          # ADRs — why X over Y
├── guides/             # Setup, deployment, workflow how-tos
└── api/                # Endpoint docs, schema references
```

## Frontmatter

Every doc file requires YAML frontmatter:

```yaml
---
title: "Document Title"
category: research | architecture | decision | guide | api
tags:
  - kebab-case-tag
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: draft | active | archived
related:
  - "[Title](../category/file.md)"
---
```

## Rules

1. One topic per document — split if covering multiple concerns
2. Tags always kebab-case
3. Dates always ISO 8601 absolute
4. Cross-reference with standard markdown links (not wikilinks)
5. ASCII diagrams preferred over images for LLM readability
6. Update `updated` field on every modification
7. ADR filenames: `NNN-slug.md` with zero-padded numbers
8. Keep docs focused and scannable — no filler
9. Use `/project-docs` skill for creating and managing documentation

## When to Create Documentation

- **ADR**: When making a non-obvious technical decision
- **Architecture**: When designing or documenting system structure
- **Research**: When evaluating tools, libraries, or approaches
- **Guide**: When a process has 3+ steps that someone will repeat
- **API**: When exposing endpoints for consumption

## Agent Support

- Use `/project-docs` skill for all documentation operations
- Agents should read `docs/INDEX.md` for project documentation context

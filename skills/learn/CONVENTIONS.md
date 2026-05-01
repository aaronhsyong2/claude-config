# Vault Conventions

Formatting rules for the Obsidian vault. Both `/learn` and `/obsidian` follow these.

## Frontmatter

```yaml
frontmatter:
  index:
    - "[[../Indexes/IndexName|IndexName]]"
  tags:
    - tag-name
```

## Rules

- **Tags**: Always kebab-case, no spaces (e.g., `ruby-on-rails`, `load-testing`). Check existing tags with `mcp__obsidian__list_all_tags` before creating new ones to avoid duplicates.
- **Index links**: Use relative paths `[[../Indexes/IndexName|IndexName]]` in frontmatter.
- **Note location**: Knowledge notes go in `Notes/`.
- **Content style**: Concise, reference-friendly, include code examples where helpful. Use comparison tables when comparing technologies.
- **No duplicate notes**: Always search first with `mcp__obsidian__search_notes` before creating.
- **Template**: Check `Templates/Notes/Note Template.md` for the vault's note format.
- **Comparisons**: When comparing to technologies the user knows (TypeScript), include side-by-side comparisons.

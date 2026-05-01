# Vault Conventions

Formatting rules for the Obsidian vault. Shared with `/learn`.

## Frontmatter

```yaml
frontmatter:
  index:
    - "[[../Indexes/IndexName|IndexName]]"
  tags:
    - tag-name
```

## Rules

- **Tags**: Always kebab-case, no spaces (e.g., `ruby-on-rails`, `load-testing`, `blog-researched`). Check existing tags with `mcp__obsidian__list_all_tags` before creating new ones to avoid duplicates.
- **Index links**: Use relative paths `[[../Indexes/IndexName|IndexName]]` in frontmatter.
- **Note location**: Knowledge notes go in `Notes/`, blog ideas go in `Blog Ideas/`.
- **Index files**: Live in `Indexes/`, contain `# Title` and wikilinks to notes (e.g., `- [[Note Name]]`).
- **Content style**: Concise, reference-friendly, include code examples where helpful. Use comparison tables when comparing technologies.
- **Blog ideas**: Include sections for "What It Is", "Why This Matters", "Key Concepts to Cover", "Your Angle", and "Sources". Tag with `blog-researched` when research is complete.
- **No duplicate notes**: Always search first with `mcp__obsidian__search_notes` before creating. If a note exists, update it with `mcp__obsidian__patch_note`.
- **Template**: Check `Templates/Notes/Note Template.md` for the vault's note format.

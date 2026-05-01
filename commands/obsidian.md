# Obsidian — Manage notes in the Obsidian vault

Interface with the user's Obsidian vault via the Obsidian MCP tools, following vault conventions.

## Subcommands

Parse `$ARGUMENTS` to determine the subcommand:

- `note <topic>` — Create or update a knowledge note in `Notes/`
- `blog <topic>` — Create or update a blog idea in `Blog Ideas/`
- `index <name>` — Create or update an index in `Indexes/`
- `search <query>` — Search existing notes via `mcp__obsidian__search_notes`
- `save [topic]` — Extract learnings from current session and save to vault
- `tag <action>` — List all tags (`tag list`) or search by tag (`tag search <name>`)

If no subcommand is recognized, infer intent from the arguments.

## Vault Conventions (CRITICAL)

### Note Structure

All notes in `Notes/` and `Blog Ideas/` use this frontmatter:

```yaml
frontmatter:
  index:
    - "[[../Indexes/IndexName|IndexName]]"
  tags:
    - tag-name
```

### Rules

1. **Tags**: Always kebab-case, no spaces (e.g., `ruby-on-rails`, `load-testing`, `blog-researched`). Check existing tags with `mcp__obsidian__list_all_tags` before creating new ones to avoid duplicates.
2. **Index links**: Use relative paths `[[../Indexes/IndexName|IndexName]]` in frontmatter.
3. **Note location**: Knowledge notes go in `Notes/`, blog ideas go in `Blog Ideas/`.
4. **Index files**: Live in `Indexes/`, contain `# Title` and wikilinks to notes (e.g., `- [[Note Name]]`).
5. **Content style**: Concise, reference-friendly, include code examples where helpful. Use comparison tables when comparing technologies.
6. **Blog ideas**: Include sections for "What It Is", "Why This Matters", "Key Concepts to Cover", "Your Angle", and "Sources". Tag with `blog-researched` when research is complete.
7. **No duplicate notes**: Always search first with `mcp__obsidian__search_notes` before creating. If a note exists, update it with `mcp__obsidian__patch_note`.

## Workflow

### For `note` and `save`:

1. Search for existing notes on the topic using `mcp__obsidian__search_notes`.
2. Check existing tags with `mcp__obsidian__list_all_tags` to reuse tags.
3. If note exists, read it with `mcp__obsidian__read_note`, then update with `mcp__obsidian__patch_note`.
4. If new, create with `mcp__obsidian__write_note` in `Notes/` with proper frontmatter.
5. Check if a relevant index exists in `Indexes/`. If yes, update it to include the new note. If no matching index exists, mention it to the user.
6. Confirm what was saved and where.

### For `blog`:

1. Search `Blog Ideas/` for existing entries on the topic.
2. If new, create in `Blog Ideas/` with the blog idea template structure:
   - What It Is
   - Why This Matters
   - Key Concepts to Cover
   - Your Angle (reference user's experience from conversation context)
   - Sources (with links)
3. Tag with `blog-researched` plus relevant topic tags.
4. Update relevant indexes.

### For `index`:

1. Check if index exists in `Indexes/` with `mcp__obsidian__read_note`.
2. If exists, read current content and append new links.
3. If new, create with `# Title` heading and wikilinks to related notes.

### For `search`:

1. Use `mcp__obsidian__search_notes` with the query.
2. Present results with note paths and brief excerpts.
3. Offer to read any specific note if the user wants details.

### For `tag`:

1. `tag list` — Call `mcp__obsidian__list_all_tags` and display sorted by count.
2. `tag search <name>` — Search for notes with a specific tag.

## Arguments

$ARGUMENTS

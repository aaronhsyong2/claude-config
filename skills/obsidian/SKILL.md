---
name: obsidian
description: Manage notes in the Obsidian vault. Use when user wants to create, update, search, or organize notes, blog ideas, or indexes in Obsidian.
---

# Obsidian

Interface with the Obsidian vault via MCP tools, following vault conventions.

See [CONVENTIONS.md](CONVENTIONS.md) for vault formatting rules.

## Subcommands

Parse `$ARGUMENTS` to determine the subcommand:

- `note <topic>` — Create or update a knowledge note in `Notes/`
- `blog <topic>` — Create or update a blog idea in `Blog Ideas/`
- `index <name>` — Create or update an index in `Indexes/`
- `search <query>` — Search existing notes
- `save [topic]` — Extract learnings from current session and save to vault
- `tag <action>` — List all tags (`tag list`) or search by tag (`tag search <name>`)

If no subcommand is recognized, infer intent from the arguments.

## Workflows

### note / save

1. Search for existing notes using `mcp__obsidian__search_notes`.
2. Check existing tags with `mcp__obsidian__list_all_tags` to reuse tags.
3. If note exists, read with `mcp__obsidian__read_note`, then update with `mcp__obsidian__patch_note`.
4. If new, create with `mcp__obsidian__write_note` in `Notes/` with proper frontmatter.
5. Check if a relevant index exists in `Indexes/`. If yes, update it. If no match, mention to user.
6. Confirm what was saved and where.

### blog

1. Search `Blog Ideas/` for existing entries on the topic.
2. If new, create in `Blog Ideas/` with sections: What It Is, Why This Matters, Key Concepts to Cover, Your Angle, Sources.
3. Tag with `blog-researched` plus relevant topic tags.
4. Update relevant indexes.

### index

1. Check if index exists in `Indexes/` with `mcp__obsidian__read_note`.
2. If exists, read current content and append new links.
3. If new, create with `# Title` heading and wikilinks to related notes.

### search

1. Use `mcp__obsidian__search_notes` with the query.
2. Present results with note paths and brief excerpts.
3. Offer to read any specific note if user wants details.

### tag

1. `tag list` — Call `mcp__obsidian__list_all_tags` and display sorted by count.
2. `tag search <name>` — Search for notes with a specific tag.

## Arguments

$ARGUMENTS

---
name: learn
description: Save learnings to Obsidian vault. Use when user wants to capture knowledge, save a learning, or preserve something from the current session.
---

# Learn

Capture learnings from the current session and save them to the Obsidian vault.

See [CONVENTIONS.md](CONVENTIONS.md) for vault formatting rules.

## Process

### 1. Determine content

- If arguments provided, use them as the topic/content to save.
- If no arguments, review the current conversation and extract key learnings worth preserving.

### 2. Search for existing notes

Use `mcp__obsidian__search_notes` to check if a related note already exists in the vault. Avoid creating duplicates.

### 3. Save

- **Note exists** — Use `mcp__obsidian__patch_note` or `mcp__obsidian__write_note` (mode: append) to add new learnings.
- **New note** — Use `mcp__obsidian__write_note` to create it in `Notes/` with proper frontmatter (see [CONVENTIONS.md](CONVENTIONS.md)).

### 4. Confirm

Tell the user what was saved and where.

## Arguments

$ARGUMENTS

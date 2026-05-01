# Learn — Save learnings to Obsidian vault

Capture learnings from the current session and save them to the user's Obsidian vault using the Obsidian MCP tools.

## Behavior

1. **If arguments are provided**, use them as the topic/content to save.
2. **If no arguments**, review the current conversation and extract key learnings worth preserving.

## Steps

1. **Search existing notes** — Use `mcp__obsidian__search_notes` to check if a related note already exists in the vault.
2. **If note exists** — Use `mcp__obsidian__patch_note` or `mcp__obsidian__write_note` (mode: append) to add new learnings to the existing note.
3. **If note is new** — Use `mcp__obsidian__write_note` to create it in `Notes/` with proper frontmatter:
   ```
   frontmatter:
     index:
       - "[[../Indexes/Programming|Programming]]"
       - "[[../Indexes/Learning|Learning]]"
     tags: [relevant, tags, here]
   ```
4. **Confirm** — Tell the user what was saved and where.

## Formatting Rules

- Use the user's existing vault conventions (check `Templates/Notes/Note Template.md` for format).
- Index links use relative paths: `[[../Indexes/IndexName|IndexName]]`.
- Tags should be specific and reusable (e.g., "Rails", "TypeScript", "Docker", not "misc").
- Content should be concise, reference-friendly, and include code examples where helpful.
- When comparing to other technologies the user knows (TypeScript), include side-by-side comparisons.

## Arguments

$ARGUMENTS

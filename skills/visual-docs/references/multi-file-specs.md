# Multi-file specs — assembling one navigable document

Complex specifications read poorly as one giant Markdown file and poorly as
disconnected files. visual-docs assembles a set of part files into a single
self-contained HTML document with one TOC, one search box, and cross-section
navigation.

## Layout

```
docs-visual/auth-spec/
  index.md            # frontmatter + short intro; lists the parts
  01-overview.md      # one ## per part, drives a TOC section
  02-data.md
  03-api.md
  src/                # real source files pulled in by annotated-code (optional)
    auth.ts
```

## index.md

`index.md` carries the document frontmatter and a `parts:` list. The compiler
reads each part **in order**, strips any per-part frontmatter, and concatenates
the bodies. Anything in `index.md` below its frontmatter renders first, as the
intro.

```yaml
---
title: Session Auth Spec
mode: doc
updated: 2026-06-24
parts:
  - 01-overview.md
  - 02-data.md
  - 03-api.md
---

One-paragraph orientation before the parts.
```

## Conventions for big specs

- **One `##` heading per part** (start each part file with it). Those become the
  top-level TOC entries; `###` subsections nest under them. The reader collapses
  any `##` to skim structure.
- **Lead each part with its outcome** — what this slice delivers and what "done"
  means — before mechanics.
- **Anchor to real code.** Put load-bearing files in `:::annotated-code{file=…}`
  with paths relative to the doc directory (e.g. `src/auth.ts`). The spec then
  shows the actual source, not a paraphrase, and the line jumps work.
- **Decisions over menus.** Settle hard-to-reverse choices (wire format, public
  ids, data-model shape, auth boundaries) in the prose or a `decision` callout.
  Leave only genuinely-open choices for the single bottom `:::questions` block in
  the last part.
- **Keep parts focused.** One concern per part file; split rather than letting a
  part sprawl. Reorder by editing the `parts:` list — no content moves.

## Build

```bash
node skills/visual-docs/scripts/build.mjs docs-visual/auth-spec --out auth-spec.html --open
node skills/visual-docs/scripts/build.mjs docs-visual/auth-spec --watch   # iterate
```

The directory form looks for `index.md` first; if absent it falls back to the
first `*.md` in the directory. A single standalone file also works:
`build.mjs path/to/doc.md`.

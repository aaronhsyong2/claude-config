---
name: visual-docs
description: >-
  Turn plans, recaps, and complex multi-file spec documents into one
  self-contained, offline, interactive HTML file — diagrams, file maps,
  annotated code, tabs, collapsible sections, and in-page search. Fully local,
  no server, no hosted dependency. Quick to build, delete the file to tear down.
metadata:
  visibility: exported
---

# visual-docs

A fully-local alternative to the hosted Agent-Native `/visual-plan` and
`/visual-recap` skills. Author in a Markdown-superset; a bundled Node compiler
emits **one self-contained HTML file** with all CSS, JS, syntax highlighting,
and (when used) Mermaid inlined. Open it from `file://`, share it as a single
file, delete it to tear down. Nothing phones home; it renders with no network.

Use it for documentation, design docs, and especially **complex multi-file
specs** that read poorly as flat Markdown: the output gives a sticky table of
contents, collapsible sections, in-page section filtering, tabs, callouts,
side-by-side columns, inline diagrams, a file map, and annotated source pulled
from real files — so a long spec becomes navigable instead of a scroll.

## Why HTML output, not MDX

The hosted skills author MDX and need a running React toolchain (or a localhost
bridge to the hosted app) to view. That is neither fully local nor quick to tear
down. visual-docs keeps **authoring in Markdown** (easy to write and diff) and
compiles to a **disposable standalone HTML artifact**. MDX wins for live
component editing; self-contained HTML wins for local + portable + instant
teardown, which is the point of this skill.

## When to use

- A documentation page, design doc, ADR, or runbook that benefits from
  navigation, diagrams, and progressive disclosure.
- A **multi-file specification** — split across several `.md` parts — that should
  read as one navigable document.
- A plan you want to review as an artifact (`mode: plan`).
- A recap of a diff/PR/branch (`mode: recap`) — same blocks, summarizing work
  that exists.

Skip it for a one-paragraph answer or a trivial note; just write Markdown.

## Discipline

- **Research before authoring.** Read the real files, schema, and APIs. Name
  actual files and symbols. Pull load-bearing code into `annotated-code` blocks
  by path rather than retyping it.
- **Authoring is read-only.** Building a doc makes no source edits. For `plan`
  mode, present the built doc as the approval gate and wait before writing code.
- **The document stands alone.** A reader with no chat history should understand
  it. No "as discussed above" / "unlike the previous version" framing.
- **Use the right block, make it carry substance.** See
  `references/authoring.md` — it is the single source of truth for the block
  vocabulary and quality bar. Do not author blocks from memory.
- **Open questions go in one bottom `:::questions` block**, never scattered.

## Workflow

1. Decide the mode (`doc`, `plan`, `recap`) and whether it is single-file or a
   multi-file spec set. For multi-file specs read `references/multi-file-specs.md`.
2. One-time setup per machine: `cd skills/visual-docs/scripts && npm install`
   (vendors all deps; the build itself runs offline afterward).
3. Author the source under a doc directory:
   - `docs-visual/<slug>/index.md` to check it into a repo, **or**
   - `/tmp/visual-docs/<slug>/index.md` for private scratch.
   `index.md` carries frontmatter (`title`, `subtitle`, `mode`, `updated`, and
   optional `parts:` for multi-file specs). Read `references/authoring.md` for
   blocks; mirror the wireframe bar in `../visual-plan/references/wireframe.md`
   only if a UI plan needs mockups.
4. Build:
   ```bash
   node skills/visual-docs/scripts/build.mjs <dir> --out <slug>.html --open
   ```
   Use `--watch` while iterating. Report the output path to the user.
5. Before handoff, open the HTML and check it: sections collapse, TOC + search
   work, diagrams render, annotated-code line jumps land. Fix the compiler or
   `theme.css`/`runtime.js` if the look is wrong — never hand-edit a built file.
6. Teardown: delete the `.html` (and the scratch source dir if private).

## Compiler

`scripts/build.mjs` — `node build.mjs <dir|file> [--out f.html] [--open] [--watch]`.
Pipeline: gray-matter frontmatter → remark (gfm + directive + the visual-docs
block plugin) → rehype (raw, slug, mermaid passthrough, highlight.js line
wrapping, TOC) → one HTML file with `assets/theme.css`, `assets/runtime.js`, and
(only if the doc uses Mermaid) the vendored `mermaid.min.js` inlined.

A worked multi-file example lives in `examples/spec-demo/`; build it with
`cd scripts && npm run demo`.

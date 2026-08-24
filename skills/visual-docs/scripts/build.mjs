#!/usr/bin/env node
// visual-docs compiler: a markdown-superset doc set -> one self-contained,
// offline HTML file. No server, no network at view time. Delete the HTML to
// tear down.
//
// Usage:
//   node build.mjs <dir|file> [--out file.html] [--open] [--watch]
//
// <dir> contains index.md (frontmatter may list `parts:` for multi-file specs).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn, execFileSync } from 'node:child_process';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import {
  remarkDocBlocks,
  rehypeHighlightCode,
  rehypeMermaid,
} from './lib/directives.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function hastText(node) {
  if (node.type === 'text') return node.value;
  if (node.children) return node.children.map(hastText).join('');
  return '';
}

// rehype plugin: collect h2/h3 headings for the sticky table of contents.
function rehypeCollectToc(state) {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'h2' && node.tagName !== 'h3') return;
      const id = node.properties?.id;
      if (!id) return;
      state.toc.push({ depth: node.tagName === 'h2' ? 2 : 3, id, text: hastText(node) });
    });
  };
}

function renderToc(toc) {
  if (!toc.length) return '<p class="vd-toc-empty">No sections</p>';
  let html = '<ul class="vd-toc-list">';
  for (const item of toc) {
    html += `<li class="vd-toc-${item.depth}"><a href="#${item.id}" data-toc="${item.id}">${escapeHtml(
      item.text,
    )}</a></li>`;
  }
  return html + '</ul>';
}

// Assemble source markdown. Single file -> its content. Directory -> index.md,
// honoring an optional `parts:` list for multi-file specs.
function assembleSource(target) {
  const stat = fs.statSync(target);
  let baseDir;
  let indexPath;
  if (stat.isDirectory()) {
    baseDir = target;
    indexPath = path.join(target, 'index.md');
    if (!fs.existsSync(indexPath)) {
      const md = fs.readdirSync(target).find((f) => f.endsWith('.md'));
      if (!md) throw new Error(`No index.md or *.md found in ${target}`);
      indexPath = path.join(target, md);
    }
  } else {
    baseDir = path.dirname(target);
    indexPath = target;
  }

  const { data, content } = matter(fs.readFileSync(indexPath, 'utf8'));
  let body = content;
  if (Array.isArray(data.parts) && data.parts.length) {
    body = data.parts
      .map((part) => {
        const partPath = path.resolve(baseDir, part);
        const parsed = matter(fs.readFileSync(partPath, 'utf8'));
        return parsed.content.trim();
      })
      .join('\n\n');
  }
  return { meta: data, body, baseDir };
}

async function compile(target) {
  const { meta, body, baseDir } = assembleSource(target);
  const state = { toc: [], usesMermaid: false };

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkDocBlocks, { baseDir })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeMermaid, state)
    .use(rehypeHighlightCode)
    .use(rehypeCollectToc, state)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(body);

  return { meta, html: String(file), toc: state.toc, usesMermaid: state.usesMermaid };
}

function buildPage({ meta, html, toc, usesMermaid }) {
  const template = fs.readFileSync(path.join(HERE, 'template.html'), 'utf8');
  const themeCss = fs.readFileSync(path.join(HERE, 'assets', 'theme.css'), 'utf8');
  const runtimeJs = fs.readFileSync(path.join(HERE, 'assets', 'runtime.js'), 'utf8');

  let mermaidScript = '';
  if (usesMermaid) {
    const mermaidPath = path.join(HERE, 'node_modules', 'mermaid', 'dist', 'mermaid.min.js');
    if (fs.existsSync(mermaidPath)) {
      const lib = fs.readFileSync(mermaidPath, 'utf8');
      mermaidScript = `<script>${lib}\nwindow.__vdHasMermaid=true;</script>`;
    } else {
      mermaidScript = '<script>window.__vdHasMermaid=false;</script>';
    }
  }

  const mode = meta.mode || 'doc';
  const metaLine = [
    meta.subtitle ? escapeHtml(meta.subtitle) : '',
    meta.updated ? `Updated ${escapeHtml(meta.updated)}` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  // Use function replacements: a string replacement would reinterpret
  // $-patterns ($&, $`, $', $n) inside the values (e.g. the minified mermaid
  // library and user code), corrupting the output.
  return template
    .replaceAll('{{MODE}}', () => escapeHtml(mode))
    .replaceAll('{{TITLE}}', () => escapeHtml(meta.title || 'Untitled'))
    .replaceAll('{{META}}', () => metaLine)
    .replaceAll('{{THEME_CSS}}', () => themeCss)
    .replaceAll('{{TOC}}', () => renderToc(toc))
    .replaceAll('{{CONTENT}}', () => html)
    .replaceAll('{{MERMAID}}', () => mermaidScript)
    .replaceAll('{{RUNTIME_JS}}', () => runtimeJs);
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--out') args.out = argv[++i];
    else if (a === '--open') args.open = true;
    else if (a === '--watch') args.watch = true;
    else args._.push(a);
  }
  return args;
}

const IS_WSL = (() => {
  if (process.env.WSL_DISTRO_NAME) return true;
  try {
    return /microsoft/i.test(fs.readFileSync('/proc/version', 'utf8'));
  } catch {
    return false;
  }
})();

// A clickable location for the built file: a Windows path under WSL (so it
// opens in the Windows browser), otherwise a file:// URL.
function viewUrl(outPath) {
  if (IS_WSL) {
    try {
      return execFileSync('wslpath', ['-w', outPath]).toString().trim();
    } catch {
      /* fall through */
    }
  }
  return pathToFileURL(outPath).href;
}

// Open the file in the OS default browser, fully detached so this process exits
// cleanly with no lingering child.
function openInBrowser(outPath) {
  let cmd;
  let cmdArgs;
  if (IS_WSL) {
    cmd = 'explorer.exe';
    cmdArgs = [viewUrl(outPath)];
  } else if (process.platform === 'darwin') {
    cmd = 'open';
    cmdArgs = [outPath];
  } else if (process.platform === 'win32') {
    cmd = 'cmd';
    cmdArgs = ['/c', 'start', '', outPath];
  } else {
    cmd = 'xdg-open';
    cmdArgs = [outPath];
  }
  try {
    const child = spawn(cmd, cmdArgs, { detached: true, stdio: 'ignore' });
    child.on('error', () => {});
    child.unref();
  } catch {
    /* opening is best-effort */
  }
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const target = args._[0];
  if (!target) {
    console.error('Usage: node build.mjs <dir|file> [--out file.html] [--open] [--watch]');
    process.exit(1);
  }
  const resolved = path.resolve(target);
  const defaultName = (path.basename(resolved).replace(/\.md$/, '') || 'doc') + '.html';
  const outPath = path.resolve(args.out || path.join(process.cwd(), defaultName));

  async function once() {
    const compiled = await compile(resolved);
    const page = buildPage(compiled);
    fs.writeFileSync(outPath, page);
    const kb = (Buffer.byteLength(page) / 1024).toFixed(0);
    console.log(`✓ ${outPath} (${kb} KB${compiled.usesMermaid ? ', mermaid inlined' : ''})`);
    console.log(`  view: ${viewUrl(outPath)}`);
    return outPath;
  }

  await once();

  if (args.open) openInBrowser(outPath);

  if (args.watch) {
    const watchDir = fs.statSync(resolved).isDirectory() ? resolved : path.dirname(resolved);
    console.log(`watching ${watchDir} …`);
    let timer = null;
    fs.watch(watchDir, { recursive: true }, () => {
      clearTimeout(timer);
      timer = setTimeout(() => once().catch((e) => console.error(e.message)), 120);
    });
  }
}

run().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});

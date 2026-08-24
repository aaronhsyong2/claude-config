// remark + rehype plugins that turn the visual-docs block vocabulary into
// styled, self-contained HTML. Block names intentionally echo the agent-native
// vocabulary so authoring muscle memory transfers.
import fs from 'node:fs';
import path from 'node:path';
import { visit } from 'unist-util-visit';
import { highlightLines } from './highlight.mjs';

const CALLOUT_TONES = new Set(['note', 'decision', 'warn', 'ok', 'info']);

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

// Flatten an mdast node's text content (for parsing annotation list items).
function textContent(node) {
  if (!node) return '';
  if (node.value) return node.value;
  if (node.children) return node.children.map(textContent).join('');
  return '';
}

function setClass(node, classes, extra = {}) {
  node.data = node.data || {};
  node.data.hName = node.data.hName || 'div';
  node.data.hProperties = { ...(node.data.hProperties || {}), className: classes, ...extra };
}

// Parse "12-18: note text" list items inside an annotated-code block.
function parseAnnotations(node) {
  const out = [];
  const list = (node.children || []).find((c) => c.type === 'list');
  if (!list) return out;
  for (const item of list.children || []) {
    const raw = textContent(item).trim();
    const m = raw.match(/^([\d]+(?:-[\d]+)?)\s*[:\-–]\s*(.+)$/s);
    if (m) out.push({ lines: m[1], note: m[2].trim() });
    else if (raw) out.push({ lines: '', note: raw });
  }
  return out;
}

function renderAnnotatedCode(node, baseDir) {
  const attrs = node.attributes || {};
  const file = attrs.file || attrs.src;
  const lang = attrs.lang || (file ? path.extname(file).slice(1) : '');
  const annotations = parseAnnotations(node);
  const id = 'ac-' + slugify(file || attrs.id || String(node.position?.start?.line || 'x'));

  let code = '';
  let start = 1;
  let missing = false;
  if (file) {
    const resolved = path.resolve(baseDir, file);
    try {
      code = fs.readFileSync(resolved, 'utf8');
    } catch {
      missing = true;
    }
  } else if (attrs.code) {
    code = attrs.code;
  }

  if (attrs.lines && !missing) {
    const [a, b] = attrs.lines.split('-').map((n) => parseInt(n, 10));
    const all = code.split('\n');
    start = a || 1;
    code = all.slice((a || 1) - 1, b || all.length).join('\n');
  }

  const body = missing
    ? `<div class="vd-missing">Missing file: ${escapeHtml(file)}</div>`
    : `<pre class="vd-code" data-start="${start}"><code class="language-${escapeHtml(lang || 'text')}">${escapeHtml(code)}</code></pre>`;

  const notes = annotations.length
    ? `<ol class="vd-annotations">${annotations
        .map(
          (a) =>
            `<li data-lines="${escapeHtml(a.lines)}">${
              a.lines
                ? `<button class="vd-anno-jump" data-lines="${escapeHtml(a.lines)}">${escapeHtml(
                    a.lines.replace('-', '–'),
                  )}</button> `
                : ''
            }${escapeHtml(a.note)}</li>`,
        )
        .join('')}</ol>`
    : '';

  const html = `<figure class="vd-annotated" id="${id}" data-start="${start}"><figcaption><span data-icon="file"></span> ${escapeHtml(
    file || 'snippet',
  )}${annotations.length ? ` <span class="vd-anno-count">${annotations.length} notes</span>` : ''}</figcaption><div class="vd-annotated__grid">${body}${notes}</div></figure>`;

  node.type = 'html';
  node.value = html;
  delete node.children;
  delete node.attributes;
}

// remark plugin: map the container/leaf directives to HTML output.
export function remarkDocBlocks(options = {}) {
  const baseDir = options.baseDir || process.cwd();
  return (tree) => {
    visit(tree, (node) => {
      if (node.type !== 'containerDirective' && node.type !== 'leafDirective') return;
      const name = node.name;
      const attrs = node.attributes || {};

      switch (name) {
        case 'callout': {
          const tone = CALLOUT_TONES.has(attrs.tone) ? attrs.tone : 'note';
          setClass(node, ['vd-callout', `vd-callout--${tone}`], { 'data-tone': tone });
          node.data.hName = 'aside';
          break;
        }
        case 'columns':
          setClass(node, ['vd-columns']);
          break;
        case 'col':
          setClass(node, ['vd-col'], attrs.label ? { 'data-label': attrs.label } : {});
          break;
        case 'tabs':
          setClass(node, ['vd-tabs']);
          break;
        case 'tab':
          setClass(node, ['vd-tab'], { 'data-title': attrs.title || 'Tab' });
          node.data.hName = 'section';
          break;
        case 'questions':
          setClass(node, ['vd-questions'], { 'data-label': attrs.title || 'Open Questions' });
          break;
        case 'file-tree':
          setClass(node, ['vd-file-tree']);
          break;
        case 'details': {
          setClass(node, ['vd-details']);
          node.data.hName = 'details';
          const summary = {
            type: 'paragraph',
            data: { hName: 'summary' },
            children: [{ type: 'text', value: attrs.summary || 'Details' }],
          };
          node.children = [summary, ...(node.children || [])];
          break;
        }
        case 'annotated-code':
          renderAnnotatedCode(node, baseDir);
          break;
        default:
          // Unknown directive: render its children in a labelled container
          // rather than dropping content.
          setClass(node, ['vd-block'], { 'data-block': name });
      }
    });
  };
}

// rehype plugin: highlight every <code class="language-*"> except mermaid,
// replacing its text child with line-wrapped highlighted HTML.
export function rehypeHighlightCode() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'code') return;
      const classes = node.properties?.className || [];
      const langClass = (Array.isArray(classes) ? classes : [classes]).find(
        (c) => typeof c === 'string' && c.startsWith('language-'),
      );
      if (!langClass) return;
      const lang = langClass.replace('language-', '');
      if (lang === 'mermaid') return;
      const text = node.children.map((c) => c.value || '').join('');
      if (!text) return;
      const { html } = highlightLines(text, lang);
      node.properties.className = [...(Array.isArray(classes) ? classes : [classes]), 'hljs'];
      node.children = [{ type: 'raw', value: html }];
    });
  };
}

// rehype plugin: turn <pre><code class="language-mermaid"> into the
// <pre class="mermaid"> form that mermaid.run() consumes at view time.
export function rehypeMermaid(state) {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'pre') return;
      const code = node.children?.find((c) => c.type === 'element' && c.tagName === 'code');
      if (!code) return;
      const classes = code.properties?.className || [];
      const list = Array.isArray(classes) ? classes : [classes];
      if (!list.includes('language-mermaid')) return;
      const text = code.children.map((c) => c.value || '').join('');
      node.tagName = 'pre';
      node.properties = { className: ['mermaid'] };
      node.children = [{ type: 'text', value: text }];
      if (state) state.usesMermaid = true;
    });
  };
}

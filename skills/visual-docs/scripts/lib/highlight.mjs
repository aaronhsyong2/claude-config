// Build-time syntax highlighting with highlight.js, emitting one wrapped span
// per source line so the runtime can highlight specific lines for annotations.
import hljs from 'highlight.js';

// Split highlight.js output into self-contained lines. hljs only emits <span>
// elements, which may span newlines (e.g. block comments); we re-close any open
// spans at each newline and re-open them on the next line so every line is a
// valid standalone fragment.
function splitHighlightedLines(html) {
  const lines = [];
  const stack = [];
  let current = '';
  let i = 0;
  while (i < html.length) {
    const ch = html[i];
    if (ch === '<') {
      const end = html.indexOf('>', i);
      const tag = html.slice(i, end + 1);
      if (tag.startsWith('</')) {
        stack.pop();
      } else if (!tag.endsWith('/>')) {
        stack.push(tag);
      }
      current += tag;
      i = end + 1;
    } else if (ch === '\n') {
      lines.push(current + '</span>'.repeat(stack.length));
      current = stack.join('');
      i += 1;
    } else {
      let next = i + 1;
      while (next < html.length && html[next] !== '<' && html[next] !== '\n') next += 1;
      current += html.slice(i, next);
      i = next;
    }
  }
  lines.push(current);
  return lines;
}

// Returns { html, language, count }. `html` is the inner HTML of a <code>
// element: one `<span class="vd-line" data-line="N">` per source line.
export function highlightLines(code, lang) {
  const source = code.replace(/\n$/, '');
  let value;
  let language;
  if (lang && hljs.getLanguage(lang)) {
    value = hljs.highlight(source, { language: lang, ignoreIllegals: true }).value;
    language = lang;
  } else {
    const auto = hljs.highlightAuto(source);
    value = auto.value;
    language = auto.language || 'text';
  }
  const lines = splitHighlightedLines(value);
  const html = lines
    .map((line, idx) => `<span class="vd-line" data-line="${idx + 1}">${line}</span>`)
    .join('\n');
  return { html, language, count: lines.length };
}

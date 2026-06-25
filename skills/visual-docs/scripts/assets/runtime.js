// visual-docs runtime — vanilla, no dependencies, runs from file://.
(function () {
  'use strict';
  var doc = document;

  // --- Icons (tiny inline SVG set; renderer-owned, no icon-word text) -------
  var ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    file: '<path d="M14 3v5h5"/><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  };
  function paintIcons() {
    doc.querySelectorAll('[data-icon]').forEach(function (el) {
      var name = el.getAttribute('data-icon');
      if (!ICONS[name] || el.dataset.painted) return;
      el.dataset.painted = '1';
      el.innerHTML =
        '<svg class="vd-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        ICONS[name] +
        '</svg>';
    });
  }

  // --- Theme ----------------------------------------------------------------
  function applyTheme(t) {
    doc.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('vd-theme', t); } catch (e) {}
    rerenderMermaid();
  }
  function initTheme() {
    var saved;
    try { saved = localStorage.getItem('vd-theme'); } catch (e) {}
    if (saved) doc.documentElement.setAttribute('data-theme', saved);
    var btn = doc.getElementById('vd-theme');
    if (btn) btn.addEventListener('click', function () {
      applyTheme(doc.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  // --- Tabs -----------------------------------------------------------------
  function initTabs() {
    doc.querySelectorAll('.vd-tabs').forEach(function (group) {
      var tabs = Array.prototype.slice.call(group.querySelectorAll(':scope > .vd-tab'));
      if (!tabs.length) return;
      var bar = doc.createElement('div');
      bar.className = 'vd-tabbar';
      tabs.forEach(function (tab, i) {
        var b = doc.createElement('button');
        b.textContent = tab.getAttribute('data-title') || 'Tab ' + (i + 1);
        b.addEventListener('click', function () {
          tabs.forEach(function (t) { t.classList.add('vd-hidden'); });
          bar.querySelectorAll('button').forEach(function (x) { x.classList.remove('vd-active'); });
          tab.classList.remove('vd-hidden');
          b.classList.add('vd-active');
        });
        if (i === 0) b.classList.add('vd-active');
        else tab.classList.add('vd-hidden');
        bar.appendChild(b);
      });
      group.insertBefore(bar, group.firstChild);
    });
  }

  // --- Collapsible h2 sections ---------------------------------------------
  function sectionSiblings(h2) {
    var out = [];
    var n = h2.nextElementSibling;
    while (n && n.tagName !== 'H2') { out.push(n); n = n.nextElementSibling; }
    return out;
  }
  function toggleSection(h2, collapse) {
    var collapsed = collapse != null ? collapse : !h2.classList.contains('vd-collapsed');
    h2.classList.toggle('vd-collapsed', collapsed);
    sectionSiblings(h2).forEach(function (el) { el.classList.toggle('vd-hidden', collapsed); });
  }
  function initCollapsibles() {
    var heads = doc.querySelectorAll('.vd-article h2');
    heads.forEach(function (h2) {
      h2.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') return;
        toggleSection(h2);
      });
    });
    var btn = doc.getElementById('vd-collapse-all');
    if (btn) {
      var allCollapsed = false;
      btn.addEventListener('click', function () {
        allCollapsed = !allCollapsed;
        heads.forEach(function (h2) { toggleSection(h2, allCollapsed); });
        btn.textContent = allCollapsed ? 'Expand all' : 'Collapse all';
      });
    }
  }

  // --- Code copy buttons ----------------------------------------------------
  function initCopy() {
    doc.querySelectorAll('.vd-article pre').forEach(function (pre) {
      if (pre.dataset.copy) return;
      pre.dataset.copy = '1';
      pre.style.position = 'relative';
      var b = doc.createElement('button');
      b.className = 'vd-btn vd-copy';
      b.type = 'button';
      b.textContent = 'Copy';
      b.style.cssText = 'position:absolute;top:6px;right:6px;font-size:11px;padding:3px 8px;opacity:.7';
      b.addEventListener('click', function () {
        var code = pre.querySelector('code');
        var text = (code || pre).textContent;
        navigator.clipboard && navigator.clipboard.writeText(text);
        b.textContent = 'Copied';
        setTimeout(function () { b.textContent = 'Copy'; }, 1200);
      });
      pre.appendChild(b);
    });
  }

  // --- Annotation jump ------------------------------------------------------
  function clearHot() {
    doc.querySelectorAll('.vd-line--hot').forEach(function (l) { l.classList.remove('vd-line--hot'); });
  }
  function initAnnotations() {
    doc.querySelectorAll('.vd-anno-jump').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var fig = btn.closest('.vd-annotated');
        if (!fig) return;
        var start = parseInt(fig.getAttribute('data-start') || '1', 10);
        var range = (btn.getAttribute('data-lines') || '').split('-').map(Number);
        var from = range[0], to = range[1] || range[0];
        clearHot();
        var first = null;
        fig.querySelectorAll('.vd-line').forEach(function (line) {
          var rel = parseInt(line.getAttribute('data-line'), 10);
          var abs = rel + start - 1;
          if (abs >= from && abs <= to) {
            line.classList.add('vd-line--hot');
            if (!first) first = line;
          }
        });
        if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }

  // --- Search / filter ------------------------------------------------------
  function initSearch() {
    var input = doc.getElementById('vd-search');
    if (!input) return;
    var heads = Array.prototype.slice.call(doc.querySelectorAll('.vd-article h2'));
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      heads.forEach(function (h2) {
        var sibs = sectionSiblings(h2);
        var text = (h2.textContent + ' ' + sibs.map(function (s) { return s.textContent; }).join(' ')).toLowerCase();
        var match = !q || text.indexOf(q) !== -1;
        h2.classList.toggle('vd-hidden', !match);
        sibs.forEach(function (s) { s.classList.toggle('vd-hidden', !match || h2.classList.contains('vd-collapsed')); });
        var tocLink = doc.querySelector('.vd-toc a[data-toc="' + h2.id + '"]');
        if (tocLink) tocLink.closest('li').classList.toggle('vd-hidden', !match);
      });
    });
  }

  // --- Scrollspy ------------------------------------------------------------
  function initScrollspy() {
    var links = doc.querySelectorAll('.vd-toc a[data-toc]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('data-toc')] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('vd-active'); });
        var a = map[e.target.id];
        if (a) a.classList.add('vd-active');
      });
    }, { rootMargin: '-72px 0px -70% 0px' });
    doc.querySelectorAll('.vd-article h2[id], .vd-article h3[id]').forEach(function (h) { io.observe(h); });
  }

  // --- Mermaid --------------------------------------------------------------
  function mermaidTheme() {
    return doc.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default';
  }
  function rerenderMermaid() {
    if (!window.__vdHasMermaid || !window.mermaid) return;
    var blocks = doc.querySelectorAll('pre.mermaid');
    blocks.forEach(function (el) {
      if (el.dataset.src) { el.removeAttribute('data-processed'); el.innerHTML = el.dataset.src; }
    });
    try {
      window.mermaid.initialize({ startOnLoad: false, theme: mermaidTheme(), securityLevel: 'strict' });
      window.mermaid.run({ querySelector: 'pre.mermaid' });
    } catch (e) {}
  }
  function initMermaid() {
    if (!window.__vdHasMermaid || !window.mermaid) return;
    doc.querySelectorAll('pre.mermaid').forEach(function (el) { el.dataset.src = el.textContent; });
    rerenderMermaid();
  }

  function init() {
    paintIcons();
    initTheme();
    initTabs();
    initCollapsibles();
    initCopy();
    initAnnotations();
    initSearch();
    initScrollspy();
    initMermaid();
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})();

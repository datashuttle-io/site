/* icon-shim.js — renders DataShuttle icons without any fetch/CDN.
   Each <i data-lucide="name"> becomes a <span> that paints the SVG via CSS
   mask-image, so it inherits currentColor and never blocks page load.
   Set window.__ICON_BASE before loading to override the icon folder.
   Exposes window.lucide.createIcons() so existing calls keep working.
*/
(function () {
  var BASE = window.__ICON_BASE || '../../ui/public/icons/';

  function paint(el) {
    if (!el || el.dataset.lucideDone) return;
    var name = el.getAttribute('data-lucide');
    if (!name) return;
    var url = BASE + name + '.svg';
    var span = document.createElement('span');
    span.className = el.getAttribute('class') || '';
    span.setAttribute('data-lucide-name', name);
    span.setAttribute('role', 'img');
    span.dataset.lucideDone = '1';
    // Base box — width/height usually set by .ico/.i/.chev CSS; default 1em.
    var s = span.style;
    s.display = 'inline-block';
    s.width = s.width || '1em';
    s.height = s.height || '1em';
    s.backgroundColor = 'currentColor';
    s.webkitMaskImage = 'url("' + url + '")';
    s.maskImage = 'url("' + url + '")';
    s.webkitMaskRepeat = s.maskRepeat = 'no-repeat';
    s.webkitMaskPosition = s.maskPosition = 'center';
    s.webkitMaskSize = s.maskSize = 'contain';
    s.flex = '0 0 auto';
    // Carry over any inline style author put on the <i>.
    var inline = el.getAttribute('style');
    if (inline) span.setAttribute('style', span.getAttribute('style') + ';' + inline);
    el.replaceWith(span);
  }

  function createIcons() {
    var nodes = document.querySelectorAll('[data-lucide]');
    for (var i = 0; i < nodes.length; i++) paint(nodes[i]);
  }

  window.lucide = window.lucide || {};
  window.lucide.createIcons = createIcons;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createIcons);
  } else {
    createIcons();
  }
})();

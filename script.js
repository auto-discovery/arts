// ARTS project page — tiny, dependency-free interactivity.
(function () {
  'use strict';

  // ---- BibTeX copy-to-clipboard ----
  var btn = document.getElementById('copyBtn');
  var bib = document.getElementById('bibtex');

  if (btn && bib) {
    btn.addEventListener('click', function () {
      var text = bib.innerText;

      var done = function () {
        var orig = 'Copy';
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(function () {
          btn.textContent = orig;
          btn.classList.remove('copied');
        }, 1600);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallbackCopy);
      } else {
        fallbackCopy();
      }

      function fallbackCopy() {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { /* no-op */ }
        document.body.removeChild(ta);
      }
    });
  }

  // ---- Smooth-scroll for in-page anchors (graceful even where CSS smooth-scroll is unsupported) ----
  var links = document.querySelectorAll('a[href^="#"]');
  Array.prototype.forEach.call(links, function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', id);
    });
  });
})();

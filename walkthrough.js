/* ARTS — interactive Figure 1 walkthrough */
(function () {
  'use strict';
  var root = document.getElementById('walk');
  if (!root) return;

  var eyebrowEl = document.getElementById('walkEyebrow');
  var titleEl   = document.getElementById('walkTitle');
  var bodyEl    = document.getElementById('walkBody');
  var prevBtn   = document.getElementById('walkPrev');
  var nextBtn   = document.getElementById('walkNext');
  var playBtn   = document.getElementById('walkPlay');
  var dotsWrap  = document.getElementById('walkDots');

  // node id -> class for each step ('hidden' to hide the new node)
  var STEPS = [
    {
      eyebrow: 'Tree to expand',
      title: 'Start from the current search tree',
      body: 'Each node is one <strong>validated experiment</strong> — a hypothesis with its code, logs and score. Three candidate leaves are open to expand.',
      n: { a: 'cand', b: 'cand', c: 'cand', nu: 'hidden' }
    },
    {
      eyebrow: '🔍 Inspect',
      title: 'Inspect the logs of every candidate',
      body: 'The scientist reads each node’s logs and reasons about <em>why</em> it failed.' +
            '<ul class="wlist">' +
            '<li><span class="wscore">0.47</span> MLP at ceiling</li>' +
            '<li><span class="wscore">0.15</span> RF, low potential</li>' +
            '<li><span class="wscore">0.10</span> new architecture, undertrained</li></ul>',
      n: { a: 'cand', b: 'cand', c: 'cand', nu: 'hidden' }
    },
    {
      eyebrow: '🧠 Reason',
      title: 'Reason about what each score really means',
      body: '<strong>0.47</strong> is the highest score, but it is an MLP that has already plateaued. <strong>0.10</strong> is a new architecture that is merely undertrained, so it has the most headroom. The scientist picks <strong>0.10</strong> — not the top score.',
      n: { a: 'cand focus', b: 'cand dim', c: 'cand dim', nu: 'hidden' }
    },
    {
      eyebrow: 'Select',
      title: 'Select the most promising node',
      body: 'Node <strong>0.10</strong> becomes the parent to expand. A greedy, score-based search would have abandoned it.',
      n: { a: 'selected focus', b: 'cand dim', c: 'cand dim', nu: 'hidden' }
    },
    {
      eyebrow: '🎲 Propose',
      title: 'Propose diverse hypotheses',
      body: 'Verbalized sampling proposes a varied set of hypotheses with probabilities, instead of collapsing onto one idea.' +
            '<div class="wbar">' +
            bar('more epochs', 0.55, 100) +
            bar('use attention', 0.30, 55) +
            bar('pre-trained backbone', 0.15, 27) +
            '</div>',
      n: { a: 'selected focus', b: 'cand dim', c: 'cand dim', nu: 'hidden' }
    },
    {
      eyebrow: '⚙️ Execute',
      title: 'Execute the chosen hypothesis',
      body: 'A coding agent writes and runs the code in a sandbox, validates the run and records the score. A new child appears — <strong>0.55</strong>, a new best.',
      n: { a: 'selected', b: 'cand dim', c: 'cand dim', nu: 'new focus' }
    },
    {
      eyebrow: '↻ Repeat',
      title: 'Repeat until the budget runs out',
      body: 'The new node joins the tree and the scientist starts again — now with more evidence about what actually works.',
      n: { a: 'selected', b: 'cand', c: 'cand', nu: 'new' }
    }
  ];

  function bar(label, val, pct) {
    return '<div class="wbar-row"><span>' + label + '</span><span class="wbar-val">' + val.toFixed(2) + '</span>' +
           '<span class="wbar-track"><span class="wbar-fill" style="width:' + pct + '%"></span></span></div>';
  }

  function setClass(id, cls) {
    var el = document.getElementById('n-' + id);
    if (!el) return;
    var hidden = cls.indexOf('hidden') !== -1;
    el.setAttribute('class', 'wnode ' + cls);
    // matching edge for the new node
    if (id === 'nu') {
      var e = document.getElementById('e-nu');
      if (e) e.setAttribute('class', 'wedge' + (hidden ? ' hidden' : ''));
    }
  }

  var i = 0, timer = null, playing = false;
  var DUR = 2300;

  // dots
  STEPS.forEach(function (_, k) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Step ' + (k + 1));
    b.addEventListener('click', function () { stop(); go(k); });
    dotsWrap.appendChild(b);
  });

  function render() {
    var s = STEPS[i];
    root.setAttribute('data-step', i);
    eyebrowEl.textContent = s.eyebrow;
    titleEl.textContent = s.title;
    bodyEl.innerHTML = s.body;
    setClass('a', s.n.a); setClass('b', s.n.b); setClass('c', s.n.c); setClass('nu', s.n.nu);
    prevBtn.disabled = (i === 0);
    nextBtn.disabled = (i === STEPS.length - 1);
    Array.prototype.forEach.call(dotsWrap.children, function (d, k) {
      d.className = (k === i ? 'on' : '');
    });
  }

  function go(k) { i = Math.max(0, Math.min(STEPS.length - 1, k)); render(); }

  function play() {
    playing = true;
    playBtn.innerHTML = '&#10074;&#10074;&nbsp; Pause';
    clearInterval(timer);
    timer = setInterval(function () {
      if (i >= STEPS.length - 1) { go(0); } else { go(i + 1); }
    }, DUR);
  }
  function stop() {
    playing = false;
    playBtn.innerHTML = '&#9654;&nbsp; Play';
    clearInterval(timer);
  }
  function toggle() { playing ? stop() : play(); }

  prevBtn.addEventListener('click', function () { stop(); go(i - 1); });
  nextBtn.addEventListener('click', function () { stop(); go(i + 1); });
  playBtn.addEventListener('click', toggle);

  // keyboard ← / → when the widget is on screen
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var r = root.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    e.preventDefault(); stop();
    go(i + (e.key === 'ArrowRight' ? 1 : -1));
  });

  // autostart once it scrolls into view
  render();
  if ('IntersectionObserver' in window) {
    var started = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && !started) { started = true; play(); }
      });
    }, { threshold: 0.4 });
    io.observe(root);
  }
})();

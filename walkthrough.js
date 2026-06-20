/* ARTS — cinematic assembly of Figure 1.
   Each piece appears centre-stage with a caption, then settles into place. */
(function () {
  'use strict';
  var fig = document.getElementById('fig');
  if (!fig) return;

  var W = 980, H = 600;
  var inner   = document.getElementById('figInner');
  var scale   = document.getElementById('figScale');
  var stageEl = document.getElementById('figStage');
  var scrim   = document.getElementById('figScrim');
  var capEl   = document.getElementById('figCap');
  var playBtn = document.getElementById('figPlay');
  var fill    = document.getElementById('figProgress');

  /* ---- piece builders ---- */
  function tree(st) {
    function n(cx, cy, label, cls) {
      return '<g class="wnode ' + cls + '"><circle cx="' + cx + '" cy="' + cy + '" r="22"/>' +
             '<text x="' + cx + '" y="' + cy + '" text-anchor="middle" dominant-baseline="central">' + label + '</text></g>';
    }
    var noNu = st.nu === 'hidden';
    return '<div class="fig-tree"><svg viewBox="0 0 200 220">' +
      '<g stroke-linecap="round">' +
        '<line class="wedge" x1="100" y1="40" x2="40"  y2="128"/>' +
        '<line class="wedge" x1="100" y1="40" x2="100" y2="128"/>' +
        '<line class="wedge" x1="100" y1="40" x2="160" y2="128"/>' +
        (noNu ? '' : '<line class="wedge" x1="40" y1="128" x2="40" y2="200"/>') +
      '</g>' +
      n(100, 40, '0.00', 'root') +
      n(40, 128, '0.10', st.a) + n(100, 128, '0.15', st.b) + n(160, 128, '0.47', st.c) +
      (noNu ? '' : n(40, 200, '0.55', 'new')) +
      '</svg></div>';
  }
  function header(t) { return '<div class="fig-grouptitle">' + t + '</div>'; }
  function card(c, head, body) {
    return '<div class="fig-card" style="--c:' + c + '"><div class="fig-sub-h">' + head + '</div><div class="fig-sub-b">' + body + '</div></div>';
  }
  function arrow(idn, d) {
    var m = 'ahm' + idn;
    return '<svg viewBox="0 0 980 600" class="fig-arrows">' +
      '<defs><marker id="' + m + '" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">' +
      '<path d="M0,0 L7,3 L0,6 Z" fill="#b9b2a6"/></marker></defs>' +
      '<path d="' + d + '" fill="none" stroke="#b9b2a6" stroke-width="2.4" marker-end="url(#' + m + ')"/>' +
      '</svg>';
  }
  function arrowRepeat() {
    return '<svg viewBox="0 0 980 600" class="fig-arrows">' +
      '<defs><marker id="ahm5" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">' +
      '<path d="M0,0 L7,3 L0,6 Z" fill="#b9b2a6"/></marker></defs>' +
      '<path d="M40,488 L18,488 L18,214 L36,214" fill="none" stroke="#b9b2a6" stroke-width="2.4" marker-end="url(#ahm5)"/>' +
      '<text x="9" y="356" font-size="13" fill="#8a8478" transform="rotate(-90 9,356)">repeat until budget runs out</text>' +
      '</svg>';
  }

  /* ---- pieces & final layout (in 980x600 space). Arrows first so they sit behind. ---- */
  var PIECES = {
    aSel:    { x: 0, y: 0, w: 980, h: 600, flat: true, html: arrow(1, 'M252,210 L296,176') },
    aB:      { x: 0, y: 0, w: 980, h: 600, flat: true, html: arrow(2, 'M684,176 L736,210') },
    aExp:    { x: 0, y: 0, w: 980, h: 600, flat: true, html: arrow(3, 'M846,346 C846,452 770,486 688,486') },
    aC:      { x: 0, y: 0, w: 980, h: 600, flat: true, html: arrow(4, 'M300,492 L204,492') },
    aRepeat: { x: 0, y: 0, w: 980, h: 600, flat: true, html: arrowRepeat() },
    treeA:   { x: 40,  y: 130, w: 210, h: 210, html: tree({ a: 'cand', b: 'cand', c: 'cand', nu: 'hidden' }) },
    selHead: { x: 300, y: 96,  w: 380, h: 36,  html: header('Node&nbsp;Selection') },
    inspect: { x: 300, y: 146, w: 182, h: 158, html: card('var(--accent)', '🔍 Inspect',
                 'Reads each node’s logs and reasons <em>why</em> it failed.<br>0.47 &mdash; MLP at ceiling<br>0.15 &mdash; RF, low potential<br>0.10 &mdash; new architecture, undertrained') },
    reason:  { x: 498, y: 146, w: 182, h: 158, html: card('var(--blue)', '🧠 Reason',
                 '0.47 is the highest score an MLP can reach. The new architecture has the highest potential.<br><strong>&rarr; Select 0.10</strong>') },
    treeB:   { x: 740, y: 130, w: 210, h: 210, html: tree({ a: 'selected', b: 'cand', c: 'cand', nu: 'hidden' }) },
    expHead: { x: 300, y: 372, w: 380, h: 36,  html: header('Node&nbsp;Expansion') },
    propose: { x: 300, y: 422, w: 182, h: 158, html: card('var(--pink)', '🎲 Propose',
                 'Samples diverse hypotheses with probabilities.<br>more epochs &mdash; 0.55<br>use attention &mdash; 0.30<br>use pre-trained backbone &mdash; 0.15') },
    execute: { x: 498, y: 422, w: 182, h: 158, html: card('var(--green)', '⚙️ Execute',
                 'A coding agent writes code for the chosen hypothesis and runs it in a sandbox.<br>Read · Write · Run · Score<br><strong>&rarr; new node 0.55</strong>') },
    treeC:   { x: 40,  y: 388, w: 210, h: 210, html: tree({ a: 'selected', b: 'cand', c: 'cand', nu: 'new' }) }
  };

  var BEATS = [
    { id: 'treeA',   cap: '<strong>The search tree.</strong> Each node is one validated experiment — a hypothesis with its code, logs and score.' },
    { id: 'selHead', arrow: 'aSel', cap: '<strong>Node selection.</strong> The scientist decides which node is most worth expanding next.' },
    { id: 'inspect', cap: '<strong>Inspect.</strong> It reads every candidate’s logs and reasons about <em>why</em> each one failed.' },
    { id: 'reason',  cap: '<strong>Reason.</strong> 0.47 has plateaued; 0.10 has the most headroom — so it selects 0.10.' },
    { id: 'treeB',   arrow: 'aB', cap: 'The selected node, <strong>0.10</strong>, becomes the parent to expand.' },
    { id: 'expHead', arrow: 'aExp', cap: '<strong>Node expansion.</strong> Now the scientist generates and runs a new hypothesis.' },
    { id: 'propose', cap: '<strong>Propose.</strong> Verbalized sampling proposes a diverse set of hypotheses with probabilities.' },
    { id: 'execute', cap: '<strong>Execute.</strong> A coding agent writes the code, runs it in a sandbox and records the score.' },
    { id: 'treeC',   arrow: 'aC', cap: 'A new best node, <strong>0.55</strong>, is added to the tree.' },
    { id: 'aRepeat', cap: 'One full search step. <strong>Repeat</strong> until the budget runs out.' }
  ];

  /* ---- build DOM ---- */
  var el = {};
  Object.keys(PIECES).forEach(function (id) {
    var p = PIECES[id];
    var d = document.createElement('div');
    d.className = 'fig-comp';
    d.style.left = p.x + 'px'; d.style.top = p.y + 'px';
    d.style.width = p.w + 'px'; d.style.height = p.h + 'px';
    d.innerHTML = p.html;
    inner.appendChild(d);
    el[id] = d;
  });

  function fit() {
    var s = stageEl.clientWidth / W;
    scale.style.transform = 'scale(' + s + ')';
    stageEl.style.height = (H * s) + 'px';
  }
  fit();
  window.addEventListener('resize', fit);

  /* ---- timeline ---- */
  var ENTER = 700, HOLD = 2100, SETTLE = 950, GAP = 500, ARROW_HOLD = 3000, END_HOLD = 3200;
  var cur = 0, playing = false, timers = [], shown = new Set();

  function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function centreTransform(d) {
    var cx = d.offsetLeft + d.offsetWidth / 2, cy = d.offsetTop + d.offsetHeight / 2;
    var k = Math.min((W * 0.6) / d.offsetWidth, (H * 0.62) / d.offsetHeight, 1.85);
    return 'translate(' + (W / 2 - cx) + 'px,' + (H / 2 - cy) + 'px) scale(' + k + ')';
  }

  function resetAll() {
    shown = new Set();
    Object.keys(el).forEach(function (id) {
      var d = el[id];
      d.style.transition = 'none';
      d.style.transform = '';
      d.style.zIndex = '1';
      d.style.opacity = '0';
    });
    fill.style.transition = 'none'; fill.style.width = '0%';
    void inner.offsetWidth;
  }

  function dimShown() {                 // fade the already-placed pieces so the centred one stands out
    shown.forEach(function (id) { var c = el[id]; c.style.transition = 'opacity .45s ease'; c.style.opacity = '.13'; });
  }
  function restoreShown() {             // bring the placed pieces back to full strength
    shown.forEach(function (id) { var c = el[id]; c.style.transition = 'opacity .5s ease'; c.style.opacity = '1'; });
  }
  function revealArrow(id) {            // a connecting arrow appears in its place
    var c = el[id]; c.style.transition = 'opacity .6s ease'; c.style.opacity = '1'; shown.add(id);
  }

  function setCap(html) { capEl.classList.remove('show'); capEl.innerHTML = html; void capEl.offsetWidth; capEl.classList.add('show'); }

  function progress(i) {
    fill.style.transition = 'width ' + (ENTER + HOLD + SETTLE) + 'ms linear';
    fill.style.width = (((i + 1) / BEATS.length) * 100) + '%';
  }

  function playBeat(i) {
    cur = i;
    if (i === 0) resetAll();
    var b = BEATS[i], d = el[b.id];
    setCap(b.cap);
    progress(i);

    if (PIECES[b.id].flat) {                       // final repeat-loop arrow: bring the diagram back, fade it in
      restoreShown();
      d.style.transition = 'opacity .7s ease';
      d.style.opacity = '1'; shown.add(b.id);
      at(ARROW_HOLD, function () { at(END_HOLD, function () { playBeat(0); }); });
      return;
    }

    dimShown();                                    // dim what's placed, bring this piece in CRISP at centre
    d.style.transition = 'opacity .4s ease';
    d.style.transform = centreTransform(d);
    d.style.zIndex = '6';
    d.style.opacity = '1';

    at(ENTER + HOLD, function () {                  // settle into place; restore the rest; drop its arrow
      d.style.transition = 'transform ' + SETTLE + 'ms cubic-bezier(.4,0,.2,1), opacity .45s ease';
      d.style.transform = '';
      restoreShown();
      shown.add(b.id);
      if (b.arrow) revealArrow(b.arrow);
      at(SETTLE, function () { d.style.zIndex = '1'; });
    });
    at(ENTER + HOLD + SETTLE + GAP, function () {
      if (i + 1 < BEATS.length) playBeat(i + 1);
    });
  }

  function play() {
    playing = true; fig.setAttribute('data-playing', 'true');
    clearTimers();
    playBeat(cur >= BEATS.length ? 0 : cur);
  }
  function stop() {
    playing = false; fig.setAttribute('data-playing', 'false');
    clearTimers();
    var w = getComputedStyle(fill).width; fill.style.transition = 'none'; fill.style.width = w;
  }
  function toggle() { if (playing) { stop(); fig.dataset.userPaused = '1'; } else { fig.dataset.userPaused = ''; play(); } }

  playBtn.addEventListener('click', function (e) { e.stopPropagation(); toggle(); });
  stageEl.addEventListener('click', toggle);

  // autostart; pause when off-screen
  play();
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting && playing) stop();
        else if (en.isIntersecting && !playing && !fig.dataset.userPaused) play();
      });
    }, { threshold: 0.2 });
    io.observe(fig);
  }
})();

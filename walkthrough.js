/* ARTS — cinematic assembly of Figure 1.
   Pieces are authored at their LARGE (spotlight) size and scaled DOWN into the
   diagram, so nothing is ever upscaled → stays crisp. */
(function () {
  'use strict';
  var fig = document.getElementById('fig');
  if (!fig) return;

  var W = 1230, H = 690;
  var inner   = document.getElementById('figInner');
  var scaleEl = document.getElementById('figScale');
  var stageEl = document.getElementById('figStage');
  var capEl   = document.getElementById('figCap');
  var playBtn = document.getElementById('figPlay');
  var fill    = document.getElementById('figProgress');

  /* ---------- builders (natural / large coordinates) ---------- */
  function mag(mx, my) {
    return '<g><circle cx="' + mx + '" cy="' + my + '" r="9" fill="#fff" stroke="var(--accent)" stroke-width="2.4"/>' +
           '<line x1="' + (mx + 6.4) + '" y1="' + (my + 6.4) + '" x2="' + (mx + 12.5) + '" y2="' + (my + 12.5) + '" stroke="var(--accent)" stroke-width="2.6" stroke-linecap="round"/></g>';
  }
  function tree(st, magnify) {
    function n(cx, cy, label, cls) {
      return '<g class="wnode ' + cls + '"><circle cx="' + cx + '" cy="' + cy + '" r="22"/>' +
             '<text x="' + cx + '" y="' + cy + '" text-anchor="middle" dominant-baseline="central">' + label + '</text></g>';
    }
    var noNu = st.nu === 'hidden';
    return '<div class="fig-tree"><svg viewBox="0 0 200 224">' +
      '<g stroke-linecap="round">' +
        '<line class="wedge" x1="100" y1="40" x2="40"  y2="128"/>' +
        '<line class="wedge" x1="100" y1="40" x2="100" y2="128"/>' +
        '<line class="wedge" x1="100" y1="40" x2="160" y2="128"/>' +
        (noNu ? '' : '<line class="wedge" x1="40" y1="128" x2="40" y2="200"/>') +
      '</g>' +
      n(100, 40, '0.00', 'root') +
      n(40, 128, '0.10', st.a) + n(100, 128, '0.15', st.b) + n(160, 128, '0.47', st.c) +
      (noNu ? '' : n(40, 200, '0.55', 'new')) +
      (magnify ? mag(58, 110) + mag(118, 110) + mag(178, 110) : '') +
      '</svg></div>';
  }
  function spark(d, c) {
    return '<svg class="fig-spark" viewBox="0 0 64 28">' +
           '<line x1="0" y1="25" x2="64" y2="25" stroke="#ece7df" stroke-width="2"/>' +
           '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  function irow(score, d, label) {
    return '<div class="fig-irow"><span class="fig-chip">' + score + '</span>' +
           spark(d, 'var(--coral)') + '<span class="fig-il">' + label + '</span></div>';
  }
  function bar(label, val, pct) {
    return '<div class="fig-bar"><div class="fig-bar-top"><span>' + label + '</span>' +
           '<span class="fig-bar-val">' + val + '</span></div>' +
           '<div class="fig-bar-track"><div class="fig-bar-fill" style="width:' + pct + '%"></div></div></div>';
  }
  function header(t) { return '<div class="fig-grouptitle">' + t + '</div>'; }
  function card(c, head, body) {
    return '<div class="fig-card" style="--c:' + c + '"><div class="fig-sub-h">' + head + '</div><div class="fig-sub-b">' + body + '</div></div>';
  }
  function arrow(idn, d) {
    var m = 'ahm' + idn;
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="fig-arrows" preserveAspectRatio="none">' +
      '<defs><marker id="' + m + '" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">' +
      '<path d="M0,0 L7,3 L0,6 Z" fill="#b9b2a6"/></marker></defs>' +
      '<path d="' + d + '" fill="none" stroke="#b9b2a6" stroke-width="2.4" marker-end="url(#' + m + ')"/></svg>';
  }
  function arrowRepeat() {
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="fig-arrows" preserveAspectRatio="none">' +
      '<defs><marker id="ahm9" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">' +
      '<path d="M0,0 L7,3 L0,6 Z" fill="#b9b2a6"/></marker></defs>' +
      '<path d="M48,520 L30,520 L30,178 L46,178" fill="none" stroke="#b9b2a6" stroke-width="2.4" marker-end="url(#ahm9)"/>' +
      '<text x="22" y="380" font-size="13" fill="#8a8478" transform="rotate(-90 22,380)">repeat until budget runs out</text></svg>';
  }

  var INSPECT = '<div class="fig-pp">Reads each node’s logs and reasons <em>why</em> it failed.</div>' +
                irow('0.47', 'M2,20 L14,9 L30,5 L46,4 L62,4', 'MLP, plateaued') +
                irow('0.15', 'M2,18 L32,16 L62,16', 'RF, low ceiling') +
                irow('0.10', 'M2,23 L20,18 L40,11 L62,5', 'new, undertrained');
  var PROPOSE = '<div class="fig-pp">Samples diverse hypotheses with probabilities.</div>' +
                bar('more epochs', '0.55', 100) + bar('use attention', '0.30', 55) + bar('pre-trained backbone', '0.15', 27);
  var EXECUTE = 'A coding agent writes code for the chosen hypothesis and runs it in a sandbox.' +
                '<div class="fig-rwrs"><span>Read</span><span>Write</span><span>Run</span><span>Score</span></div>' +
                '<div class="fig-newnode">&rarr; new node <strong>0.55</strong></div>';

  /* ---------- pieces: natW/natH = large size, slot {x,y,s} = settled ---------- */
  var P = {
    // arrows first (paint behind), full-stage, settle at (0,0) scale 1
    aSel:    { natW: W, natH: H, x: 0, y: 0, s: 1, flat: true, html: arrow(1, 'M190,180 L214,168') },
    aB:      { natW: W, natH: H, x: 0, y: 0, s: 1, flat: true, html: arrow(2, 'M1016,172 L1040,166') },
    aExp:    { natW: W, natH: H, x: 0, y: 0, s: 1, flat: true, html: arrow(3, 'M1112,262 C1112,400 1050,510 1008,510') },
    aC:      { natW: W, natH: H, x: 0, y: 0, s: 1, flat: true, html: arrow(4, 'M358,540 L190,540') },
    aRepeat: { natW: W, natH: H, x: 0, y: 0, s: 1, flat: true, html: arrowRepeat() },

    treeA:   { natW: 250, natH: 300, x: 48,   y: 92,  s: 0.56, html: tree({ a: 'cand', b: 'cand', c: 'cand', nu: 'hidden' }, false) },
    selHead: { natW: 480, natH: 64,  x: 394,  y: 24,  s: 0.92, html: header('Node&nbsp;Selection') },
    inspect: { natW: 340, auto: true, x: 216, y: 90,  s: 0.90, html: card('var(--accent)', '🔍 Inspect', INSPECT) },
    magTree: { natW: 250, natH: 300, x: 550,  y: 100, s: 0.52, html: tree({ a: 'cand', b: 'cand', c: 'cand', nu: 'hidden' }, true) },
    reason:  { natW: 340, auto: true, x: 708, y: 90,  s: 0.90, html: card('var(--blue)', '🧠 Reason',
                 '0.47 is the highest score an MLP can reach. The new architecture has the highest potential.<br><strong>&rarr; Select 0.10</strong>') },
    treeB:   { natW: 250, natH: 300, x: 1042, y: 92,  s: 0.56, html: tree({ a: 'selected', b: 'cand', c: 'cand', nu: 'hidden' }, false) },

    expHead: { natW: 480, natH: 64,  x: 467,  y: 386, s: 0.9,  html: header('Node&nbsp;Expansion') },
    propose: { natW: 340, auto: true, x: 360, y: 426, s: 0.90, html: card('var(--pink)', '🎲 Propose', PROPOSE) },
    execute: { natW: 340, auto: true, x: 700, y: 426, s: 0.90, html: card('var(--green)', '⚙️ Execute', EXECUTE) },
    treeC:   { natW: 250, natH: 300, x: 48,   y: 426, s: 0.56, html: tree({ a: 'selected', b: 'cand', c: 'cand', nu: 'new' }, false) }
  };

  var BEATS = [
    { id: 'treeA',   cap: '<strong>The search tree.</strong> Each node is one validated experiment — a hypothesis with its code, logs and score.' },
    { id: 'selHead', arrow: 'aSel', cap: '<strong>Node selection.</strong> The scientist decides which node is most worth expanding next.' },
    { id: 'inspect', cap: '<strong>Inspect.</strong> It reads every candidate’s training curves and logs to see <em>why</em> each one stalled.' },
    { id: 'magTree', cap: '<strong>Looking closely.</strong> It examines the inspected nodes — 0.47 has plateaued, 0.10 is just undertrained.' },
    { id: 'reason',  cap: '<strong>Reason.</strong> 0.10 has the most headroom, so the scientist selects it over the higher-scoring 0.47.' },
    { id: 'treeB',   arrow: 'aB', cap: 'The selected node, <strong>0.10</strong>, becomes the parent to expand.' },
    { id: 'expHead', arrow: 'aExp', cap: '<strong>Node expansion.</strong> Now the scientist generates and runs a new hypothesis.' },
    { id: 'propose', cap: '<strong>Propose.</strong> Verbalized sampling proposes a diverse set of hypotheses with probabilities.' },
    { id: 'execute', cap: '<strong>Execute.</strong> A coding agent writes the code, runs it in a sandbox and records the score.' },
    { id: 'treeC',   arrow: 'aC', cap: 'A new best node, <strong>0.55</strong>, is added to the tree.' },
    { id: 'aRepeat', cap: 'One full search step. <strong>Repeat</strong> until the budget runs out.' }
  ];

  /* ---------- build DOM ---------- */
  var el = {};
  Object.keys(P).forEach(function (id) {
    var p = P[id];
    var d = document.createElement('div');
    d.className = 'fig-comp';
    d.style.width = p.natW + 'px';
    d.style.height = p.auto ? 'auto' : (p.natH + 'px');
    d.innerHTML = p.html;
    inner.appendChild(d);
    el[id] = d;
    if (p.auto) p.natH = d.offsetHeight;   // hug content → no vertical empty space
  });

  function fit() {
    var s = stageEl.clientWidth / W;
    var top = 16;                                   // crop the empty space above the figure
    scaleEl.style.transform = 'translateY(' + (-top * s) + 'px) scale(' + s + ')';
    stageEl.style.height = ((H - top - 24) * s) + 'px';
  }
  fit();
  window.addEventListener('resize', fit);

  function settleT(p) { return 'translate(' + p.x + 'px,' + p.y + 'px) scale(' + p.s + ')'; }
  function spotT(p)   { return 'translate(' + ((W - p.natW) / 2) + 'px,' + ((H - p.natH) / 2) + 'px) scale(1)'; }

  /* ---------- timeline ---------- */
  var ENTER = 700, HOLD = 2000, SETTLE = 950, GAP = 500, ARROW_HOLD = 3000, END_HOLD = 3200;
  var cur = 0, playing = false, timers = [], shown = new Set();

  function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function resetAll() {
    shown = new Set();
    Object.keys(el).forEach(function (id) {
      var d = el[id];
      d.style.transition = 'none';
      d.style.transform = settleT(P[id]);
      d.style.zIndex = '1';
      d.style.opacity = '0';
    });
    fill.style.transition = 'none'; fill.style.width = '0%';
    void inner.offsetWidth;
  }
  function dimShown()     { shown.forEach(function (id) { var c = el[id]; c.style.transition = 'opacity .45s ease'; c.style.opacity = '.12'; }); }
  function restoreShown() { shown.forEach(function (id) { var c = el[id]; c.style.transition = 'opacity .5s ease';  c.style.opacity = '1'; }); }
  function revealArrow(id) { var c = el[id]; c.style.transition = 'opacity .6s ease'; c.style.opacity = '1'; shown.add(id); }

  function setCap(html) { capEl.classList.remove('show'); capEl.innerHTML = html; void capEl.offsetWidth; capEl.classList.add('show'); }
  function progress(i) {
    fill.style.transition = 'width ' + (ENTER + HOLD + SETTLE) + 'ms linear';
    fill.style.width = (((i + 1) / BEATS.length) * 100) + '%';
  }

  function playBeat(i) {
    cur = i;
    if (i === 0) resetAll();
    var b = BEATS[i], d = el[b.id], p = P[b.id];
    setCap(b.cap);
    progress(i);

    if (p.flat) {                                  // final repeat-loop arrow
      restoreShown();
      d.style.transition = 'opacity .7s ease';
      d.style.opacity = '1'; shown.add(b.id);
      at(ARROW_HOLD, function () { at(END_HOLD, function () { playBeat(0); }); });
      return;
    }

    dimShown();                                    // dim placed pieces; this one appears CRISP at native size
    d.style.transition = 'opacity .4s ease';
    d.style.transform = spotT(p);
    d.style.zIndex = '6';
    d.style.opacity = '1';

    at(ENTER + HOLD, function () {                  // settle (scale DOWN into slot); restore others; drop arrow
      d.style.transition = 'transform ' + SETTLE + 'ms cubic-bezier(.4,0,.2,1), opacity .45s ease';
      d.style.transform = settleT(p);
      restoreShown();
      shown.add(b.id);
      if (b.arrow) revealArrow(b.arrow);
      at(SETTLE, function () { d.style.zIndex = '1'; });
    });
    at(ENTER + HOLD + SETTLE + GAP, function () {
      if (i + 1 < BEATS.length) playBeat(i + 1);
    });
  }

  function play() { playing = true;  fig.setAttribute('data-playing', 'true');  clearTimers(); playBeat(cur >= BEATS.length ? 0 : cur); }
  function stop() { playing = false; fig.setAttribute('data-playing', 'false'); clearTimers();
                    var w = getComputedStyle(fill).width; fill.style.transition = 'none'; fill.style.width = w; }
  function toggle() { if (playing) { stop(); fig.dataset.userPaused = '1'; } else { fig.dataset.userPaused = ''; play(); } }

  playBtn.addEventListener('click', function (e) { e.stopPropagation(); toggle(); });
  stageEl.addEventListener('click', toggle);

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

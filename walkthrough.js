/* ARTS — cinematic assembly of Figure 1.
   Each piece appears centre-stage with a caption, then settles into place. */
(function () {
  'use strict';
  var fig = document.getElementById('fig');
  if (!fig) return;

  var W = 960, H = 560;
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
  function panel(title, subs) {
    var s = subs.map(function (x) {
      return '<div class="fig-sub" style="--c:' + x.c + '"><div class="fig-sub-h">' + x.h + '</div><p>' + x.p + '</p></div>';
    }).join('');
    return '<div class="fig-panel"><div class="fig-panel-h">' + title + '</div><div class="fig-subs">' + s + '</div></div>';
  }
  function arrowsSVG() {
    return '<svg viewBox="0 0 960 560" class="fig-arrows">' +
      '<defs><marker id="ah" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">' +
      '<path d="M0,0 L7,3 L0,6 Z" fill="#b9b2a6"/></marker></defs>' +
      '<g fill="none" stroke="#b9b2a6" stroke-width="2.4" marker-end="url(#ah)">' +
        '<path d="M250,200 L296,200"/>' +
        '<path d="M664,200 L716,200"/>' +
        '<path d="M824,316 C824,400 760,430 666,438"/>' +
        '<path d="M296,440 L250,440"/>' +
        '<path d="M40,438 L18,438 L18,202 L36,202"/>' +
      '</g>' +
      '<text x="8" y="330" font-size="13" fill="#8a8478" transform="rotate(-90 8,330)">repeat until budget runs out</text>' +
      '</svg>';
  }

  /* ---- pieces & final layout (in 960x560 space) ---- */
  var PIECES = {
    treeA:   { x: 40,  y: 90,  w: 200, h: 220, html: tree({ a: 'cand', b: 'cand', c: 'cand', nu: 'hidden' }) },
    selPanel:{ x: 300, y: 112, w: 360, h: 176, html: panel('NODE&nbsp;SELECTION', [
                 { c: 'var(--accent)', h: '🔍 Inspect', p: 'Reads each node’s logs. 0.47 MLP at ceiling · 0.15 RF low · 0.10 undertrained.' },
                 { c: 'var(--blue)',   h: '🧠 Reason',  p: '0.47 has plateaued; 0.10 has the most headroom. → Select 0.10.' }]) },
    treeB:   { x: 720, y: 90,  w: 200, h: 220, html: tree({ a: 'selected', b: 'cand', c: 'cand', nu: 'hidden' }) },
    expPanel:{ x: 300, y: 360, w: 360, h: 168, html: panel('NODE&nbsp;EXPANSION', [
                 { c: 'var(--pink)',  h: '🎲 Propose', p: 'Diverse hypotheses — more epochs 0.55 · attention 0.30 · pre-trained 0.15.' },
                 { c: 'var(--green)', h: '⚙️ Execute', p: 'A coding agent runs the code in a sandbox and records the score.' }]) },
    treeC:   { x: 40,  y: 330, w: 200, h: 220, html: tree({ a: 'selected', b: 'cand', c: 'cand', nu: 'new' }) },
    arrows:  { x: 0,   y: 0,   w: 960, h: 560, html: arrowsSVG(), flat: true }
  };

  var BEATS = [
    { id: 'treeA',    cap: '<strong>The search tree.</strong> Each node is one validated experiment — a hypothesis with its code, logs and score.' },
    { id: 'selPanel', cap: '<strong>Node selection.</strong> The scientist inspects each node’s logs and reasons about <em>why</em> it scored as it did.' },
    { id: 'treeB',    cap: 'It selects <strong>0.10</strong> — the node with the most headroom, not 0.47’s top score.' },
    { id: 'expPanel', cap: '<strong>Node expansion.</strong> Propose diverse hypotheses, then execute the chosen one in a sandbox.' },
    { id: 'treeC',    cap: 'A new best node, <strong>0.55</strong>, is added to the tree.' },
    { id: 'arrows',   cap: 'Put together, one search step. <strong>Repeat</strong> until the budget runs out.' }
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
  var ENTER = 600, HOLD = 1500, SETTLE = 850, GAP = 350, ARROW_HOLD = 2200, END_HOLD = 2600;
  var cur = 0, playing = false, timers = [];

  function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function centreTransform(d) {
    var cx = d.offsetLeft + d.offsetWidth / 2, cy = d.offsetTop + d.offsetHeight / 2;
    var k = Math.min((W * 0.58) / d.offsetWidth, (H * 0.6) / d.offsetHeight, 1.7);
    return 'translate(' + (W / 2 - cx) + 'px,' + (H / 2 - cy) + 'px) scale(' + k + ')';
  }

  function resetAll() {
    Object.keys(el).forEach(function (id) {
      var d = el[id];
      d.style.transition = 'none';
      d.style.transform = '';
      d.style.zIndex = '1';
      d.classList.remove('in');
    });
    scrim.classList.remove('on');
    fill.style.transition = 'none'; fill.style.width = '0%';
    void inner.offsetWidth;
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

    if (PIECES[b.id].flat) {                       // arrows — just fade in
      d.style.transition = 'opacity .6s ease';
      d.classList.add('in');
      at(ARROW_HOLD, function () { at(END_HOLD, function () { playBeat(0); }); });
      return;
    }

    // appear at centre (instant), fade in
    d.style.transition = 'opacity .5s ease';
    d.style.transform = centreTransform(d);
    d.style.zIndex = '6';
    d.classList.add('in');
    scrim.classList.add('on');

    at(ENTER + HOLD, function () {                  // settle into place
      d.style.transition = 'transform ' + SETTLE + 'ms cubic-bezier(.4,0,.2,1)';
      d.style.transform = '';
      scrim.classList.remove('on');
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

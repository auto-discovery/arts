/* ARTS — autoplaying, video-style walkthrough of Figure 1 */
(function () {
  'use strict';
  var root = document.getElementById('walk');
  if (!root) return;

  var eyebrowEl = document.getElementById('walkEyebrow');
  var titleEl   = document.getElementById('walkTitle');
  var bodyEl    = document.getElementById('walkBody');
  var playBtn   = document.getElementById('walkPlay');
  var stage     = root.querySelector('.walk-stage');
  var prog      = document.getElementById('walkProgress');

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
    el.setAttribute('class', 'wnode ' + cls);
    if (id === 'nu') {
      var e = document.getElementById('e-nu');
      if (e) e.setAttribute('class', 'wedge' + (cls.indexOf('hidden') !== -1 ? ' hidden' : ''));
    }
  }

  var N = STEPS.length;
  var i = 0, timer = null, playing = false;
  var DUR = 2600;

  function paintProgress(animate) {
    var to = ((i + 1) / N) * 100;
    if (animate) {
      prog.style.transition = 'none';
      prog.style.width = (i / N) * 100 + '%';
      void prog.offsetWidth;                  // reflow
      prog.style.transition = 'width ' + DUR + 'ms linear';
      prog.style.width = to + '%';
    } else {
      var w = getComputedStyle(prog).width;   // freeze where it is
      prog.style.transition = 'none';
      prog.style.width = w;
    }
  }

  function render(animate) {
    var s = STEPS[i];
    root.setAttribute('data-step', i);
    eyebrowEl.textContent = s.eyebrow;
    titleEl.textContent = s.title;
    bodyEl.innerHTML = s.body;
    setClass('a', s.n.a); setClass('b', s.n.b); setClass('c', s.n.c); setClass('nu', s.n.nu);
    paintProgress(animate);
  }

  function go(k, animate) { i = ((k % N) + N) % N; render(animate); }

  function play() {
    playing = true;
    root.setAttribute('data-playing', 'true');
    clearInterval(timer);
    render(true);                              // animate current step's progress
    timer = setInterval(function () { go(i + 1, true); }, DUR);
  }
  function stop() {
    playing = false;
    root.setAttribute('data-playing', 'false');
    clearInterval(timer);
    paintProgress(false);                      // freeze the bar
  }
  function toggle() { playing ? stop() : play(); }

  playBtn.addEventListener('click', function (e) { e.stopPropagation(); toggle(); });
  stage.addEventListener('click', toggle);     // click the video to pause/play

  // start automatically; (re)start when it scrolls into view the first time
  render(false);
  play();
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting && playing) { stop(); }       // pause when off-screen
        else if (en.isIntersecting && !playing && !root.dataset.userPaused) { play(); }
      });
    }, { threshold: 0.25 });
    io.observe(root);
  }

  // remember an explicit user pause so we don't auto-resume on scroll
  playBtn.addEventListener('click', function () { root.dataset.userPaused = playing ? '' : '1'; });
  stage.addEventListener('click', function () { root.dataset.userPaused = playing ? '' : '1'; });
})();

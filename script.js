/* ARTS project page — interactions (dependency-free) */
(function () {
  'use strict';

  /* ---- scrollspy: highlight active section in the side TOC ---- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.toc-links a[href^="#"]'));
  var map = new Map();
  links.forEach(function (a) {
    var sec = document.getElementById(a.getAttribute('href').slice(1));
    if (sec) map.set(sec, a);
  });
  if (map.size && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (l) { l.classList.remove('active'); });
          var a = map.get(e.target);
          if (a) a.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    map.forEach(function (_, sec) { spy.observe(sec); });
  }

  /* ---- scroll reveal ---- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var ro = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(reveals, function (el) { ro.observe(el); });
  } else {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('in'); });
  }

  /* ---- smooth-scroll for in-page anchors ---- */
  Array.prototype.forEach.call(document.querySelectorAll('a[href^="#"]'), function (a) {
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

  /* ---- copy BibTeX ---- */
  var btn = document.getElementById('copyBtn');
  var bib = document.getElementById('bibtexCode');
  if (btn && bib) {
    btn.addEventListener('click', function () {
      var text = bib.innerText.trim();
      var done = function () {
        btn.textContent = 'Copied ✓';
        btn.classList.add('copied');
        setTimeout(function () { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1800);
      };
      var fallback = function () {
        var ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (_) {}
        document.body.removeChild(ta);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else { fallback(); }
    });
  }

  /* ---- search-tree task selector (self-drawn trees) ---- */
  var treeTabs = document.getElementById('treeTabs');
  var treePair = document.getElementById('treePair');
  if (treeTabs && treePair) {
    var treeCap = document.getElementById('treeCap');
    // node = [label, score, depth, kind]   kind: root|mid|good|best|fail
    var TASKS = {
      metamaze: {
        cap: '<strong>MetaMaze.</strong> ARTS keeps the CNN idea alive after a crash (an implementation bug, <em>not</em> a bad hypothesis), explores diverse follow-ups, and reasons to a high-quality <strong>48.57</strong>. AIRA finds the LSTM at depth&nbsp;1 (48.04) but abandons it.',
        arts: ['48.57', [['MLP PPO baseline','15.73',0,'root'],['config crash','—',1,'fail'],['CNN encoder','23.03',1,'good'],['deeper conv','25.96',2,'mid'],['scale up training','31.23',3,'mid'],['CNN + scale','31.23',4,'mid'],['richer observation','48.57',4,'best']]],
        aira: ['48.04', [['PPO baseline','15.73',0,'root'],['PPO + LSTM/GRU','48.04',1,'best'],['LSTM + RND/ICM','—',2,'fail'],['LSTM + action masking','19.60',2,'mid'],['RND intrinsic reward','28.85',1,'mid'],['curriculum learning','—',1,'fail'],['5 more LSTM combos abandoned','17–22',2,'mid']]]
      },
      vesuvius: {
        cap: '<strong>Vesuvius.</strong> ARTS opens <strong>five diverse strategies</strong> as siblings of the root, revives the strongest fragment-selection branch, and reaches a high-quality <strong>0.575</strong>. AIRA commits to one deep architecture chain for 0.510.',
        arts: ['0.575', [['baseline','0.000',0,'root'],['DeepLabV3-ResNet50','0.151',1,'mid'],['11-channel stack','0.165',1,'mid'],['Focal + BCE','0.034',1,'fail'],['train on fragments 1 & 2','0.479',1,'good'],['strong aug ±45°','0.105',1,'fail'],['flips + 90° rotations','0.575',2,'best'],['TTA / thresh / sampler …','0.05–0.50',2,'mid']]],
        aira: ['0.510', [['baseline','0.000',0,'root'],['3D U-Net','0.219',1,'mid'],['2.5D U-Net + pretrained','0.472',1,'good'],['z-axis CRNN','0.100',1,'mid'],['FPN → … → Swin-UNETR','0.18–0.39',2,'mid'],['2.5D U-Net + ConvNeXt-L','0.510',3,'best']]]
      },
      hms: {
        cap: '<strong>HMS Brain.</strong> ARTS keeps a diverse set of branches and refines the strongest into a high-quality <strong>KL&nbsp;0.467</strong>. AIRA tries a few drafts that blow up (KL&nbsp;4–9) and never recovers its best.',
        arts: ['KL 0.467', [['uniform baseline','1.462',0,'root'],['ResNet-18 spectrogram','0.623',1,'mid'],['+ SpecAugment','0.562',1,'mid'],['pretrained ResNet-50','0.510',1,'good'],['EfficientNet-B0','0.702',2,'fail'],['+ SpecAugment','0.565',2,'fail'],['+ Mixup','0.527',2,'mid'],['Mixup + SpecAugment','0.519',3,'mid'],['+ per-channel norm','0.495',4,'mid'],['+ 6-class head, GroupKFold','0.478',5,'mid'],['+ tuned LR schedule','0.467',6,'best']]],
        aira: ['KL 0.513', [['uniform baseline','1.462',0,'root'],['ResNet spectrogram (draft 1)','0.513',1,'best'],['hand-crafted features','—',1,'fail'],['deriv-stack + EfficientNet','0.662',1,'fail'],['EfficientNet 3-ch mismatch','4.080',2,'fail'],['compounded variant','9.430',3,'fail']]]
      }
    };
    function esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
    function renderTree(nodes){
      var h = '';
      nodes.forEach(function(n,i){
        var d = n[2], gap = 0;
        if (d > 0) { for (var j=i-1;j>=0;j--){ if (nodes[j][2] === d-1){ gap = i-j; break; } } }
        var label = esc(n[0]) + (n[3]==='best' ? ' <span style="color:var(--green)">★</span>' : '');
        h += '<div class="tn k-'+n[3]+'" data-d="'+d+'" style="--d:'+d+';--g:'+gap+'">' +
             '<span class="tn-sc">'+esc(n[1])+'</span><span class="tn-lb">'+label+'</span></div>';
      });
      return h;
    }
    function col(who, best, nodes){
      var tags = who === 'ARTS'
        ? 'diverse hypotheses &middot; keeps promising branches alive &middot; high-quality result'
        : 'greedy, score-based selection &middot; no reasoning over failures';
      return '<div class="tree-col">' +
             '<div class="tree-col-h'+(who==='AIRA'?' aira':'')+'"><span class="who">'+who+'</span> search tree<span class="best">best '+best+'</span></div>' +
             '<div class="tree-tags'+(who==='AIRA'?' aira':'')+'">'+tags+'</div>' +
             '<div class="ttree">'+renderTree(nodes)+'</div></div>';
    }
    function show(key){
      var t = TASKS[key]; if (!t) return;
      treePair.innerHTML = col('ARTS', t.arts[0], t.arts[1]) + col('AIRA', t.aira[0], t.aira[1]);
      if (treeCap) treeCap.innerHTML = t.cap;
    }
    treeTabs.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.tree-tab') : null;
      if (!btn) return;
      Array.prototype.forEach.call(treeTabs.querySelectorAll('.tree-tab'), function (t) { t.classList.remove('active'); });
      btn.classList.add('active');
      show(btn.getAttribute('data-tree'));
    });
    var active = treeTabs.querySelector('.tree-tab.active') || treeTabs.querySelector('.tree-tab');
    if (active) show(active.getAttribute('data-tree'));
  }
})();

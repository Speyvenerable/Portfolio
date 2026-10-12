(function(){
  /* ============ YOUR GALLERY: add / change pictures here ============
     img   = file inside the assets folder (leave '' for an empty slot)
     label = text on the tag      red = true gives the red tag style
     x / y = where the picture lands, in % of the box (desktop)        */
  var ITEMS = [
    { img:'assets/ugly-king.jpg',  label:'UGLY KING' },
    { img:'assets/god-of-war.jpg', label:'GOD OF WAR', red:true },
    { img:'assets/avatar.jpg',     label:'SPEYVENERABLE' },
    { img:'assets/demon-king.jpg', label:'DEMON KING' },
    { img:'assets/party.jpg',      label:'PARTY' },
    { img:'assets/last-dance.jpg', label:'LAST DANCE' },
    { img:'assets/meet-again.jpg', label:'MEET AGAIN' },
    { img:'assets/just-myself.jpg',label:'JUST MYSELF' },
    { img:'assets/winner.jpg',     label:'WINNER' },
    { img:'assets/exgarratted.jpg',label:'EXGARRATTED' },
    { img:'assets/trio.jpg',       label:'TRIO' },
    { img:'assets/me-and-amon.jpg',label:'ME AND AMON' },
    { img:'assets/two-different-worlds.jpg', label:'2 DIFFERNT WORLD' },
    { img:'assets/dinner.jpg',     label:'DINNER' },
    { img:'assets/trunoest.jpg',        label:'TRUNOEST' },
    { img:'assets/baclund-gem.jpg',     label:'BACLUND GEM' },
    { img:'assets/ice-cream-kid.jpg',   label:'ICE CREAM KID' },
    { img:'assets/rose-redemption.jpg', label:'ROSE REDEMPTION' },
    { img:'assets/the-best-brother.jpg',label:'THE BEST BROTHER' },
    { img:'assets/light.jpg',           label:'LIGHT...' },
    { img:'assets/lightseeker.jpg',     label:'LIGHTSEEKER' }
  ];
  /* The pictures are scattered automatically (rows, with a little random tilt and offset).
     Just add or remove lines above and the page adapts. */

  var $ = function(id){ return document.getElementById(id); };
  var stage = $('g-stage'), folder = $('folder'), folderBk = $('folder-bk'), svg = $('g-lines'), fxBox = $('g-fx');
  var NS = 'http://www.w3.org/2000/svg';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
  var cards = [], isOpen = false, moved = false, linesT = 0, busy = false;
  function T(fx, fy, s, r){ return 'translate(-50%,-50%) translate(' + fx + 'px,' + fy + 'px) scale(' + s + ') rotate(' + r + 'deg)'; }
  $('f-count').textContent = ITEMS.length + ' FILES';

  function rnd(a, b){ return a + Math.random() * (b - a); }
  function mk(tag, attrs){ var e = document.createElementNS(NS, tag); for(var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function phone(){ return window.innerWidth <= 700; }

  /* ---- build cards (they start hidden inside the folder) ---- */
  ITEMS.forEach(function(it, i){
    var c = document.createElement('div'); c.className = 'g-card glitch' + (it.red ? ' red' : '') + (it.img ? '' : ' empty');
    var im = document.createElement('div'); im.className = 'img'; if(it.img) im.style.backgroundImage = 'url("' + it.img + '")';
    var lb = document.createElement('div'); lb.className = 'lab'; lb.textContent = it.label;
    c.appendChild(im); c.appendChild(lb);
        c.style.setProperty('--dl', (0.35 + i * 0.12) + 's');
    stage.appendChild(c); cards.push(c);
    c._it = it; c._i = i; c._drag = false;
    wireCard(c);
  });

  /* automatic scatter: returns [x in %, y in px, rotation] for every card */
  var ROWX = { 4:[15,38,62,85], 3:[26,50,74], 2:[35,65], 1:[50] };
  function seed(i, k){ var v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); }
  function scatter(ph){
    var n = cards.length, out = [], i = 0, r = 0;
    if(ph){
      for(i = 0; i < n; i++){
        var row = Math.floor(i / 2), left = (i % 2 === 0), alone = (i === n - 1 && n % 2 === 1);
        out.push([alone ? 50 : (left ? 27 : 73), 100 + row * 165 + (left ? 0 : 22) + (seed(i,1) - .5) * 14, (seed(i,2) - .5) * 14]);
      }
      return { pos: out, oh: 100 + Math.ceil(n / 2) * 165 + 120 };
    }
    while(i < n){
      var want = (r % 2 === 0) ? 4 : 3, c = Math.min(want, n - i), xs = ROWX[c];
      for(var k = 0; k < c; k++, i++){
        out.push([xs[k] + (seed(i,1) - .5) * 4, 112 + r * 226 + (seed(i,3) - .5) * 30, (seed(i,2) - .5) * 15]);
      }
      r++;
    }
    return { pos: out, oh: 112 + r * 226 + 70 };
  }

  var FY = 330;   /* where the closed folder sits (px from the top of the box) */
  function place(){
    var W = stage.clientWidth, ph = phone(), L = scatter(ph), fx = W * .5, fy = FY;
    stage.style.setProperty('--oh', L.oh + 'px'); stage.style.setProperty('--ch', 620 + 'px');
    cards.forEach(function(c, i){
      var p = L.pos[i]; c._rot = p[2];
      c.style.setProperty('--x', p[0] + '%'); c.style.setProperty('--y', p[1] + 'px');
      c.style.setProperty('--w', ph ? Math.min(200, W * .45) + 'px' : Math.min(250, W * .215) + 'px');
      if(!c._moved){ c.style.left = ''; c.style.top = ''; }
      var tx = W * p[0] / 100, ty = p[1];
      c._cx = fx - tx; c._cy = fy - ty - 46 - i * 2; c._cr = (i % 5) * 4 - 8;
      if(!isOpen){ c.style.setProperty('--fx', c._cx + 'px'); c.style.setProperty('--fy', c._cy + 'px'); c.style.setProperty('--s', '.36'); c.style.setProperty('--r', c._cr + 'deg'); }
      else { c.style.setProperty('--fx', '0px'); c.style.setProperty('--fy', '0px'); c.style.setProperty('--s', '1'); c.style.setProperty('--r', c._rot + 'deg'); }
    });
  }

  /* ---- lines between pictures ---- */
  function centre(c){ return { x:c.offsetLeft, y:c.offsetTop }; }
  function buildLines(){
    while(svg.firstChild) svg.removeChild(svg.firstChild);
    for(var i = 1; i < cards.length; i++){
      var ln = mk('line', { pathLength:1 }); ln.style.setProperty('--dl', ((i - 1) * 0.2) + 's'); svg.appendChild(ln);
    }
    cards.forEach(function(){ svg.appendChild(mk('rect', { 'class':'node', width:10, height:10 })); });
    updateLines();
  }
  function updateLines(){
    var ls = svg.querySelectorAll('line'), ns = svg.querySelectorAll('.node');
    cards.forEach(function(c, i){
      var p = centre(c);
      if(ns[i]){ ns[i].setAttribute('x', p.x - 5); ns[i].setAttribute('y', p.y - 5); }
      if(i > 0){ var q = centre(cards[i-1]); var l = ls[i-1]; l.setAttribute('x1', q.x); l.setAttribute('y1', q.y); l.setAttribute('x2', p.x); l.setAttribute('y2', p.y); }
    });
  }

  /* ---- sparks when the folder opens ---- */
  function sparks(){
    fxBox.innerHTML = ''; var cols = ['#ffffff', '#7df9ff', '#6ea2ff', '#ff2d55'];
    for(var i = 0; i < 36; i++){
      var a = Math.random() * Math.PI * 2, d = rnd(90, 360), s = document.createElement('i');
      s.style.setProperty('--tx', Math.cos(a) * d + 'px'); s.style.setProperty('--ty', (Math.sin(a) * d - 40) + 'px');
      s.style.setProperty('--s', Math.round(rnd(3, 8)) + 'px'); s.style.setProperty('--c', cols[i % 4]); s.style.setProperty('--d', (Math.random() * .25) + 's');
      fxBox.appendChild(s);
    }
    setTimeout(function(){ fxBox.innerHTML = ''; }, 1400);
  }


  /* ---- particles of light that form each picture as it scrolls into view ---- */
  var armed = false, io = null;
  function assemble(c){
    if(c._forming || c.classList.contains('formed')) return; c._forming = true;
    var it = c._it, w = c.clientWidth, h = c.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var cv = document.createElement('canvas'); cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); c.insertBefore(cv, c.firstChild);
    var ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
    var cell = Math.max(6, Math.round(w / 34)), cols = Math.ceil(w / cell), rows = Math.ceil(h / cell), px = null;
    var im = new Image();
    function run(){
      var P = [], i, x, y;
      for(y = 0; y < rows; y++) for(x = 0; x < cols; x++){
        var col = px ? 'rgb(' + px[(y * cols + x) * 4] + ',' + px[(y * cols + x) * 4 + 1] + ',' + px[(y * cols + x) * 4 + 2] + ')' : null;
        P.push({ tx:x * cell, ty:y * cell, sx:(Math.random() * 1.6 - .3) * w, sy:(Math.random() * 1.6 - .3) * h, d:Math.random() * .45 + (x / cols) * .15, col:col, hue:Math.random() });
      }
      var T = 1700, t0 = performance.now();
      (function frame(now){
        var t = (now - t0) / T; ctx.clearRect(0, 0, w, h);
        for(i = 0; i < P.length; i++){
          var p = P[i], k = Math.min(1, Math.max(0, (t - p.d) / .5)), e = 1 - Math.pow(1 - k, 3);
          if(t < p.d) { k = 0; e = 0; }
          var x2 = p.sx + (p.tx - p.sx) * e, y2 = p.sy + (p.ty - p.sy) * e;
          var s = 2 + (cell - 1.5) * e;
          if(p.col && e > .55){ ctx.globalAlpha = Math.min(1, (e - .55) * 3); ctx.fillStyle = p.col; ctx.fillRect(x2, y2, s, s); ctx.globalAlpha = 1; }
          if(e < 1){
            ctx.globalAlpha = (1 - e * .7) * (t < p.d ? .0 : 1);
            ctx.fillStyle = p.hue < .5 ? '#9cd6ff' : (p.hue < .8 ? '#ffffff' : '#7df9ff');
            ctx.shadowColor = '#4aa8ff'; ctx.shadowBlur = 8;
            ctx.fillRect(x2 + (cell - 3) / 2 * e, y2 + (cell - 3) / 2 * e, 3, 3);
            ctx.shadowBlur = 0; ctx.globalAlpha = 1;
          }
        }
        if(t < 1.05) requestAnimationFrame(frame);
        else { c.classList.add('formed'); setTimeout(function(){ if(cv.parentNode) cv.parentNode.removeChild(cv); }, 800); }
      })(t0);
    }
    if(!it.img){ px = null; run(); return; }
    im.onload = function(){
      try{
        var oc = document.createElement('canvas'); oc.width = cols; oc.height = rows; var o = oc.getContext('2d');
        var r = Math.max(cols / im.width, rows / im.height), dw = im.width * r, dh = im.height * r;
        o.drawImage(im, (cols - dw) / 2, (rows - dh) / 2, dw, dh);
        px = o.getImageData(0, 0, cols, rows).data;
      }catch(err){ px = null; }
      run();
    };
    im.onerror = function(){ px = null; run(); };
    im.src = it.img;
  }
  function arm(){
    armed = true;
    if(!('IntersectionObserver' in window)){ cards.forEach(function(c){ c.classList.add('formed'); }); return; }
    if(!io) io = new IntersectionObserver(function(es){
      es.forEach(function(en){ if(en.isIntersecting && armed){ io.unobserve(en.target); assemble(en.target); } });
    }, { threshold:.3 });
    cards.forEach(function(c){ if(!c.classList.contains('formed') && !c._forming) io.observe(c); });
  }
  function disarm(){ armed = false; if(io) io.disconnect(); }

  /* ---- open / close ---- */
  /* cards leave / enter the folder along a smooth arc (Web Animations) */
  function fly(c, out, delay, dur, done){
    var rot = c._rot || 0, a, b;
    var open = T(0, 0, 1, rot), shut = T(c._cx, c._cy, .36, c._cr);
    var mid = out ? T(c._cx * .5, c._cy * .5 - 150, .72, (c._cr + rot) / 2) : T(c._cx * .5, c._cy * .5 - 120, .62, (c._cr + rot) / 2);
    var frames = out ? [{ transform:shut, easing:'cubic-bezier(.3,0,.2,1)' }, { transform:mid, offset:.38, easing:'cubic-bezier(.2,.7,.2,1)' }, { transform:open }]
                     : [{ transform:open, easing:'cubic-bezier(.4,0,.2,1)' }, { transform:mid, offset:.55, easing:'cubic-bezier(.5,0,.7,.4)' }, { transform:shut }];
    var an = c.animate(frames, { duration:dur, delay:delay, fill:'both', easing:'linear' });
    an.onfinish = function(){ an.cancel(); if(done) done(); };
  }
  function openIt(){
    if(busy) return; busy = true;
    isOpen = true; folder.classList.add('open'); folderBk.classList.add('open'); folder.setAttribute('aria-expanded', 'true'); folder.setAttribute('aria-label', 'Put the pictures back in the folder');
    $('g-hint').textContent = 'DRAG \u00B7 CLICK TO ENLARGE';
    cards.forEach(function(c){ c.classList.remove('top'); c.style.zIndex = ''; });
    stage.classList.add('open'); place();
    var n = cards.length, total = 0;
    cards.forEach(function(c, i){
      if(reduce) return;
      var d = 450 + i * 95; total = Math.max(total, d + 1250);
      c.style.setProperty('--gd', (d + 1000) + 'ms');
      fly(c, true, d, 1250);
    });
    if(!reduce) setTimeout(sparks, 520);
    buildLines(); clearTimeout(linesT);
    linesT = setTimeout(function(){ stage.classList.add('lines'); busy = false; }, reduce ? 0 : total + 100);
    setTimeout(arm, reduce ? 0 : Math.max(900, total - 500));
    if(reduce){ busy = false; cards.forEach(function(c){ c.classList.add('formed'); }); }
  }
  function closeIt(){
    if(busy) return; busy = true; disarm();
    isOpen = false; clearTimeout(linesT); stage.classList.remove('lines');
    $('g-hint').textContent = '\u25B6 CLICK THE FOLDER TO OPEN';
    cards.forEach(function(c){ c._moved = false; c.style.left = ''; c.style.top = ''; });
    var total = 0;
    cards.forEach(function(c, i){
      if(reduce) return;
      var d = 250 + (cards.length - 1 - i) * 60; total = Math.max(total, d + 900);
      /* keep final inline values until each card has arrived */
      fly(c, false, d, 900, function(){ if(!isOpen) place(); });
    });
    folder.classList.remove('open'); folderBk.classList.remove('open'); folder.setAttribute('aria-expanded', 'false'); folder.setAttribute('aria-label', 'Open the gallery folder');
    stage.classList.remove('open');
    setTimeout(function(){ place(); busy = false; }, reduce ? 0 : total + 950);
  }
  folder.addEventListener('click', function(){ isOpen ? closeIt() : openIt(); });

  /* ---- drag cards around, click to view ---- */
  var z = 5, lb = $('g-lb'), lbImg = $('g-lb-img'), lbCap = $('g-lb-cap');
  function wireCard(c){
    var sx = 0, sy = 0, ox = 0, oy = 0, down = false;
    c.addEventListener('pointerdown', function(e){
      if(!isOpen || busy) return; down = true; moved = false; sx = e.clientX; sy = e.clientY; ox = c.offsetLeft; oy = c.offsetTop;
      c.setPointerCapture(e.pointerId); z++; c.style.zIndex = z; c.classList.add('dragging'); stage.classList.add('drag');
      var zoom = parseFloat(getComputedStyle(stage).zoom) || 1; c._zoom = zoom;
    });
    c.addEventListener('pointermove', function(e){
      if(!down) return; var dx = (e.clientX - sx) / (c._zoom || 1), dy = (e.clientY - sy) / (c._zoom || 1);
      if(Math.abs(dx) + Math.abs(dy) > 4) moved = true;
      if(!moved) return;
      var W = stage.clientWidth, H = stage.clientHeight;
      c._moved = true; c.style.left = Math.max(30, Math.min(W - 30, ox + dx)) + 'px'; c.style.top = Math.max(30, Math.min(H - 30, oy + dy)) + 'px';
      updateLines();
    });
    function end(){ if(!down) return; down = false; c.classList.remove('dragging'); stage.classList.remove('drag'); }
    c.addEventListener('pointerup', function(){
      var was = moved; end();
      if(!was && c._it.img){ lbImg.src = c._it.img; lbImg.alt = c._it.label; lbCap.textContent = c._it.label; lb.hidden = false; }
    });
    c.addEventListener('pointercancel', end);
  }
  function closeLb(){ lb.hidden = true; }
  $('g-lb-x').addEventListener('click', closeLb);
  lb.addEventListener('click', function(e){ if(e.target === lb) closeLb(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeLb(); });

  place();
  var rT = 0;
  window.addEventListener('resize', function(){ clearTimeout(rT); rT = setTimeout(function(){ cards.forEach(function(c){ c._moved = false; c.style.left = ''; c.style.top = ''; }); place(); if(isOpen){ buildLines(); stage.classList.add('lines'); } }, 150); });
})();

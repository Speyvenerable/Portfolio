(function(){
  document.documentElement.classList.add('js');
  var BOOT = (document.querySelector('.boot') && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) ? 950 : 0;

  /* ---------- scroll reveal animations ---------- */
  var groups = [
    ['.view>.frame',''],['.sechead',''],['.home .side','from-left'],['.home .main>*',''],
    ['.status-title',''],['.stat',''],['.sdiv',''],['.chip',''],
    ['.card',''],['.more',''],['.about-body p',''],['.about-foot',''],
    ['.clist .crow','from-left'],['.gallery .tile','from-right'],['.gline',''],['.viewmore','']
  ];
  var revealEls = [];
  groups.forEach(function(g){
    var counts = new Map();
    document.querySelectorAll(g[0]).forEach(function(el){
      var p = el.parentNode, i = counts.get(p) || 0; counts.set(p, i+1);
      el.classList.add('rv'); if(g[1]) el.classList.add(g[1]);
      var base = el.matches('.view>.frame') ? 0 : .03;
      el.style.setProperty('--d', (base + Math.min(i,8)*.05) + 's');
      revealEls.push(el);
    });
  });
  if('IntersectionObserver' in window){
    var rio = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add('in'); rio.unobserve(en.target); (function(t){ setTimeout(function(){ t.style.setProperty('--d','0s'); }, 1600); })(en.target); }
      });
    },{threshold:.12, rootMargin:'0px 0px -6% 0px'});
    setTimeout(function(){ revealEls.forEach(function(el){ rio.observe(el); }); }, BOOT);
  } else { revealEls.forEach(function(el){ el.classList.add('in'); }); }

  /* ---------- text emerge: letters for headings, words for paragraphs ---------- */
  function splitEl(el, mode){
    var text = el.textContent.replace(/\s+/g,' ').trim(), i = 0;
    el.setAttribute('aria-label', text); el.textContent = '';
    var host = el;
    if(/flex|grid/.test(getComputedStyle(el).display)){ host = document.createElement('span'); el.appendChild(host); }
    text.split(/(\s)/).forEach(function(part){
      if(!part) return;
      if(part === ' '){ host.appendChild(document.createTextNode(' ')); return; }
      if(mode === 'wd'){
        var w = document.createElement('span'); w.className = 'wd'; w.setAttribute('aria-hidden','true');
        w.style.setProperty('--i', Math.min(i++, 70)); w.textContent = part; host.appendChild(w);
      } else {
        var wr = document.createElement('span'); wr.className = 'wrd'; wr.setAttribute('aria-hidden','true');
        part.split('').forEach(function(c){
          var sp = document.createElement('span'); sp.className = 'ch';
          sp.style.setProperty('--i', Math.min(i++, 46)); sp.textContent = c; wr.appendChild(sp);
        });
        host.appendChild(wr);
      }
    });
    el.classList.add(mode === 'ch' ? 'tx' : 'tw');
  }
  var textEls = [];
  ['.hello','.name','.pron','.status-title','.sechead .tag','.sechead .bar .title','.stat h4','.stat .big',
   '.card h3','.cybertag','.crow .l1','.viewmore','.more .br','.about-foot'].forEach(function(sel){
    document.querySelectorAll(sel).forEach(function(el){ splitEl(el,'ch'); textEls.push(el); });
  });
  ['.lead','.about-body p','.card p','.card li','.crow .l2','.stat .sub'].forEach(function(sel){
    document.querySelectorAll(sel).forEach(function(el){ splitEl(el,'wd'); textEls.push(el); });
  });
  document.querySelectorAll('.hello,.lead,.about-body p,.name,.pron').forEach(function(el){ el.classList.remove('rv'); });
  if('IntersectionObserver' in window){
    var tio = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add('t-in'); tio.unobserve(en.target); }
      });
    },{threshold:.25, rootMargin:'0px 0px -4% 0px'});
    setTimeout(function(){ textEls.forEach(function(el){ tio.observe(el); }); }, BOOT);
  } else { textEls.forEach(function(el){ el.classList.add('t-in'); }); }

  /* ---------- header hides on scroll down, returns on mouse move / scroll up ---------- */
  var nav = document.querySelector('nav.top'), lastY = window.scrollY, byHover = false, hideT;
  function showNav(){ nav.classList.remove('nav-hidden'); }
  window.addEventListener('scroll', function(){
    var y = window.scrollY, d = y - lastY;
    if(y < 80){ showNav(); byHover = false; }
    else if(d > 6 && !nav.matches(':hover') && !nav.contains(document.activeElement)){ nav.classList.add('nav-hidden'); byHover = false; }
    else if(d < -6){ showNav(); byHover = false; }
    lastY = y;
  }, {passive:true});
  window.addEventListener('mousemove', function(e){
    if(e.clientY < 100){ clearTimeout(hideT); if(nav.classList.contains('nav-hidden')){ byHover = true; } showNav(); }
    else if(byHover && window.scrollY > 80 && e.clientY > 200){
      clearTimeout(hideT);
      hideT = setTimeout(function(){ if(!nav.matches(':hover')){ nav.classList.add('nav-hidden'); byHover = false; } }, 450);
    }
  }, {passive:true});
  nav.addEventListener('focusin', showNav);

    var views = ['home','about','project','status','contact'];

  /* ---------- smooth scrolling (glide on wheel, eased jumps from the menu) ---------- */
  var smoothOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
                 !window.matchMedia('(pointer: coarse)').matches;
  var cur = window.scrollY, target = cur, raf = 0, jumping = false;
  function maxY(){ return document.documentElement.scrollHeight - window.innerHeight; }
  function clampY(v){ return Math.max(0, Math.min(maxY(), v)); }
  function tick(){
    var diff = target - cur;
    if(Math.abs(diff) < .4){ cur = target; window.scrollTo(0, cur); raf = 0; jumping = false; return; }
    cur += diff * (jumping ? .085 : .12);
    window.scrollTo(0, cur);
    raf = requestAnimationFrame(tick);
  }
  function glideTo(y, isJump){ target = clampY(y); jumping = !!isJump; if(!raf){ cur = window.scrollY; raf = requestAnimationFrame(tick); } }
  window.__glideTo = function(y){ if(smoothOK) glideTo(y, true); else window.scrollTo({top:y, behavior:'smooth'}); };
  if(smoothOK){
    window.addEventListener('wheel', function(e){
      if(e.ctrlKey || e.defaultPrevented) return;
      var el = e.target; while(el && el !== document.body){ var o = getComputedStyle(el).overflowY; if((o==='auto'||o==='scroll') && el.scrollHeight>el.clientHeight) return; el = el.parentNode; }
      e.preventDefault();
      var dy = e.deltaMode === 1 ? e.deltaY * 34 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
      if(!raf) target = window.scrollY;
      glideTo(target + dy, false);
    }, {passive:false});
    window.addEventListener('scroll', function(){ if(!raf){ cur = window.scrollY; target = cur; } }, {passive:true});
    window.addEventListener('keydown', function(e){
      var t = e.target.tagName; if(/INPUT|TEXTAREA|SELECT/.test(t) || e.ctrlKey || e.metaKey || e.altKey) return;
      var map = {ArrowDown:90, ArrowUp:-90, PageDown:innerHeight*.9, PageUp:-innerHeight*.9, ' ':(e.shiftKey?-1:1)*innerHeight*.9};
      if(e.key in map){ e.preventDefault(); if(!raf) target = window.scrollY; glideTo(target + map[e.key], false); }
      else if(e.key === 'Home'){ e.preventDefault(); glideTo(0, true); }
      else if(e.key === 'End'){ e.preventDefault(); glideTo(maxY(), true); }
    });
  }

  /* ---------- one scroll: nav jumps to sections ---------- */
  var ids = ['home','status','project','about','contact'];
  document.addEventListener('click', function(e){
    var t = e.target.closest('[data-go]');
    if(!t) return;
    e.preventDefault();
    var el = document.getElementById('view-' + t.getAttribute('data-go'));
    if(el){ var off = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)||0; window.__glideTo(el.getBoundingClientRect().top + window.scrollY - off); }
    try{ history.replaceState(null,'','#'+t.getAttribute('data-go')); }catch(x){}
  });
  function setActive(name){
    document.querySelectorAll('nav.top [data-go]').forEach(function(b){
      b.classList.toggle('active', b.getAttribute('data-go') === name);
    });
  }
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting) setActive(en.target.id.replace('view-',''));
      });
    },{rootMargin:'-45% 0px -50% 0px'});
    ids.forEach(function(i){ io.observe(document.getElementById('view-'+i)); });
  }
  setActive('home');
  if(location.hash){
    var first = document.getElementById('view-'+location.hash.replace('#',''));
    if(first) setTimeout(function(){ first.scrollIntoView(); },50);
  }

  /* ---------- theme: light / system / dark ---------- */
  var root = document.documentElement;
  var mq = window.matchMedia('(prefers-color-scheme: light)');
  function applyTheme(mode){
    var actual = mode === 'system' ? (mq.matches ? 'light' : 'dark') : mode;
    root.setAttribute('data-theme', actual);
    document.querySelectorAll('#themebox button').forEach(function(b){
      b.classList.toggle('on', b.getAttribute('data-theme') === mode);
    });
  }
  var saved = 'dark';
  try{ saved = localStorage.getItem('spey-theme') || 'dark'; }catch(e){}
  applyTheme(saved);
  document.getElementById('themebox').addEventListener('click', function(e){
    var b = e.target.closest('button'); if(!b) return;
    var mode = b.getAttribute('data-theme');
    try{ localStorage.setItem('spey-theme', mode); }catch(e){}
    applyTheme(mode);
  });
  mq.addEventListener && mq.addEventListener('change', function(){
    var m = 'dark'; try{ m = localStorage.getItem('spey-theme') || 'dark'; }catch(e){}
    if(m === 'system') applyTheme('system');
  });

  /* ---------- polish: progress line, picture parallax, cursor glow ---------- */
  var reduceM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fineP = window.matchMedia('(pointer: fine)').matches;
  var pbar = document.getElementById('progress-bar'), pframes = document.querySelectorAll('.view>.frame'), ptick = false;
  function polishUpdate(){
    ptick = false;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if(pbar) pbar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ')';
    if(!reduceM && fineP && window.innerWidth > 900){
      pframes.forEach(function(f){
        var r = f.getBoundingClientRect();
        if(r.bottom < -120 || r.top > window.innerHeight + 120) return;
        f.style.setProperty('--py', ((r.top + r.height / 2 - window.innerHeight / 2) * -0.05).toFixed(1) + 'px');
      });
    }
  }
  function polishReq(){ if(!ptick){ ptick = true; requestAnimationFrame(polishUpdate); } }
  window.addEventListener('scroll', polishReq, {passive:true});
  window.addEventListener('resize', polishReq);
  polishUpdate();

  var glowEl = document.getElementById('glow');
  if(glowEl && fineP && !reduceM){
    var gx = 0, gy = 0, gpend = false;
    window.addEventListener('mousemove', function(e){
      gx = e.clientX; gy = e.clientY;
      if(!gpend){ gpend = true; requestAnimationFrame(function(){
        gpend = false; glowEl.style.transform = 'translate3d(' + gx + 'px,' + gy + 'px,0)'; glowEl.classList.add('on');
      }); }
    }, {passive:true});
    document.addEventListener('mouseleave', function(){ glowEl.classList.remove('on'); });
  }
})();

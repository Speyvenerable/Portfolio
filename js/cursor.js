/* Custom cyber cursor: pixel dot + corner-bracket reticle, glitch burst on click. Desktop (mouse) only. */
(function(){
  if(!window.matchMedia || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var root = document.documentElement;

  var dot = document.createElement('div'); dot.className = 'cc-dot';
  var ret = document.createElement('div'); ret.className = 'cc-ret';
  ret.innerHTML = '<i></i><i></i><i></i><i></i><span class="cc-r"></span><span class="cc-c"></span>';
  var fx = document.createElement('div'); fx.className = 'cc-fx';
  document.body.appendChild(ret); document.body.appendChild(dot); document.body.appendChild(fx);

  var x = innerWidth/2, y = innerHeight/2, rx = x, ry = y, shown = false, raf = 0;
  var SEL = 'a,button,[role="button"],[role="slider"],input,select,textarea,label,summary,.navbtn,.crow,.pbtn,.viewmore,.mb-trk,[data-go]';

  function loop(){
    rx += (x - rx) * (reduce ? 1 : .22); ry += (y - ry) * (reduce ? 1 : .22);
    ret.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
    if(Math.abs(x - rx) > .1 || Math.abs(y - ry) > .1) raf = requestAnimationFrame(loop); else raf = 0;
  }
  document.addEventListener('mousemove', function(e){
    x = e.clientX; y = e.clientY;
    dot.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    if(!shown){ shown = true; rx = x; ry = y; root.classList.add('cc'); ret.classList.add('on'); dot.classList.add('on'); }
    var t = e.target && e.target.closest ? e.target.closest(SEL) : null;
    ret.classList.toggle('hot', !!t);
    dot.classList.toggle('hot', !!t);
    if(!raf) raf = requestAnimationFrame(loop);
  }, {passive:true});
  document.addEventListener('mouseleave', function(){ ret.classList.remove('on'); dot.classList.remove('on'); });
  document.addEventListener('mouseenter', function(){ if(shown){ ret.classList.add('on'); dot.classList.add('on'); } });

  document.addEventListener('mousedown', function(e){
    ret.classList.add('down'); dot.classList.add('down');
    burst(e.clientX, e.clientY);
  });
  document.addEventListener('mouseup', function(){ ret.classList.remove('down'); dot.classList.remove('down'); });

  function el(cls, px, py){
    var d = document.createElement('div'); d.className = cls;
    d.style.left = px + 'px'; d.style.top = py + 'px'; fx.appendChild(d);
    return d;
  }
  function gone(d, ms){ setTimeout(function(){ if(d.parentNode) d.parentNode.removeChild(d); }, ms); }

  function burst(px, py){
    if(reduce){ var rr = el('cc-ring', px, py); gone(rr, 400); return; }
    /* expanding square shockwave */
    var ring = el('cc-ring', px, py); gone(ring, 520);
    /* RGB-split ghost squares (the "glitch") */
    var gr = el('cc-ghost r', px, py), gc = el('cc-ghost c', px, py); gone(gr, 380); gone(gc, 380);
    /* sliced bars that tear sideways */
    for(var i = 0; i < 3; i++){
      var s = el('cc-slice', px, py + (i - 1) * 9);
      s.style.setProperty('--dx', ((Math.random() < .5 ? -1 : 1) * (14 + Math.random() * 30)) + 'px');
      s.style.width = (30 + Math.random() * 70) + 'px';
      s.style.animationDelay = (i * 25) + 'ms'; gone(s, 460);
    }
    /* pixel shards */
    for(var k = 0; k < 10; k++){
      var a = Math.random() * Math.PI * 2, dist = 28 + Math.random() * 54;
      var p = el('cc-shard' + (k % 3 === 0 ? ' w' : (k % 3 === 1 ? ' r' : ' c')), px, py);
      p.style.setProperty('--tx', Math.cos(a) * dist + 'px');
      p.style.setProperty('--ty', Math.sin(a) * dist + 'px');
      p.style.width = p.style.height = (3 + Math.floor(Math.random() * 4)) + 'px';
      gone(p, 560);
    }
    /* quick whole-screen chromatic flicker */
    root.classList.remove('cc-tear'); void root.offsetWidth; root.classList.add('cc-tear');
    setTimeout(function(){ root.classList.remove('cc-tear'); }, 230);
  }
})();

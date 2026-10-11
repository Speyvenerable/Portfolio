(function(){
  /* ---- your SoundCloud playlist ---- */
  var SOUNDCLOUD_URL = 'https://soundcloud.com/andreisimonaftene/sets/outsider-house-2026-top-100';

  var $ = function(id){ return document.getElementById(id); };
  var mb=$('mb'), fab=$('mb-fab'), minBtn=$('mb-min'), listBtn=$('mb-list'), playBtn=$('mb-play'), shufBtn=$('mb-shuf');
  var titleEl=$('mb-title'), subEl=$('mb-sub'), coverEl=$('mb-cover'), stateEl=$('mb-state'), noteEl=$('mb-note');
  var fillEl=$('mb-fill'), barEl=$('mb-bar'), posEl=$('mb-pos'), durEl=$('mb-dur');
  var inPreview = (function(){ try{ return window.top !== window.self; }catch(e){ return true; } })();
  var PREVIEW_MSG = 'This is a preview window (like Claude). Preview windows block outside players such as SoundCloud, so the music usually will not play here. It should work once the site is hosted (for example on GitHub Pages) or opened in your own browser.';
  var hasUrl = /^https?:\/\/(www\.)?soundcloud\.com\//i.test(SOUNDCLOUD_URL);
  if(hasUrl) $('mb-ext').href = SOUNDCLOUD_URL;

  var w=null, ready=false, started=false, playing=false, userPaused=false, wantPlay=false, initStarted=false, shuffle=false;
  var pos=0, dur=0, t0=0, tick=0, hintT=0, loadT=0, count=0, reach=null;

  function prettySlug(u){
    var m=u.match(/\/sets\/([^\/?#]+)/); if(!m) return 'SoundCloud';
    return m[1].replace(/-/g,' ').replace(/\b\w/g,function(c){ return c.toUpperCase(); });
  }
  function fmt(ms){ ms=Math.max(0,Math.round(ms/1000)); return Math.floor(ms/60)+':'+('0'+(ms%60)).slice(-2); }
  function note(t){ noteEl.textContent = t || ''; }
  function setCover(url){
    if(!url) return;
    url=url.replace('-large.','-t500x500.');
    var img=coverEl.querySelector('img');
    if(!img){ img=document.createElement('img'); img.alt=''; coverEl.insertBefore(img, coverEl.firstChild); }
    img.src=url;
  }
  function showPanel(on){
    mb.classList.toggle('tracklist', on); listBtn.setAttribute('aria-pressed', on?'true':'false');
  }
  function render(){
    mb.classList.toggle('playing', playing);
    stateEl.textContent = playing ? 'PLAYING' : (started ? 'PAUSED' : 'READY');
    var p = pos + (playing ? (performance.now()-t0) : 0);
    if(dur) p = Math.min(p, dur);
    var pct = dur ? (p/dur*100) : 0;
    fillEl.style.width = pct+'%';
    barEl.setAttribute('aria-valuenow', Math.round(pct));
    posEl.textContent = fmt(p); durEl.textContent = fmt(dur);
  }
  function startTick(){ if(!tick) tick=setInterval(render, 250); }
  function stopTick(){ if(tick && !playing){ clearInterval(tick); tick=0; } }

  function loadSound(){
    if(!w) return;
    w.getCurrentSound(function(snd){
      if(!snd) return;
      titleEl.textContent = snd.title || 'Unknown track';
      subEl.textContent = (snd.user && snd.user.username) ? snd.user.username : 'SoundCloud';
      dur = snd.duration || dur;
      setCover(snd.artwork_url || (snd.user && snd.user.avatar_url));
      render();
    });
  }
  function armHint(){
    clearTimeout(hintT);
    hintT=setTimeout(function(){
      if(!playing){
        showPanel(true);
        note(inPreview ? PREVIEW_MSG : 'Nothing started. Your browser may block playback from this button: press the play button on the SoundCloud player above.');
      }
    }, 2200);
  }
  function loadApi(cb){
    if(window.SC && window.SC.Widget){ cb(); return; }
    var s=document.createElement('script'); s.src='https://w.soundcloud.com/player/api.js'; s.async=true;
    s.onload=cb;
    s.onerror=function(){ initStarted=false; reach=false; report(); if(!inPreview && reach===false && noteEl.textContent.indexOf('cannot reach')<0) note('Could not reach SoundCloud. Check your connection and tap play to retry.'); };
    document.head.appendChild(s);
  }
  function probe(){
    var ctl = window.AbortController ? new AbortController() : null, done=false;
    var to = setTimeout(function(){ if(!done){ done=true; reach=false; if(ctl) ctl.abort(); report(); } }, 6000);
    try{
      fetch('https://w.soundcloud.com/player/api.js', {mode:'no-cors', signal: ctl ? ctl.signal : undefined})
        .then(function(){ if(!done){ done=true; clearTimeout(to); reach=true; } })
        .catch(function(){ if(!done){ done=true; clearTimeout(to); reach=false; report(); } });
    }catch(e){ reach=null; }
  }
  function report(){
    if(ready) return;
    if(inPreview) { note(PREVIEW_MSG); return; }
    if(reach===false) note('Your browser cannot reach SoundCloud. It may be blocked by your network, country, or an ad blocker. Try a VPN or another network, or open the playlist with the arrow button above.');
  }
  function init(){
    if(initStarted) return; initStarted=true;
    titleEl.textContent=prettySlug(SOUNDCLOUD_URL); subEl.textContent='SoundCloud';
    note('Loading SoundCloud...'); probe();
    clearTimeout(loadT);
    loadT=setTimeout(function(){ if(ready) return; if(reach===false) report(); else if(inPreview) note(PREVIEW_MSG); else note('SoundCloud is reachable but its player did not start. Turn off ad/tracker blocking for this page, or the playlist may not allow embedding. Use the arrow button above to open it on SoundCloud.'); }, 8000);
    loadApi(function(){
      var f=document.createElement('iframe');
      f.title='SoundCloud player'; f.allow='autoplay';
      f.setAttribute('scrolling','no'); f.setAttribute('frameborder','no');
      f.src='https://w.soundcloud.com/player/?url='+encodeURIComponent(SOUNDCLOUD_URL)+
            '&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=false&color=%231f6fe6';
      $('mb-embed').appendChild(f);
      w=SC.Widget(f); var E=SC.Widget.Events;
      w.bind(E.READY, function(){
        ready=true; clearTimeout(loadT); note('');
        w.getSounds(function(l){ count=(l&&l.length)||0; });
        loadSound();
        if(wantPlay){ wantPlay=false; w.play(); armHint(); }
      });
      w.bind(E.PLAY, function(){ playing=true; started=true; t0=performance.now(); clearTimeout(hintT);
        if(noteEl.textContent.indexOf('Nothing started')>-1) note(''); loadSound(); render(); });
      w.bind(E.PAUSE, function(){ pos=pos+(performance.now()-t0); t0=performance.now(); playing=false; render(); });
      w.bind(E.PLAY_PROGRESS, function(e){ pos=e.currentPosition||0; t0=performance.now(); if(!playing){ playing=true; started=true; } render(); });
      if(E.ERROR) w.bind(E.ERROR, function(){ showPanel(true); note(inPreview ? PREVIEW_MSG : 'SoundCloud reported an error for this playlist. It may be private, removed, or not allowed to be embedded.'); });
      w.bind(E.FINISH, function(){
        pos=0; if(shuffle && count>1) w.skip(Math.floor(Math.random()*count));
      });
    });
  }
  function togglePlay(){
    if(!hasUrl) return;
    if(!w || !ready){ wantPlay=true; userPaused=false; init(); armHint(); return; }
    if(playing){ userPaused=true; w.pause(); } else { userPaused=false; w.play(); armHint(); }
  }

  function openBox(){
    mb.classList.add('open'); startTick(); render();
    if(!hasUrl){
      titleEl.textContent='No playlist linked'; subEl.textContent='Add a SoundCloud playlist link';
      note('Send your SoundCloud playlist link to link it here.');
      [playBtn,$('mb-prev'),$('mb-next'),shufBtn].forEach(function(b){ b.disabled=true; }); return;
    }
    if(!initStarted){ wantPlay=true; init(); }
    else if(w && ready && !playing && !started && !userPaused){ w.play(); armHint(); }
  }
  function closeBox(){ mb.classList.remove('open'); stopTick(); fab.focus({preventScroll:true}); }

  fab.addEventListener('click', openBox);
  minBtn.addEventListener('click', closeBox);
  document.addEventListener('keydown', function(e){ if(e.key==='Escape' && mb.classList.contains('open')) closeBox(); });
  playBtn.addEventListener('click', togglePlay);
  listBtn.addEventListener('click', function(){ showPanel(!mb.classList.contains('tracklist')); });
  $('mb-prev').addEventListener('click', function(){ if(w&&ready){ userPaused=false; (pos+(playing?performance.now()-t0:0))>3000 ? w.seekTo(0) : w.prev(); if(!playing) w.play(); } });
  $('mb-next').addEventListener('click', function(){
    if(!w||!ready) return; userPaused=false;
    if(shuffle && count>1) w.skip(Math.floor(Math.random()*count)); else w.next();
    if(!playing) w.play();
  });
  shufBtn.addEventListener('click', function(){ shuffle=!shuffle; shufBtn.setAttribute('aria-pressed', shuffle?'true':'false'); });
  function seekFromEvent(e){
    if(!w||!ready||!dur) return;
    var r=barEl.getBoundingClientRect(), x=(e.clientX-r.left)/r.width;
    w.seekTo(Math.max(0,Math.min(1,x))*dur);
  }
  barEl.addEventListener('click', seekFromEvent);
  barEl.addEventListener('keydown', function(e){
    if(!w||!ready) return;
    var p=pos+(playing?performance.now()-t0:0);
    if(e.key==='ArrowRight'){ w.seekTo(Math.min(dur,p+5000)); e.preventDefault(); }
    if(e.key==='ArrowLeft'){ w.seekTo(Math.max(0,p-5000)); e.preventDefault(); }
  });
})();

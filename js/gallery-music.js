/* Gallery theme song (YouTube, played only on this page).
   Starts at 1:16 and loops back to 1:16 every time it ends. */
(function(){
  var VIDEO_ID = 'pCCmyT27sZs';
  var START = 76;                    /* 1:16 */

  var chip = document.getElementById('gm'), label = document.getElementById('gm-label'), holder = document.getElementById('gm-holder');
  if(!chip || !holder) return;
  var player = null, ready = false, playing = false, wantSound = true, gestureArmed = false, checkT = 0;

  function ui(){
    chip.classList.toggle('on', playing);
    chip.setAttribute('aria-pressed', playing ? 'true' : 'false');
    if(label) label.textContent = playing ? 'NOW PLAYING' : (ready ? 'TAP TO PLAY' : 'LOADING...');
  }
  function safe(fn){ try{ fn(); }catch(e){} }

  function tryPlay(){
    if(!player || !ready) return;
    safe(function(){ player.unMute(); player.setVolume(80); player.playVideo(); });
    clearTimeout(checkT);
    /* if the browser blocked sound, start silently and wait for the first tap */
    checkT = setTimeout(function(){
      if(!playing){ safe(function(){ player.mute(); player.playVideo(); }); wantSound = true; armGesture(); }
    }, 1800);
  }
  function onGesture(){
    removeGesture();
    if(!player || !ready) { wantSound = true; return; }
    safe(function(){ player.unMute(); player.setVolume(80); player.playVideo(); });
  }
  function armGesture(){
    if(gestureArmed) return; gestureArmed = true;
    ['pointerdown', 'keydown', 'touchend'].forEach(function(t){ document.addEventListener(t, onGesture, true); });
  }
  function removeGesture(){
    gestureArmed = false;
    ['pointerdown', 'keydown', 'touchend'].forEach(function(t){ document.removeEventListener(t, onGesture, true); });
  }
  armGesture();   /* the first click / tap / key anywhere on the page also starts it */

  function build(){
    player = new YT.Player('gm-yt', {
      width:'320', height:'180', videoId:VIDEO_ID,
      playerVars:{ autoplay:1, start:START, controls:0, disablekb:1, fs:0, rel:0, playsinline:1, modestbranding:1, iv_load_policy:3 },
      events:{
        onReady:function(){
          ready = true; ui();
          safe(function(){ var d = player.getVideoData(); if(d && d.title) chip.title = d.title; });
          tryPlay();
        },
        onStateChange:function(e){
          var S = YT.PlayerState;
          if(e.data === S.PLAYING){ playing = true; clearTimeout(checkT); safe(function(){ if(!player.isMuted()) removeGesture(); }); }
          else if(e.data === S.PAUSED || e.data === S.CUED || e.data === S.UNSTARTED) { playing = false; }
          if(e.data === S.ENDED){ safe(function(){ player.seekTo(START, true); player.playVideo(); }); }   /* loop from 1:16 */
          ui();
        },
        onError:function(){ playing = false; ready = true; if(label) label.textContent = 'UNAVAILABLE'; }
      }
    });
  }
  var s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; s.async = true;
  s.onerror = function(){ if(label) label.textContent = 'OFFLINE'; };
  window.onYouTubeIframeAPIReady = build;
  document.head.appendChild(s);

  /* the small button: pause / play */
  chip.addEventListener('click', function(e){
    e.stopPropagation();
    if(!player || !ready) return;
    if(playing){ safe(function(){ player.pauseVideo(); }); removeGesture(); }
    else { safe(function(){ player.unMute(); player.playVideo(); }); }
  });
  /* stop the music when leaving the page, so it never carries over */
  window.addEventListener('pagehide', function(){ safe(function(){ player.stopVideo(); }); });
  ui();
})();

SPEY PORTFOLIO — how to host
============================
Folder structure (keep it exactly like this):
  index.html        <- the page (must keep this name)
  css/style.css
  js/main.js        <- animations, smooth scroll, header, theme
  js/music.js       <- SoundCloud music box
  assets/           <- images + favicon

Easiest free hosting (GitHub Pages):
  1. Create a GitHub repo, upload ALL files/folders (keep the structure).
  2. Settings > Pages > Deploy from branch > main / (root).
  3. Open https://<your-username>.github.io/<repo>/

Or drag the whole folder onto Netlify Drop (app.netlify.com/drop) or Cloudflare Pages.

Edit before hosting:
  - Facebook link in index.html (currently placeholder https://www.facebook.com/)
  - Discord link (currently https://discord.com/users/speyvenerable — replace with your profile link)
  - Music playlist: SOUNDCLOUD_URL at the top of js/music.js
Fonts and music load from the internet, so test music after hosting (it won't work inside preview windows).

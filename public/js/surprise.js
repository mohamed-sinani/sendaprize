/* sendaprize, the surprise opening experience */

const REACTION_ICONS = ['heart', 'sparkles', 'smile', 'flame', 'star', 'thumbs-up', 'book-open-text'];

let state = null;

const code = location.pathname.split('/').pop();
if (!code) location.href = '/';

async function load() {
  try {
    const data = await api(`/api/surprise/${code}`);
    state = data.surprise;
    recordVisit();
    renderLock();
  } catch (e) {
    if (e.status === 404) {
      $('#loading').style.display = 'none';
      $('#notfound').style.display = 'block';
    } else {
      $('#loading').style.display = 'none';
      $('#notfound').style.display = 'block';
      $('#notfound h1').textContent = 'Something went wrong';
    }
  }
}

function recordVisit() {
  const key = `ap_viewed_${code}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, '1');
  api(`/api/surprise/${code}/visit`, { method: 'POST' }).catch(() => {});
}

function renderLock() {
  $('#loading').style.display = 'none';
  const locked = state.requiresPassword || isFuture(state.openAt);

  if (isFuture(state.openAt)) {
    $('#lock').style.display = 'none';
    $('#countdown').style.display = 'block';
    renderCountdown();
    return;
  }

  $('#lock').style.display = 'flex';
  if (state.requiresPassword) {
    $('#lockSub').textContent = 'It is sealed with a secret word. Enter it to open the surprise.';
  } else {
    $('#lockSub').textContent = `From ${state.from} · a surprise wrapped just for you.`;
  }

  $('#openBtn').addEventListener('click', () => {
    shakePage();
    if (state.requiresPassword) showPassword();
    else openBox();
  });
}

function isFuture(iso) {
  return iso && Date.parse(iso) > Date.now();
}

function renderCountdown() {
  const target = Date.parse(state.openAt);
  const tick = () => {
    const diff = Math.max(0, target - Date.now());
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    $('#cdD').textContent = d;
    $('#cdH').textContent = h;
    $('#cdM').textContent = m;
    $('#cdS').textContent = s;
    if (diff <= 0) {
      clearInterval(timer);
      countdownDone();
    }
  };
  tick();
  const timer = setInterval(tick, 1000);
}

/* the moment arrives, the box appears and opens itself */
function countdownDone() {
  $('#countdown').style.display = 'none';
  $('#lock').style.display = 'flex';
  if (state.requiresPassword) {
    $('#lockSub').textContent = 'The moment has arrived. Enter the secret word to open the surprise.';
  } else {
    $('#lockSub').textContent = 'The moment has arrived, opening for you.';
    openBox();
  }
}

function showPassword() {
  $('#pwOverlay').style.display = 'block';
  $('#pwInput').value = '';
  $('#pwInput').focus();
  $('#pwSubmit').onclick = () => openBox($('#pwInput').value);
  $('#pwCancel').onclick = () => ($('#pwOverlay').style.display = 'none');
  $('#pwInput').onkeydown = (e) => e.key === 'Enter' && openBox($('#pwInput').value);
}

async function openBox(password) {
  if (state.requiresPassword) {
    try {
      const data = await api(`/api/surprise/${code}/open`, { method: 'POST', body: { password } });
      $('#pwOverlay').style.display = 'none';
      animateOpen();
    } catch (e) {
      if (e.status === 403) {
        toast('Incorrect secret word, the surprise stays sealed');
      } else if (e.status === 423) {
        toast('Not yet, the moment has not arrived');
      } else {
        toast(e.message);
      }
    }
    return;
  }

  /* fire the open request in parallel so the box starts moving right away */
  $('#pwOverlay').style.display = 'none';
  animateOpen();
  api(`/api/surprise/${code}/open`, { method: 'POST', body: { password } }).catch((e) => {
    if (e.status === 423) toast('Not yet, the moment has not arrived');
    else if (e.status) toast(e.message);
  });
}

function animateOpen() {
  const box = $('#giftBox');
  box.classList.remove('float', 'pulse');
  box.classList.add('shaking');
  playShake();

  setTimeout(() => {
    box.classList.remove('shaking');
    box.classList.add('vibrating');
    document.body.classList.add('page-shake');
  }, 700);

  setTimeout(() => {
    box.classList.remove('vibrating');
    document.body.classList.remove('page-shake');
    box.classList.add('opening');
    playExplosion();
    burstConfetti($('#giftBox .cube'), 320);
    setTimeout(() => burstConfetti($('#giftBox .cube'), 220), 200);
  }, 1200);

  setTimeout(() => {
    $('#lock').style.display = 'none';
    showReveal();
    playChime();
  }, 2150);
}

function showReveal() {
  const screen = $('#reveal');
  screen.style.background = [
    'radial-gradient(120% 90% at 50% 0%, rgba(255, 45, 120, 0.22), transparent 60%)',
    'radial-gradient(100% 80% at 80% 100%, rgba(255, 95, 143, 0.14), transparent 60%)',
    '#0a0a0d',
  ].join(', ');

  $('#rType').innerHTML = `<i data-lucide="${OCCASIONS.iconName(OCCASIONS.byKey[state.type])}"></i>`;
  refreshIcons();
  $('#rTitle').textContent = state.title;
  $('#rMessage').textContent = state.message;
  $('#rSign').textContent = `Sent to you By ${state.from}`;

  renderMedia();
  renderReactions();
  renderShare();
  renderCounts();

  screen.classList.add('show');
  document.body.style.overflow = 'hidden';
  screen.scrollTop = 0;

  refreshIcons();
  revealFlourish();
}

function revealFlourish() {
  startPetals({
    colors: ['#ff5f8f', '#ff2d78', '#ff9ec2', '#ffd3e4', '#ffffff'],
    count: 22,
    duration: 12000,
  });
}

function renderMedia() {
  const wrap = $('#rMedia');
  const media = state.media || { images: [], audio: [] };
  let html = '';

  for (const img of media.images) {
    html += `<img src="/${img}" alt="memory" />`;
  }
  if (media.audio && media.audio.length) {
    html += media.audio.map((a, i) => voiceCard(a, i)).join('');
  }
  wrap.innerHTML = html;
  wrap.querySelectorAll('.play').forEach((b) =>
    b.addEventListener('click', () => {
      const player = b.closest('.audio-card').querySelector('audio');
      if (player.paused) { player.play(); b.innerHTML = '<i data-lucide="pause"></i>'; }
      else { player.pause(); b.innerHTML = '<i data-lucide="play"></i>'; }
      player.onended = () => { b.innerHTML = '<i data-lucide="play"></i>'; refreshIcons(); };
      refreshIcons();
    })
  );
  refreshIcons();
}

function voiceCard(src, i) {
  return `
  <div class="audio-card">
    <button class="play"><i data-lucide="play"></i></button>
    <div style="flex:1">
      <b class="small" style="color:var(--ink)">Voice note ${i + 1}</b>
      <audio src="${src}" preload="none" style="display:none"></audio>
      <div class="muted" style="font-size:.78rem">a voice note for you, on sendaprize</div>
    </div>
  </div>`;
}

function renderReactions() {
  const wrap = $('#rReactions');
  const reactions = state.reactions || {};
  wrap.innerHTML = REACTION_ICONS.map(
    (icon, i) => `
    <button class="reaction-btn" data-icon="${icon}">
      <span class="r-ico"><i data-lucide="${icon}"></i></span>
      <span class="r-count">${reactions[icon] || 0}</span>
    </button>`
  ).join('');
  refreshIcons();

  wrap.querySelectorAll('.reaction-btn').forEach((b) => {
    b.addEventListener('click', async () => {
      const icon = b.dataset.icon;
      b.style.transform = 'scale(0.8)';
      setTimeout(() => (b.style.transform = ''), 150);
      const countEl = b.querySelector('.r-count');
      const cur = parseInt(countEl.textContent, 10) || 0;
      countEl.textContent = cur + 1;
      if (Math.random() > 0.5) burstConfetti(b, 30);
      try { await api(`/api/surprise/${code}/react`, { method: 'POST', body: { type: icon } }); }
      catch { /* keep local optimism */ }
    });
  });
}

function renderShare() {
  const link = location.href;
  $$('.share-btn').forEach((b) => {
    b.addEventListener('click', async () => {
      const ch = b.dataset.ch;
      api(`/api/surprise/${code}/share`, { method: 'POST', body: { channel: ch } }).catch(() => {});
      const text = `I sent you a surprise on sendaprize: ${link}`;
      if (ch === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      else if (ch === 'x') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
      else if (ch === 'telegram') window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent('I sent you a surprise on sendaprize')}`, '_blank');
      else copyText(link, 'Link copied!');
    });
  });
}

function renderCounts() {
  $('#ctViews').textContent = state.views || 0;
  $('#ctOpens').textContent = state.opens || 0;
  $('#ctShares').textContent = state.shares || 0;
}

load();
refreshIcons();

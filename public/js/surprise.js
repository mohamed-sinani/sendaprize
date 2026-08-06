/* sendaprize — the surprise opening experience */

const REACTION_EMOJIS = ['❤️', '💖', '😍', '🎉', '😂', '🥺', '👏'];
const TYPES_EMOJI = {
  love: '❤️', birthday: '🎂', graduation: '🎓', congrats: '🎉',
  anonymous: '🤫', proposal: '💍', baby: '👶', thankyou: '🙏', openwhen: '📝',
};

let state = null;
let audioEl = null;

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

  $('#lock').style.display = 'block';
  if (state.requiresPassword) {
    $('#lockSub').textContent = 'It is sealed with a secret. Enter the password to open it.';
  } else {
    $('#lockSub').textContent = `From ${state.from} · with ${TYPES_EMOJI[state.type] || '💖'} all wrapped up for you.`;
  }

  $('#openBtn').addEventListener('click', () => {
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
      location.reload();
    }
  };
  tick();
  const timer = setInterval(tick, 1000);
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
  try {
    const data = await api(`/api/surprise/${code}/open`, { method: 'POST', body: { password } });
    $('#pwOverlay').style.display = 'none';
    animateOpen();
  } catch (e) {
    if (e.status === 403) {
      toast('Incorrect password — the box stays sealed 🔒');
    } else if (e.status === 423) {
      toast('Not yet — the countdown is still ticking ⏳');
    } else {
      toast(e.message);
    }
  }
}

function animateOpen() {
  const box = $('#giftBox');
  box.classList.remove('float', 'pulse');
  box.classList.add('opening');

  setTimeout(() => {
    $('#lock').style.display = 'none';
    showReveal();
  }, 950);
}

function showReveal() {
  const screen = $('#reveal');
  const t = THEME_STOPS[state.theme] || THEME_STOPS.rose;

  screen.style.background = [
    `radial-gradient(120% 90% at 50% 0%, ${t.a}, transparent 60%)`,
    `radial-gradient(100% 80% at 80% 100%, ${t.b}, transparent 60%)`,
    '#0a0a0d',
  ].join(', ');

  $('#rType').textContent = TYPES_EMOJI[state.type] || '💖';
  $('#rTitle').textContent = state.title;
  $('#rFrom').textContent = `for you, from ${state.from}`;
  $('#rMessage').textContent = state.message;
  $('#rSign').textContent = `— ${state.from}`;

  renderMedia();
  renderReactions();
  renderShare();
  renderCounts();
  playMusic();

  screen.classList.add('show');
  document.body.style.overflow = 'hidden';
  screen.scrollTop = 0;

  runAnimation(state.animation);
}

const THEME_STOPS = {
  rose: { a: 'rgba(255,45,120,0.32)', b: 'rgba(255,95,143,0.18)' },
  blush: { a: 'rgba(255,122,168,0.3)', b: 'rgba(255,179,200,0.16)' },
  plum: { a: 'rgba(184,15,95,0.4)', b: 'rgba(225,33,104,0.18)' },
  coral: { a: 'rgba(255,90,95,0.3)', b: 'rgba(255,138,101,0.18)' },
  gold: { a: 'rgba(255,45,120,0.3)', b: 'rgba(255,217,160,0.14)' },
  berry: { a: 'rgba(157,23,77,0.42)', b: 'rgba(255,45,120,0.2)' },
  candy: { a: 'rgba(255,45,120,0.3)', b: 'rgba(255,211,228,0.18)' },
  midnight: { a: 'rgba(255,45,120,0.28)', b: 'rgba(58,12,163,0.3)' },
};

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
  if (state.video) {
    html += `<video src="${state.video}" controls playsinline></video>`;
  }
  wrap.innerHTML = html;
  wrap.querySelectorAll('.play').forEach((b) =>
    b.addEventListener('click', () => {
      const src = b.dataset.src;
      const player = b.closest('.audio-card').querySelector('audio');
      if (player.paused) { player.play(); b.textContent = '⏸'; }
      else { player.pause(); b.textContent = '▶'; }
      player.onended = () => (b.textContent = '▶');
    })
  );
}

function voiceCard(src, i) {
  return `
  <div class="audio-card">
    <button class="play" data-src="${src}">▶</button>
    <div style="flex:1">
      <b class="small" style="color:var(--ink)">Voice note ${i + 1}</b>
      <audio src="${src}" preload="none" style="display:none"></audio>
      <div class="muted" style="font-size:.78rem">recorded with 💖 on sendaprize</div>
    </div>
  </div>`;
}

function renderReactions() {
  const wrap = $('#rReactions');
  const reactions = state.reactions || {};
  wrap.innerHTML = REACTION_EMOJIS.map(
    (emo, i) => `
    <button class="reaction-btn" data-i="${i}" data-emo="${emo}">
      <span class="r-emoji">${emo}</span>
      <span class="r-count">${reactions[emo] || 0}</span>
    </button>`
  ).join('');

  wrap.querySelectorAll('.reaction-btn').forEach((b) => {
    b.addEventListener('click', async () => {
      const emo = b.dataset.emo;
      b.style.transform = 'scale(0.8)';
      setTimeout(() => (b.style.transform = ''), 150);
      const countEl = b.querySelector('.r-count');
      const cur = parseInt(countEl.textContent, 10) || 0;
      countEl.textContent = cur + 1;
      if (Math.random() > 0.5) burstConfetti(b, 30);
      try { await api(`/api/surprise/${code}/react`, { method: 'POST', body: { type: emo } }); }
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
      const text = `I sent you a surprise on sendaprize 💖 ${link}`;
      if (ch === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      else if (ch === 'x') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
      else if (ch === 'telegram') window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent('I sent you a surprise 💖')}`, '_blank');
      else copyText(link, 'Link copied!');
    });
  });
}

function renderCounts() {
  $('#ctViews').textContent = state.views || 0;
  $('#ctOpens').textContent = state.opens || 0;
  $('#ctShares').textContent = state.shares || 0;
}

function playMusic() {
  if (!state.music) return;
  try {
    audioEl = new Audio(state.music);
    audioEl.loop = true;
    audioEl.volume = 0.5;
    audioEl.play().catch(() => {});
  } catch { /* fine */ }
}

function runAnimation(anim) {
  if (anim === 'confetti') burstConfetti(null, 240);
  else if (anim === 'hearts') startHeartRain(18);
  else if (anim === 'sparkles') { /* sparkles already on box + twinkle */ }
}

load();

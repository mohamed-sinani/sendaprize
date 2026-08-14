/* sendaprize, shared frontend helpers */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* no body */ }
  if (!res.ok) {
    const msg = (data && data.error) || 'Something went wrong. Please try again.';
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return data;
}

let toastTimer = null;
function toast(msg, ms = 3200) {
  let el = $('#toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

function copyText(text, msg = 'Copied to clipboard') {
  navigator.clipboard.writeText(text).then(() => toast(msg)).catch(() => toast('Could not copy'));
}

function refreshIcons() {
  if (window.lucide) {
    try { window.lucide.createIcons(); } catch (e) { /* keep going even if one icon is unknown */ }
  }
}

/* lightweight confetti burst on a canvas */
function burstConfetti(originEl, count = 160) {
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99;';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const colors = ['#ff2d78', '#ff5f8f', '#ff9ec2', '#ffd3e4', '#ffffff', '#ffd9a0'];
  const parts = [];

  // the origin must be the on-screen (projected) center of the element.
  // using offsetWidth/2 is wrong here: with a 3D perspective on the gift
  // stage, the projected rect width differs from the layout width, which
  // shoves the burst sideways on small screens.
  const originRect = originEl ? originEl.getBoundingClientRect() : null;
  const ox = originRect ? originRect.left + originRect.width / 2 : innerWidth / 2;
  const oy = originRect ? originRect.top + originRect.height / 2 : innerHeight / 2;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 6 + Math.random() * 12;
    parts.push({
      x: ox, y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      g: 0.28 + Math.random() * 0.18,
      w: 5 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: colors[(Math.random() * colors.length) | 0],
      life: 1,
    });
  }

  let raf;
  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;
    for (const p of parts) {
      if (p.life <= 0) continue;
      alive++;
      p.vy += p.g;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.985;
      p.rot += p.vr;
      p.life -= 0.006;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (alive > 0) raf = requestAnimationFrame(tick);
    else canvas.remove();
  };
  raf = requestAnimationFrame(tick);
}

/* slow falling hearts overlay (lucide heart icons) */
function startHeartRain(count = 16) {
  const wrap = document.createElement('div');
  wrap.className = 'hearts';
  document.body.appendChild(wrap);
  const colors = ['#ff2d78', '#ff5f8f', '#ff9ec2', '#ffd3e4', '#ffffff'];
  for (let i = 0; i < count; i++) {
    const holder = document.createElement('span');
    holder.className = 'rain-h';
    holder.style.left = `${Math.random() * 100}%`;
    holder.style.animationDuration = `${9 + Math.random() * 10}s`;
    holder.style.animationDelay = `${Math.random() * 12}s`;
    holder.style.color = colors[i % colors.length];
    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', 'heart');
    holder.appendChild(icon);
    wrap.appendChild(holder);
  }
  refreshIcons();
}

/* full-page shake, the moment before the box bursts open */
function shakePage(ms = 800) {
  const body = document.body;
  body.classList.remove('page-shake');
  void body.offsetWidth; /* restart the animation */
  body.classList.add('page-shake');
  setTimeout(() => body.classList.remove('page-shake'), ms);
}

/* flower-petal shower across the whole page */
function startPetals({ colors, count = 26, duration = 11000 } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'petals';
  document.body.appendChild(wrap);
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.className = 'petal';
    const size = 11 + Math.random() * 13;
    p.style.setProperty('--x', `${(Math.random() * 100).toFixed(1)}%`);
    p.style.setProperty('--size', `${size.toFixed(1)}px`);
    p.style.setProperty('--sway', `${(Math.random() * 70 - 35).toFixed(0)}px`);
    p.style.setProperty('--dur', `${(5 + Math.random() * 6).toFixed(1)}s`);
    p.style.setProperty('--delay', `${(Math.random() * 6).toFixed(1)}s`);
    p.style.setProperty('--pc', colors[i % colors.length]);
    wrap.appendChild(p);
  }
  setTimeout(() => wrap.classList.add('done'), duration);
  setTimeout(() => wrap.remove(), duration + 1400);
}

function revealOnScroll() {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('in')),
    { threshold: 0.12 }
  );
  $$('.reveal').forEach((el) => io.observe(el));
}

function formatNumber(n) {
  if (n == null) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}

function timeAgo(iso) {
  if (!iso) return '';
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

/* hamburger menu, tablet + mobile */
function initNav() {
  const nav = document.querySelector('.nav');
  const burger = nav && document.querySelector('.nav__burger');
  if (!nav || !burger) return;

  const setOpen = (open) => {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  };

  burger.addEventListener('click', () => setOpen(!nav.classList.contains('open')));

  nav.querySelectorAll('.nav__links a').forEach((a) =>
    a.addEventListener('click', () => setOpen(false))
  );

  document.addEventListener('click', (e) => {
    if (nav.classList.contains('open') && !nav.contains(e.target)) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) setOpen(false);
  });
}

/* --- synthesized sound effects (WebAudio, no asset files) --- */

let sfxCtx = null;

function ensureSfx() {
  try {
    if (!sfxCtx) sfxCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (sfxCtx.state === 'suspended') sfxCtx.resume();
  } catch { /* audio unsupported, stay silent */ }
  return sfxCtx;
}

/* unlock audio on the first user gesture (iOS/mobile autoplay policy) */
['pointerdown', 'keydown', 'touchstart'].forEach((ev) =>
  document.addEventListener(ev, ensureSfx, { once: false })
);

function sfxNoise(ctx, dur) {
  const buf = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

/* soft rattle while the box shakes */
function playShake() {
  const ctx = ensureSfx(); if (!ctx) return;
  const t = ctx.currentTime;
  for (let i = 0; i < 4; i++) {
    const src = ctx.createBufferSource();
    src.buffer = sfxNoise(ctx, 0.12);
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 420 + i * 110;
    f.Q.value = 2.2;
    const g = ctx.createGain();
    const st = t + i * 0.17;
    g.gain.setValueAtTime(0.0001, st);
    g.gain.linearRampToValueAtTime(0.1, st + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, st + 0.12);
    src.connect(f); f.connect(g); g.connect(ctx.destination);
    src.start(st); src.stop(st + 0.13);
  }
}

/* pop + sparkle when the box bursts open */
function playExplosion() {
  const ctx = ensureSfx(); if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(220, t);
  osc.frequency.exponentialRampToValueAtTime(55, t + 0.35);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.75, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
  osc.connect(g); g.connect(ctx.destination);
  osc.start(t); osc.stop(t + 0.45);

  const src = ctx.createBufferSource();
  src.buffer = sfxNoise(ctx, 0.5);
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 2200;
  bp.Q.value = 0.8;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.45, t);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
  src.connect(bp); bp.connect(ng); ng.connect(ctx.destination);
  src.start(t); src.stop(t + 0.55);

  [880, 1108.7, 1318.5, 1760].forEach((f, i) => {
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = f;
    const og = ctx.createGain();
    const st = t + 0.08 + i * 0.06;
    og.gain.setValueAtTime(0.0001, st);
    og.gain.exponentialRampToValueAtTime(0.2, st + 0.02);
    og.gain.exponentialRampToValueAtTime(0.0001, st + 0.45);
    o.connect(og); og.connect(ctx.destination);
    o.start(st); o.stop(st + 0.5);
  });
}

/* gentle rising chime when the message is revealed */
function playChime() {
  const ctx = ensureSfx(); if (!ctx) return;
  const t = ctx.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = f;
    const g = ctx.createGain();
    const st = t + i * 0.13;
    g.gain.setValueAtTime(0.0001, st);
    g.gain.exponentialRampToValueAtTime(0.16, st + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, st + 0.9);
    o.connect(g); g.connect(ctx.destination);
    o.start(st); o.stop(st + 1);
  });
}

document.addEventListener('DOMContentLoaded', initNav);

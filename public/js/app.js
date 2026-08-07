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
  if (window.lucide) window.lucide.createIcons();
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
  const colors = ['#10b981', '#34d399', '#6ee7b7', '#f5c76a', '#ffd9a0', '#d1fae5'];
  const parts = [];

  const ox = originEl ? originEl.getBoundingClientRect().left + originEl.offsetWidth / 2 : innerWidth / 2;
  const oy = originEl ? originEl.getBoundingClientRect().top + originEl.offsetHeight / 2 : innerHeight / 2;

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
  const colors = ['#10b981', '#34d399', '#6ee7b7', '#f5c76a', '#ffd9a0'];
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

document.addEventListener('DOMContentLoaded', initNav);

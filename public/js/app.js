/* sendaprize — shared frontend helpers */

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

/* slow falling hearts overlay */
function startHeartRain(count = 16) {
  const wrap = document.createElement('div');
  wrap.className = 'hearts';
  document.body.appendChild(wrap);
  const emojis = ['💗', '💖', '💕', '💞', '🌸', '✨'];
  for (let i = 0; i < count; i++) {
    const h = document.createElement('i');
    h.textContent = emojis[i % emojis.length];
    h.style.left = `${Math.random() * 100}%`;
    h.style.fontSize = `${12 + Math.random() * 16}px`;
    h.style.animationDuration = `${9 + Math.random() * 10}s`;
    h.style.animationDelay = `${Math.random() * 12}s`;
    wrap.appendChild(h);
  }
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

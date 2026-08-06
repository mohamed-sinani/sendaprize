/* sendaprize, story dashboard */

const THEME_LABEL = {
  rose: 'Rose', blush: 'Blush', plum: 'Plum', coral: 'Coral',
  gold: 'Gold', berry: 'Berry', candy: 'Candy', midnight: 'Midnight',
};

const EVENT_LABEL = {
  USER_CREATED: ['user', 'created a user account'],
  LOGIN: ['log-in', 'signed in'],
  SURPRISE_CREATED: ['gift', 'created a surprise'],
  SURPRISE_VIEWED: ['eye', 'viewed a surprise'],
  SURPRISE_OPENED: ['package-open', 'opened a surprise'],
  SURPRISE_SHARED: ['share-2', 'shared a surprise'],
  SURPRISE_REACTED: ['heart', 'reacted to a surprise'],
  MESSAGE_UPDATED: ['pen-line', 'updated a message'],
  IMAGE_ADDED: ['image', 'added an image'],
  VOICE_ADDED: ['mic', 'added a voice note'],
  PASSWORD_CREATED: ['lock', 'added a password'],
  QR_GENERATED: ['qr-code', 'generated a QR code'],
  THEME_CHANGED: ['palette', 'changed a theme'],
  HEARTBEAT: ['heart-pulse', 'heartbeat report'],
};

async function load() {
  const d = await api('/api/admin/stats');
  renderMode(d);
  renderStats(d);
  renderThemes(d.themes);
  renderEvents(d.events);
  renderCommits(d.recentCommits);
  renderHeartbeat(d.heartbeat);
}

function renderMode(d) {
  const pill = $('#modePill');
  if (d.githubEnabled) {
    pill.classList.add('live');
    pill.classList.remove('preview');
    pill.querySelector('span').textContent = `GitHub live · ${d.github} · ${d.mode}`;
  } else {
    pill.classList.remove('live');
    pill.classList.add('preview');
    pill.querySelector('span').textContent = 'Local preview · GitHub not connected';
  }
}

function renderStats(d) {
  const o = d.overview || {};
  const set = (id, v) => ($(id).textContent = v == null ? '0' : formatNumber(v));
  set('#stUsers', d.users);
  set('#stSurprises', d.surprises);
  set('#stViews', o.views);
  set('#stOpens', o.opens);
  set('#stReactions', o.reactions);
  set('#stShares', o.shares);
  set('#stImages', o.images);
  set('#stCommits', d.commits);
}

function renderThemes(themes) {
  const wrap = $('#themesChart');
  const entries = Object.entries(themes).sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (!entries.length) {
    wrap.innerHTML = '<p class="muted small">No themes used yet.</p>';
    return;
  }
  const max = Math.max(...entries.map((e) => e[1]));
  wrap.innerHTML = entries
    .map(
      ([k, v]) => `
      <div class="bar-row">
        <span>${THEME_LABEL[k] || k}</span>
        <div class="bar"><i style="width:0%" data-w="${(v / max) * 100}%"></i></div>
        <b>${v}</b>
      </div>`
    )
    .join('');
  requestAnimationFrame(() =>
    setTimeout(() => wrap.querySelectorAll('.bar i').forEach((b) => (b.style.width = b.dataset.w)), 80)
  );
}

function renderEvents(events) {
  const wrap = $('#eventFeed');
  if (!events.length) {
    wrap.innerHTML = '<p class="muted small">No events recorded yet, they appear live as people interact.</p>';
    return;
  }
  wrap.innerHTML = events
    .map((e) => {
      const meta = EVENT_LABEL[e.type] || ['radio', e.type.toLowerCase().replace(/_/g, ' ')];
      const isSystem = e.type === 'HEARTBEAT' || e.user === 'system';
      return `
      <div class="event-item ${isSystem ? 'system' : ''}">
        <span class="e-ico"><i data-lucide="${meta[0]}"></i></span>
        <div class="e-msg">
          <b>${e.user === 'system' ? 'system' : e.user}</b> ${meta[1]}
          ${e.target ? `<span class="muted">${e.target}</span>` : ''}
        </div>
        <span class="e-time">${timeAgo(e.time)}</span>
      </div>`;
    })
    .join('');
  refreshIcons();
}

function renderCommits(commits) {
  const wrap = $('#commitFeed');
  if (!commits.length) {
    wrap.innerHTML = '<p class="muted small">No commits yet.</p>';
    return;
  }
  wrap.innerHTML = commits
    .map(
      (c) => `
      <div class="commit-item">
        <span class="dot"></span>
        <div style="flex:1">
          <div class="c-msg">${c.message}</div>
          <div class="c-sha">${c.sha.slice(0, 7)} · ${timeAgo(c.date)}</div>
        </div>
      </div>`
    )
    .join('');
}

function renderHeartbeat(day) {
  if (!day) return;
  $('#heartbeatPreview').textContent = `Daily Activity Report - ${day}

   The heartbeat system writes a summary like this to the repo
   every day, so the GitHub graph tells the platform's story.`;
}

$('#heartbeatBtn').addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Writing commit…';
  try {
    const r = await api('/api/heartbeat', { method: 'POST' });
    $('#heartbeatPreview').textContent = r.report;
    toast('Heartbeat committed to the story');
    load();
  } catch (err) {
    toast(err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="heart-pulse"></i> Write heartbeat now';
    refreshIcons();
  }
});

load();
refreshIcons();

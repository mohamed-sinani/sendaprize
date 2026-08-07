// ------------------------------------------------------------------
// SendAPrize server
// Serves the static frontend and exposes the API that turns every
// user interaction into a GitHub commit.
// ------------------------------------------------------------------

const path = require('path');
const express = require('express');
const config = require('./config');
const { getStore, updateJson, readJson, appendEvent, pruneCache } = require('./lib/store');
const { CommitEngine } = require('./lib/engine');
const { makeEvent } = require('./lib/events');
const { randomCode, nextUserId, sha256 } = require('./lib/ids');

const app = express();
app.use(express.json({ limit: '12mb' }));

// clean URLs — redirect /create.html -> /create (and /index.html -> /)
app.use((req, res, next) => {
  if (!req.path.endsWith('.html') || req.path === '/index.html') {
    if (req.path === '/index.html') return res.redirect(301, '/');
    return next();
  }
  res.redirect(301, req.path.replace(/\.html$/, ''));
});

app.use(express.static(config.publicDir));

// clean page routes
app.get(['/create', '/surprise', '/admin'], (req, res) => {
  res.sendFile(path.join(config.publicDir, `${req.path.slice(1)}.html`));
});

const store = getStore();
const engine = new CommitEngine();

const SURPRISE_DIR = (code) =>
  `database/surprises/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}`;

const OCCASIONS = require('./public/js/occasions.js');
const typeLabel = (t) => (OCCASIONS.byKey[t] && OCCASIONS.byKey[t].name) || t;

function now() {
  return new Date().toISOString();
}

function api(fn) {
  return (req, res) => {
    Promise.resolve()
      .then(() => fn(req, res))
      .catch((e) => {
        console.error('[api error]', e.message);
        res.status(e.status || 500).json({ error: e.message });
      });
  };
}

// ------------------------------------------------------------------
// Status / health
// ------------------------------------------------------------------
app.get('/api/status', api(async (_req, res) => {
  res.json({
    app: 'sendaprize',
    mode: config.mode,
    commitMode: config.commitMode,
    githubEnabled: engine.githubEnabled,
    baseUrl: config.baseUrl,
    github: engine.githubEnabled
      ? { owner: config.owner, repo: config.repo }
      : null,
    online: true,
  });
}));

// ------------------------------------------------------------------
// Users
// ------------------------------------------------------------------
app.post('/api/user', api(async (req, res) => {
  const { id, name } = req.body || {};
  let userId = id;
  const existing = userId ? await store.readFile(`database/users/${userId}.json`) : null;

  if (existing) {
    const user = JSON.parse(existing);
    if (name && name !== user.name) {
      const staged = [];
      await updateJson(staged, store, `database/users/${userId}.json`, {}, (u) => {
        u.name = name;
        u.updated_at = now();
      });
      await engine.record({
        message: `Update user profile ${userId}`,
        files: staged,
        event: makeEvent('LOGIN', userId),
      });
    }
    return res.json({ id: userId, created: false, user: JSON.parse(existing) });
  }

  userId = userId || (await nextUserId(store));
  const user = {
    id: userId,
    name: name || 'Anonymous',
    created_at: now(),
    updated_at: now(),
    surprises: [],
  };
  const staged = [{ path: `database/users/${userId}.json`, content: JSON.stringify(user, null, 2) }];
  const stats = await updateJson(staged, store, 'database/analytics/overview.json', {}, (a) => {
    a.users = (a.users || 0) + 1;
  });
  void stats;

  await engine.record({
    message: `Create new user account ${userId}`,
    files: staged,
    event: makeEvent('USER_CREATED', userId),
  });
  res.json({ id: userId, created: true, user });
}));

// ------------------------------------------------------------------
// Media upload (images / voice notes) -> stored in /media
// ------------------------------------------------------------------
app.post('/api/media', api(async (req, res) => {
  const { code, kind, data, ext } = req.body || {};
  if (!code || !kind || !data) return res.status(400).json({ error: 'code, kind and data required' });
  if (kind !== 'image' && kind !== 'audio') return res.status(400).json({ error: 'kind must be image or audio' });
  if (Buffer.byteLength(data, 'base64') > 6 * 1024 * 1024) {
    return res.status(400).json({ error: 'file too large (max 6MB)' });
  }

  const surprisePath = `${SURPRISE_DIR(code)}/${code}.json`;
  const surprise = await readJson(store, surprisePath, null);
  if (!surprise) return res.status(404).json({ error: 'surprise not found' });

  const folder = kind === 'image' ? 'images' : 'audio';
  const index = (surprise.media?.[folder] || []).length;
  const safeExt = (ext || (kind === 'image' ? 'png' : 'webm')).replace(/[^a-zA-Z0-9]/g, '').slice(0, 5) || 'png';
  const filePath = `media/${folder}/${code}/${index}.${safeExt}`;
  const appPath = `/media/${folder}/${code}/${index}.${safeExt}`;

  const staged = [];
  staged.push({ path: filePath, binary: true, content: data });

  await updateJson(staged, store, surprisePath, null, (s) => {
    s.media = s.media || { images: [], audio: [] };
    s.media[folder].push(filePath);
    s.updated_at = now();
  });

  await engine.touchAnalytics(staged, kind === 'image' ? { images: 1 } : { voices: 1 });
  await engine.record({
    message: kind === 'image' ? `Add image to surprise ${code}` : `Add voice note to surprise ${code}`,
    files: staged,
    event: makeEvent(kind === 'image' ? 'IMAGE_ADDED' : 'VOICE_ADDED', surprise.creatorId, code),
  });

  res.json({ path: filePath, url: appPath });
}));

// Serve media files (works for private repos too — proxied with the token)
app.get('/media/*', api(async (req, res) => {
  const filePath = 'media/' + (req.params[0] || '');
  if (!/^[a-zA-Z0-9/_.-]+$/.test(filePath)) return res.status(400).end('bad path');
  const buf = await store.readBuffer(filePath);
  if (!buf) return res.status(404).end('not found');
  const ext = path.extname(filePath).toLowerCase();
  const mime = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.webm': 'audio/webm',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
  };
  res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(buf);
}));

// ------------------------------------------------------------------
// Surprises
// ------------------------------------------------------------------
app.post('/api/surprise', api(async (req, res) => {
  const b = req.body || {};
  const code = randomCode(6);
  const nowIso = now();

  const surprise = {
    id: code,
    code,
    type: b.type || 'spouse',
    title: (b.title || 'A surprise for you').slice(0, 120),
    message: (b.message || '').slice(0, 5000),
    from: (b.from || 'someone who loves you').slice(0, 60),
    theme: 'emerald',
    media: { images: [], audio: [] },
    passwordHash: b.password ? sha256(String(b.password)) : null,
    openAt: b.openAt || null,
    creatorId: b.creatorId || 'anonymous',
    status: 'published',
    created_at: nowIso,
    updated_at: null,
  };

  const dir = SURPRISE_DIR(code);
  const surprisePath = `${dir}/${code}.json`;

  const staged = [];
  staged.push({ path: surprisePath, content: JSON.stringify(surprise, null, 2) });

  // link the surprise to its creator
  if (surprise.creatorId !== 'anonymous') {
    await updateJson(staged, store, `database/users/${surprise.creatorId}.json`, {}, (u) => {
      u.surprises = u.surprises || [];
      if (!u.surprises.includes(code)) u.surprises.push(code);
    });
  }

  // analytics
  await updateJson(staged, store, 'database/analytics/occasions.json', { byType: {} }, (o) => {
    o.byType[surprise.type] = (o.byType[surprise.type] || 0) + 1;
  });
  await engine.touchAnalytics(staged, { surprises: 1 });
  if (surprise.passwordHash) {
    await updateJson(staged, store, 'database/analytics/protected.json', { total: 0 }, (p) => {
      p.total += 1;
    });
  }

  const label = typeLabel(surprise.type);
  await engine.record({
    message: `Create ${label} surprise ${code}`,
    files: staged,
    event: makeEvent('SURPRISE_CREATED', surprise.creatorId, code, { type: surprise.type }),
  });

  res.json({ code, url: `/s/${code}`, surprise: stripPrivate(surprise) });
}));

// public read (no view count)
app.get('/api/surprise/:code', api(async (req, res) => {
  const { code } = req.params;
  const surprise = await readJson(store, `${SURPRISE_DIR(code)}/${code}.json`, null);
  if (!surprise) return res.status(404).json({ error: 'This surprise does not exist (or was never opened).' });
  res.json({ surprise: stripPrivate(surprise) });
}));

// record a view (once per visitor session)
app.post('/api/surprise/:code/visit', api(async (req, res) => {
  const { code } = req.params;
  const surprisePath = `${SURPRISE_DIR(code)}/${code}.json`;
  const surprise = await readJson(store, surprisePath, null);
  if (!surprise) return res.status(404).json({ error: 'surprise not found' });

  const staged = [];
  let newViews = 0;
  await updateJson(staged, store, surprisePath, null, (s) => {
    s.opens = s.opens || 0;
    s.views = (s.views || 0) + 1;
    newViews = s.views;
  });
  await updateJson(staged, store, 'database/analytics/views.json', { total: 0, recent: [] }, (v) => {
    v.total += 1;
    v.recent = [{
      surprise_id: code,
      viewer: 'anonymous',
      timestamp: now(),
    }, ...v.recent].slice(0, 500);
  });
  await engine.touchAnalytics(staged, { views: 1 });
  await engine.record({
    message: `Record surprise view ${code}`,
    files: staged,
    event: makeEvent('SURPRISE_VIEWED', 'anonymous', code),
  });
  res.json({ ok: true, views: newViews });
}));

// open the surprise (checks password + countdown, records open)
app.post('/api/surprise/:code/open', api(async (req, res) => {
  const { code } = req.params;
  const surprisePath = `${SURPRISE_DIR(code)}/${code}.json`;
  const surprise = await readJson(store, surprisePath, null);
  if (!surprise) return res.status(404).json({ error: 'surprise not found' });

  if (surprise.passwordHash) {
    const pwd = String((req.body && req.body.password) || '');
    if (sha256(pwd) !== surprise.passwordHash) {
      return res.status(403).json({ error: 'Incorrect password. The box stays sealed…' });
    }
  }
  if (surprise.openAt && Date.parse(surprise.openAt) > Date.now()) {
    return res.status(423).json({ error: 'not_yet', openAt: surprise.openAt });
  }

  const staged = [];
  await updateJson(staged, store, surprisePath, null, (s) => {
    s.opens = (s.opens || 0) + 1;
  });
  await engine.touchAnalytics(staged, { opens: 1 });
  await engine.record({
    message: `Open surprise ${code}`,
    files: staged,
    event: makeEvent('SURPRISE_OPENED', 'anonymous', code),
  });
  res.json({ ok: true, surprise: stripPrivate(surprise) });
}));

// share
app.post('/api/surprise/:code/share', api(async (req, res) => {
  const { code } = req.params;
  const channel = String((req.body && req.body.channel) || 'link').slice(0, 30);
  const surprisePath = `${SURPRISE_DIR(code)}/${code}.json`;
  const surprise = await readJson(store, surprisePath, null);
  if (!surprise) return res.status(404).json({ error: 'surprise not found' });

  const staged = [];
  await updateJson(staged, store, surprisePath, null, (s) => {
    s.shares = (s.shares || 0) + 1;
  });
  await updateJson(staged, store, 'database/analytics/shares.json', { byChannel: {}, recent: [] }, (sh) => {
    sh.byChannel[channel] = (sh.byChannel[channel] || 0) + 1;
    sh.recent = [{ type: channel, surprise: code, timestamp: now() }, ...sh.recent].slice(0, 500);
  });
  await engine.touchAnalytics(staged, { shares: 1 });
  await engine.record({
    message: `Record share event ${code} (${channel})`,
    files: staged,
    event: makeEvent('SURPRISE_SHARED', surprise.creatorId, code, { channel }),
  });
  res.json({ ok: true });
}));

// react
app.post('/api/surprise/:code/react', api(async (req, res) => {
  const { code } = req.params;
  const type = String((req.body && req.body.type) || 'heart').slice(0, 20);
  const surprisePath = `${SURPRISE_DIR(code)}/${code}.json`;
  const surprise = await readJson(store, surprisePath, null);
  if (!surprise) return res.status(404).json({ error: 'surprise not found' });

  const staged = [];
  await updateJson(staged, store, surprisePath, null, (s) => {
    s.reactions = s.reactions || {};
    s.reactions[type] = (s.reactions[type] || 0) + 1;
  });
  await updateJson(staged, store, 'database/analytics/reactions.json', { byType: {}, recent: [] }, (r) => {
    r.byType[type] = (r.byType[type] || 0) + 1;
    r.recent = [{ surprise_id: code, type, timestamp: now() }, ...r.recent].slice(0, 500);
  });
  await engine.touchAnalytics(staged, { reactions: 1 });
  await engine.record({
    message: `Add ${type} reaction to ${code}`,
    files: staged,
    event: makeEvent('SURPRISE_REACTED', 'anonymous', code, { reaction: type }),
  });
  res.json({ ok: true });
}));

// update surprise
app.put('/api/surprise/:code', api(async (req, res) => {
  const { code } = req.params;
  const b = req.body || {};
  const surprisePath = `${SURPRISE_DIR(code)}/${code}.json`;
  const surprise = await readJson(store, surprisePath, null);
  if (!surprise) return res.status(404).json({ error: 'surprise not found' });

  const staged = [];
  let message = `Update surprise ${code}`;
  let eventType = 'MESSAGE_UPDATED';

  await updateJson(staged, store, surprisePath, null, (s) => {
    if (typeof b.title === 'string') s.title = b.title.slice(0, 120);
    if (typeof b.message === 'string') s.message = b.message.slice(0, 5000);
    if (typeof b.from === 'string') s.from = b.from.slice(0, 60);
    if ('openAt' in b) s.openAt = b.openAt || null;
    if ('password' in b) {
      if (b.password) { s.passwordHash = sha256(String(b.password)); eventType = 'PASSWORD_CREATED'; }
      else { s.passwordHash = null; }
    }
    s.updated_at = now();
  });

  const label = typeLabel(surprise.type);
  message = eventType === 'PASSWORD_CREATED'
    ? `Add password protection to ${label} ${code}`
    : `Update ${label} surprise ${code}`;

  await engine.record({
    message,
    files: staged,
    event: makeEvent(eventType, surprise.creatorId, code),
  });
  res.json({ ok: true, surprise: stripPrivate(await readJson(store, surprisePath, null)) });
}));

// QR code generation (records the event, returns a QR image URL)
app.post('/api/surprise/:code/qr', api(async (req, res) => {
  const { code } = req.params;
  const surprisePath = `${SURPRISE_DIR(code)}/${code}.json`;
  const surprise = await readJson(store, surprisePath, null);
  if (!surprise) return res.status(404).json({ error: 'surprise not found' });

  await engine.record({
    message: `Generate QR code for surprise ${code}`,
    files: [],
    event: makeEvent('QR_GENERATED', surprise.creatorId, code),
  });

  const url = `${config.baseUrl}/s/${code}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(url)}`;
  res.json({ url, qrUrl });
}));

// ------------------------------------------------------------------
// Admin dashboard
// ------------------------------------------------------------------
app.get('/api/admin/stats', api(async (_req, res) => {
  const [overview, commits, events, occasions, recentCommits, userFiles, surpriseFiles] = await Promise.all([
    engine.stats(),
    engine.store.countCommits(),
    engine.recentEvents(30),
    readJson(store, 'database/analytics/occasions.json', { byType: {} }),
    store.recentCommits(8).catch(() => []),
    store.listFiles('database/users'),
    store.listFiles(`${SURPRISE_DIR('')}`),
  ]);

  res.json({
    overview,
    commits,
    events,
    occasions: occasions.byType || {},
    recentCommits,
    users: userFiles.length,
    surprises: surpriseFiles.filter((f) => f.endsWith('.json')).length,
    mode: config.mode,
    githubEnabled: engine.githubEnabled,
    github: engine.githubEnabled ? `${config.owner}/${config.repo}` : null,
    heartbeat: overview.lastHeartbeat,
  });
}));

// ------------------------------------------------------------------
// Heartbeat — the daily activity report commit
// ------------------------------------------------------------------
app.post('/api/heartbeat', api(async (_req, res) => {
  const result = await engine.heartbeat({ manual: true });
  res.json(result);
}));

// Serve the surprise page at /s/:code
app.get('/s/:code', (_req, res) => {
  res.sendFile(path.join(config.publicDir, 'surprise.html'));
});

// catch-all for unknown API routes
app.use('/api', (_req, res) => res.status(404).json({ error: 'not found' }));

// SPA-ish: any other route goes to the landing page
app.get('*', (_req, res) => {
  res.sendFile(path.join(config.publicDir, 'index.html'));
});

function stripPrivate(s) {
  const copy = { ...s, media: s.media || { images: [], audio: [] } };
  delete copy.passwordHash;
  copy.requiresPassword = Boolean(s.passwordHash);
  return copy;
}

// ------------------------------------------------------------------
// Boot
// ------------------------------------------------------------------
app.listen(config.port, async () => {
  console.log('──────────────────────────────────────────────');
  console.log('  💖 SendAPrize is running');
  console.log(`  ➜  ${config.baseUrl}`);
  console.log('  ─────────────────────────────────────────────');
  if (engine.githubEnabled) {
    console.log(`  GitHub database  : ${config.owner}/${config.repo}`);
    console.log(`  Commit mode      : ${config.mode}${config.mode === 'DEMO' ? ' (every interaction = a commit)' : ` (batched ${config.batchSize} events / ${config.batchFlushSeconds}s)`}`);
  } else {
    console.log('  ⚠  No GitHub credentials found in .env');
    console.log('  ⚠  Running in LOCAL preview mode (data stored locally).');
    console.log('  ⚠  Copy .env.example to .env and add GITHUB_TOKEN/OWNER/REPO to switch on.');
  }
  if (config.heartbeatAuto && engine.githubEnabled) {
    const hours = config.heartbeatHours;
    console.log(`  Heartbeat        : every ${hours}h`);
    setInterval(() => {
      engine.heartbeat().then((r) => console.log('  Heartbeat commit:', r.day)).catch((e) => console.error('heartbeat failed:', e.message));
    }, hours * 3600 * 1000).unref?.();
  }
  console.log('──────────────────────────────────────────────');
});

module.exports = app;

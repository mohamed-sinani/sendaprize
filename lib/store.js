// ------------------------------------------------------------------
// SendAPrize — the commit engine (part 1: stores)
// GitHub is the database. Every meaningful interaction becomes a commit.
// If no GitHub credentials exist yet, falls back to a local file store
// so the UI can be previewed without wiring up GitHub.
// ------------------------------------------------------------------

const fs = require('fs');
const path = require('path');
const config = require('../config');

const API = 'https://api.github.com';
const CACHE_TTL = 4000;

function encodePath(p) {
  return p.split('/').map(encodeURIComponent).join('/');
}

// ------------------------------------------------------------------
// GitHub store
// ------------------------------------------------------------------
class GitHubStore {
  constructor({ token, owner, repo }) {
    this.token = token;
    this.owner = owner;
    this.repo = repo;
    this.base = `${API}/repos/${owner}/${repo}`;
    this.cache = new Map();
    this.defaultBranch = null;
  }

  headers(extra = {}) {
    return {
      Authorization: `Bearer ${this.token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'sendaprize',
      ...extra,
    };
  }

  async req(method, url, body) {
    const res = await fetch(url, {
      method,
      headers: this.headers(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 204) return null;
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const err = new Error((data && data.message) || `${method} ${url} -> ${res.status}`);
      err.status = res.status;
      err.details = data;
      throw err;
    }
    return data;
  }

  async getDefaultBranch() {
    if (this.defaultBranch) return this.defaultBranch;
    const repo = await this.req('GET', this.base);
    this.defaultBranch = repo.default_branch;
    return this.defaultBranch;
  }

  async readFile(filePath, { force = false } = {}) {
    if (!force && this.cache.has(filePath)) return this.cache.get(filePath).value;
    let content = null;
    try {
      const data = await this.req('GET', `${this.base}/contents/${encodePath(filePath)}`);
      content = Buffer.from(data.content, 'base64').toString('utf8');
    } catch (e) {
      if (e.status !== 404) throw e;
    }
    this.cache.set(filePath, { value: content, t: Date.now() });
    return content;
  }

  async readBuffer(filePath) {
    const data = await this.req('GET', `${this.base}/contents/${encodePath(filePath)}`);
    return Buffer.from(data.content, 'base64');
  }

  async listFiles(dirPath) {
    try {
      const data = await this.req('GET', `${this.base}/contents/${encodePath(dirPath)}`);
      return Array.isArray(data) ? data.map((f) => f.name) : [];
    } catch (e) {
      if (e.status === 404) return [];
      throw e;
    }
  }

  // One atomic multi-file commit via the git trees API.
  // Every call to this method is exactly ONE commit.
  async commitFiles(files, message) {
    const branch = await this.getDefaultBranch();
    const ref = await this.req('GET', `${this.base}/git/ref/heads/${branch}`);
    const latest = await this.req('GET', ref.object.url);

    const tree = [];
    for (const f of files) {
      if (f.binary) {
        // binary content goes through the git blobs API (base64), then the tree
        const blob = await this.req('POST', `${this.base}/git/blobs`, {
          content: f.content,
          encoding: 'base64',
        });
        tree.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
      } else {
        tree.push({ path: f.path, mode: '100644', type: 'blob', content: f.content });
      }
    }

    const treeRes = await this.req('POST', `${this.base}/git/trees`, {
      base_tree: latest.tree.sha,
      tree,
    });
    const commit = await this.req('POST', `${this.base}/git/commits`, {
      message,
      tree: treeRes.sha,
      parents: [ref.object.sha],
    });
    await this.req('PATCH', `${this.base}/git/refs/heads/${branch}`, {
      sha: commit.sha,
      force: false,
    });

    for (const f of files) {
      if (!f.binary) this.cache.set(f.path, { value: f.content, t: Date.now() });
    }
    return commit;
  }

  async countCommits() {
    try {
      const res = await fetch(`${this.base}/commits?per_page=1`, { headers: this.headers() });
      const link = res.headers.get('link') || '';
      const m = link.match(/page=(\d+)>;\s*rel="last"/);
      return m ? parseInt(m[1], 10) : 0;
    } catch {
      return 0;
    }
  }

  async recentCommits(count = 10) {
    const list = await this.req('GET', `${this.base}/commits?per_page=${count}`);
    return (list || []).map((c) => ({
      sha: c.sha,
      message: c.commit.message.split('\n')[0],
      date: c.commit.author.date,
    }));
  }
}

// ------------------------------------------------------------------
// Local file fallback store (preview before GitHub is configured)
// ------------------------------------------------------------------
class FileStore {
  constructor(dir) {
    this.dir = dir;
    this.commits = 0;
    this._lastCommit = null;
  }

  _p(filePath) {
    const full = path.resolve(this.dir, filePath);
    if (!full.startsWith(path.resolve(this.dir))) throw new Error('bad path');
    return full;
  }

  readFile(filePath) {
    try {
      return fs.readFileSync(this._p(filePath), 'utf8');
    } catch {
      return null;
    }
  }

  readBuffer(filePath) {
    try {
      return fs.readFileSync(this._p(filePath));
    } catch {
      return null;
    }
  }

  listFiles(dirPath) {
    try {
      return fs.readdirSync(this._p(dirPath)).map(String);
    } catch {
      return [];
    }
  }

  async commitFiles(files) {
    for (const f of files) {
      const full = this._p(f.path);
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, f.binary ? Buffer.from(f.content, 'base64') : f.content);
    }
    this.commits += 1;
    this._lastCommit = { files: files.map((f) => f.path) };
    return { sha: `local-${this.commits}` };
  }

  async countCommits() {
    return this.commits;
  }

  async recentCommits() {
    const last = this._lastCommit;
    return last
      ? [
          {
            sha: 'local',
            message: `Record ${last.files.length} user interactions`,
            date: new Date().toISOString(),
          },
        ]
      : [];
  }
}

// ------------------------------------------------------------------
// Store facade
// ------------------------------------------------------------------
let _instance = null;
function getStore() {
  if (_instance) return _instance;
  if (config.githubEnabled) {
    _instance = new GitHubStore({
      token: config.token,
      owner: config.owner,
      repo: config.repo,
    });
  } else {
    _instance = new FileStore(config.localDataDir);
  }
  return _instance;
}

function pruneCache(store) {
  if (store.cache) {
    const now = Date.now();
    for (const [k, v] of store.cache) if (now - v.t > CACHE_TTL) store.cache.delete(k);
  }
}

// ------------------------------------------------------------------
// JSON + JSONL helpers on top of any store
// ------------------------------------------------------------------
async function readJson(store, filePath, fallback) {
  const raw = await store.readFile(filePath);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

// Reads a JSON file, mutates it via fn, and stages the write so it can be
// committed atomically together with other files in the same interaction.
async function updateJson(staged, store, filePath, fallback, fn) {
  const data = await readJson(store, filePath, fallback);
  fn(data);
  staged.push({ path: filePath, content: JSON.stringify(data, null, 2) });
  return data;
}

// Rotating per-month JSONL event log. Every interaction appends a line.
async function appendEvent(staged, store, event) {
  const month = event.time.slice(0, 7);
  const filePath = `database/events/${month}/events.jsonl`;
  const raw = await store.readFile(filePath);
  const lines = raw ? raw.split('\n').filter(Boolean) : [];
  lines.push(JSON.stringify(event));
  const capped = lines.slice(-50000);
  staged.push({ path: filePath, content: capped.join('\n') + '\n' });
  return filePath;
}

module.exports = {
  GitHubStore,
  FileStore,
  getStore,
  readJson,
  updateJson,
  appendEvent,
  pruneCache,
  API,
};

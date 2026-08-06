// ------------------------------------------------------------------
// SendAPrize — the commit engine (part 2)
// DEMO mode:      every interaction = one commit (max GitHub activity)
// PRODUCTION mode: events queue up and commit in one batch commit
//                  (after BATCH_SIZE events or every BATCH_FLUSH_SECONDS)
// Also owns the daily "heartbeat" report commits.
// ------------------------------------------------------------------

const config = require('../config');
const { getStore, pruneCache, readJson, updateJson, appendEvent } = require('./store');
const { makeEvent, eventLabel } = require('./events');
const { todayKey } = require('./ids');

const AGG_PATH = 'database/analytics/overview.json';

function emptyOverview() {
  return {
    users: 0,
    surprises: 0,
    views: 0,
    opens: 0,
    shares: 0,
    reactions: 0,
    commits: 0,
    images: 0,
    voices: 0,
    lastHeartbeat: null,
    updated: null,
  };
}

class CommitEngine {
  constructor() {
    this.store = getStore();
    this.production = config.mode === 'PRODUCTION';
    this.queue = [];
    this.flushTimer = null;
    this.totalCommits = 0;
    this.lastCommit = null;
    this.lastHeartbeatKey = null;

    if (this.production) {
      this.flushTimer = setInterval(() => this.flush(), config.batchFlushSeconds * 1000);
      this.flushTimer.unref?.();
    }
  }

  get githubEnabled() {
    return this.store.constructor.name === 'GitHubStore';
  }

  // The single entry point for every meaningful interaction.
  //   record({ message, files, event })
  async record({ message, files = [], event }) {
    pruneCache(this.store);

    if (event) {
      // every interaction is also written to the immutable JSONL event log
      const staged = [];
      await appendEvent(staged, this.store, event);
      files.push(staged[0]);
    }

    // de-duplicate staged paths (last write wins)
    const seen = new Map();
    for (const f of files) seen.set(f.path, f);
    const uniqueFiles = [...seen.values()];

    return this._commit(uniqueFiles, message);
  }

  // Bump aggregate counters and stage analytics files for the interaction.
  async touchAnalytics(
    staged,
    { surprises = 0, views = 0, opens = 0, shares = 0, reactions = 0, images = 0, voices = 0 }
  ) {
    await updateJson(staged, this.store, AGG_PATH, emptyOverview(), (a) => {
      a.users = a.users || 0;
      a.surprises = (a.surprises || 0) + surprises;
      a.views = (a.views || 0) + views;
      a.opens = (a.opens || 0) + opens;
      a.shares = (a.shares || 0) + shares;
      a.reactions = (a.reactions || 0) + reactions;
      a.images = (a.images || 0) + images;
      a.voices = (a.voices || 0) + voices;
      a.commits = a.commits || 0;
      a.updated = new Date().toISOString();
    });
  }

  // Fold the running commit counter into the SAME commit (no extra commit).
  async _foldCommitCount(files) {
    const hasOverview = files.find((f) => f.path === AGG_PATH);
    if (hasOverview) {
      const o = JSON.parse(hasOverview.content);
      o.commits = (o.commits || 0) + 1;
      hasOverview.content = JSON.stringify(o, null, 2);
      return files;
    }
    const data = await readJson(this.store, AGG_PATH, emptyOverview());
    data.commits = (data.commits || 0) + 1;
    files.push({ path: AGG_PATH, content: JSON.stringify(data, null, 2) });
    return files;
  }

  async _commit(files, message) {
    files = await this._foldCommitCount(files);
    if (!this.production) {
      const c = await this.store.commitFiles(files, message);
      this.totalCommits += 1;
      this.lastCommit = {
        message,
        files: files.map((f) => f.path),
        sha: c.sha,
        time: new Date().toISOString(),
      };
      return { queued: false, commit: this.lastCommit, total: this.totalCommits };
    }

    this.queue.push({ message, files, time: Date.now() });
    if (this.queue.length >= config.batchSize) {
      return this.flush();
    }
    return {
      queued: true,
      pending: this.queue.length,
      batchSize: config.batchSize,
      commit: null,
    };
  }

  async flush() {
    if (this.queue.length === 0) return { committed: 0 };
    const batch = this.queue.splice(0, this.queue.length);
    const files = [];
    const seen = new Map();
    for (const b of batch) for (const f of b.files) seen.set(f.path, f);
    const uniqueFiles = [...seen.values()];

    const firstMsg = batch[0].message;
    const message =
      batch.length === 1
        ? firstMsg
        : `Record ${batch.length} user interactions (${firstMsg.toLowerCase()} and more)`;

    const c = await this.store.commitFiles(await this._foldCommitCount(uniqueFiles), message);
    this.totalCommits += 1;
    this.lastCommit = {
      message,
      files: uniqueFiles.map((f) => f.path),
      sha: c.sha,
      time: new Date().toISOString(),
    };
    return { committed: batch.length, commit: this.lastCommit, total: this.totalCommits };
  }

  async stats() {
    const [overview, commits] = await Promise.all([
      readJson(this.store, AGG_PATH, emptyOverview()).catch(() => emptyOverview()),
      this.store.countCommits(),
    ]);
    return { ...overview, commits: commits || overview.commits || 0 };
  }

  async recentEvents(count = 50) {
    const month = todayKey().slice(0, 7);
    const raw = await this.store.readFile(`database/events/${month}/events.jsonl`);
    const lines = raw ? raw.split('\n').filter(Boolean) : [];
    return lines
      .slice(-count)
      .reverse()
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  }

  // ------------------------------------------------------------------
  // Daily heartbeat — the "living story" commit
  // ------------------------------------------------------------------
  async heartbeat({ manual = false } = {}) {
    const day = todayKey();
    const stats = await this.stats();

    const report = [
      `Daily Activity Report - ${day}`,
      '',
      `🧸 ${stats.surprises} surprises created`,
      `👀 ${stats.views} views`,
      `📦 ${stats.opens} opens`,
      `📤 ${stats.shares} shares`,
      `💖 ${stats.reactions} reactions`,
      `📝 ${stats.commits} commits in the story`,
      `👤 ${stats.users} users`,
      '',
      'This repository is the living history of SendAPrize.',
    ].join('\n');

    const staged = [];
    await updateJson(staged, this.store, AGG_PATH, emptyOverview(), (a) => {
      a.lastHeartbeat = day;
    });

    const event = makeEvent('HEARTBEAT', 'system', null, { day, report });
    await appendEvent(staged, this.store, event);

    const message = manual ? `Daily Activity Report - ${day}` : `Daily heartbeat report ${day}`;
    const res = await this._commit(staged, message);
    this.lastHeartbeatKey = day;
    return { day, report, commit: res.commit };
  }
}

module.exports = { CommitEngine, emptyOverview };

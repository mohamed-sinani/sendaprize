# 💖 sendaprize

Send a surprise that opens like a gift. Messages, photos, voice notes, music, countdowns
and password-protected boxes — wrapped in a beautiful interactive experience.

**GitHub is the database.** Every meaningful interaction becomes a commit in your own
repository, which doubles as the platform's complete, immutable event history.

## ⚡ Quick start

```bash
npm install

# configure GitHub (see below)
cp .env.example .env

npm start
# → http://localhost:3000
```

> **No GitHub yet?** The app still runs in **local preview mode** and stores data in
> `./local-data/` so you can explore the UI first. Wire up GitHub to switch on commits.

## 🔑 Connect GitHub (one-time)

1. Create a GitHub account and a repository, e.g. `sendaprize`.
2. Create a **Personal Access Token**:
   GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) →
   Generate new token → select the **`repo`** scope.
3. Edit `.env`:

```
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxx
GITHUB_OWNER=your-github-username
GITHUB_REPO=sendaprize
BASE_URL=https://sendaprize.online
```

4. Restart the server. The app will now commit every interaction to your repo.

The repository becomes your "living story" — `/database` holds users, surprises,
analytics and the JSONL event log, while commits record what happened, as it happened.

## 🗄️ How GitHub acts as the database

```
/database
   /users        user_001.json        ← created on account creation
   /surprises    2026/08/AbX91P.json  ← one file per surprise
   /events       2026/08/events.jsonl ← append-only event log
   /analytics    views / reactions / shares / themes / overview / commits
/media
   /images, /audio                    ← uploaded memories
```

| Interaction                | Commit message                                  |
| -------------------------- | ----------------------------------------------- |
| Account created            | `Create new user account user_001`              |
| Surprise created           | `Create birthday surprise AbX91P`               |
| Surprise viewed            | `Record surprise view AbX91P`                   |
| Surprise opened            | `Open surprise AbX91P`                          |
| Surprise shared            | `Record share event AbX91P (whatsapp)`          |
| Reaction                   | `Add ❤️ reaction to AbX91P`                     |
| Image / voice added        | `Add image to surprise AbX91P`                  |
| QR generated               | `Generate QR code for surprise AbX91P`          |
| Daily report               | `Daily Activity Report - 2026-08-06`            |

## 🔁 Commit engine

- **DEMO mode** (default) — every interaction creates its own commit. Maximum GitHub
  contribution-graph activity and a very detailed story.
- **PRODUCTION mode** — events are queued and batched into a single commit every
  50 events or 60 seconds (see `COMMIT_MODE`, `BATCH_SIZE`, `BATCH_FLUSH_SECONDS`).

## 💓 Daily heartbeat

`HEARTBEAT_AUTO=true` writes a **Daily Activity Report** commit on a schedule, so the
GitHub graph stays full even on quiet days. You can also trigger it manually from the
Story dashboard or via `POST /api/heartbeat`.

## 🖥️ Pages

- `/` — landing
- `/create` — the surprise builder (5-step wizard with live preview)
- `/s/AbX91P` — the gift-box opening experience
- `/admin` — story dashboard (stats, themes, events, commits, heartbeat)

## ☁️ Deploying to sendaprize.online

Host it anywhere that runs Node.js (Render, Railway, Fly.io, VPS, etc.):

- **Build command:** `npm install`
- **Start command:** `npm start`
- **Env vars:** the contents of `.env` (especially `GITHUB_TOKEN`, `GITHUB_OWNER`,
  `GITHUB_REPO`, `BASE_URL`)
- Point the `sendaprize.online` domain at your host, then set `BASE_URL=https://sendaprize.online`.

## 📁 Project structure

```
server.js          Express API + commit engine wiring
lib/store.js       GitHub store (git trees API) + local fallback
lib/engine.js      DEMO/PRODUCTION commit engine + heartbeat
lib/events.js      event types
public/            HTML/CSS/JS frontend (no build step)
```

## 🔒 Security notes

- The GitHub token only ever lives server-side (`.env`), never in the browser.
- Password-protected surprises store a SHA-256 hash, never the raw password.
- Media uploads are capped at ~6MB and images are compressed in the browser.

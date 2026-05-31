# Home Gym — Track &amp; Build

A mobile-first, offline-friendly workout tracker for a home gym (Rogue rack,
barbell, PowerBlocks, kettlebells, bands). Plain HTML/CSS/JS — no framework, no
build step. Logs sets, tracks history, and charts estimated-1RM progress.

## Run it

It's static. Any of these work:

- **VS Code:** install the **Live Server** extension, right-click `index.html` →
  *Open with Live Server*.
- **Node:** `npx serve .`
- **Python:** `python3 -m http.server` then open the printed URL.

You can also just double-click `index.html`, but running through a local server
is recommended so storage and relative paths behave normally.

## Access it on your phone AND computer

The layout is responsive — it shows a single column on a phone, two-up exercise
cards on a tablet/laptop, and three-up on a wide desktop. To actually open it on
both devices you have two options:

**A) Same Wi-Fi, quick testing.** Run `npm start` (or `npx serve .`). It prints a
`Network:` URL like `http://192.168.1.20:3000`. Open that on your phone while both
devices are on the same Wi-Fi. (VS Code Live Server works too — set it to bind to
`0.0.0.0` / use the LAN address it shows.)

**B) Always-on, anywhere (recommended).** Deploy the folder to free static
hosting so one URL works on every device:
- **Netlify** — drag the folder onto app.netlify.com/drop, or `npx netlify deploy`.
- **GitHub Pages** — push to a repo, enable Pages.
- **Cloudflare Pages** — connect the repo or upload directly.

Then on the phone, open the URL and "Add to Home Screen" for an app-like icon.

> Data note: history is stored per-device in that browser's `localStorage`.
> You can keep devices in step two ways: the manual **Copy Backup / Restore**
> buttons, or the built-in **Sync** panel (see below) for one-tap push/pull.

## Cross-device sync

The app has an optional **Sync** panel that shares your log between phone and
computer using a short code. It needs a tiny free backend — and you can use an
account you already have. Three drop-in options live in `backends/` (the app is
backend-agnostic, so they're interchangeable; switching is just a URL change):

- **`backends/deno`** — Deno Deploy, **sign in with GitHub**, storage built in
  (Deno KV). Link your repo and it auto-deploys. *Recommended if you want to use
  GitHub.*
- **`backends/netlify`** — Netlify, **sign in with GitHub**, storage built in
  (Netlify Blobs). Great if you also host the app on Netlify — one project.
- **`backends/cloudflare`** — the original Cloudflare Worker + KV.

Steps:

1. Pick one backend and follow its README to deploy it. See
   [`backends/README.md`](backends/README.md) for a comparison and an honest note
   on why GitHub *alone* (Gists) isn't a good fit.
2. Paste the resulting URL into `js/config.js` (`window.SYNC_API = "..."`).
3. Reload. In the Sync panel, tap **Generate Code** on one device, enter that same
   code on your others, then **Sync Now** / **Pull**. Optional **auto-sync**
   pushes shortly after each saved workout.

Syncing only ever adds workouts (union by id), so it can't delete your data.
Deleting a workout on one device won't remove it from the others. Claude Code can
handle the whole deployment for you — just ask.

## Project structure

```
index.html       markup only
css/styles.css   all styling (theme variables at :root)
js/app.js         all logic (one IIFE)
CLAUDE.md         context for Claude Code — read this before editing
```

## Data &amp; persistence

All data stays on your device in the browser's `localStorage` under the key
`hg_sessions_v2`. Nothing is sent anywhere. Use the in-app **Copy Backup**
button to export your log as text, and **Restore** to import it on another
device or browser.

> Note: the app also writes to `window.storage` when running inside the Claude
> artifact sandbox. In a normal browser that doesn't exist, so it transparently
> uses `localStorage`. See CLAUDE.md for details.

## Developing with Claude Code

```bash
cd home-gym-app
claude          # start a session in the project folder
```

Claude Code automatically reads `CLAUDE.md` for project context. From there you
can ask it to explain the code, add features (see the backlog in CLAUDE.md), or
fix issues. Run `/init` if you want Claude to regenerate/expand `CLAUDE.md`.

## Disclaimer

General fitness software, not medical advice. Warm up, use good form, and use
your rack's safety bars when training alone.

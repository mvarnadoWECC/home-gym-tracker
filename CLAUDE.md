# CLAUDE.md

Project context for Claude Code. Read this before making changes.

## What this is

A single-page, offline-friendly **home gym workout tracker**. It runs entirely in
the browser — no backend, no build step, no framework. Pure HTML + CSS + vanilla
JavaScript (ES5-compatible style, no transpiler).

The app lets the user:
- Pick a workout (Benchmark, Upper A, Lower A, Upper B, Lower B)
- See a dynamic warm-up tailored to that day
- Log weight × reps for every set of every exercise
- Save sessions to history (newest first), with last session's numbers pre-filled
- View an estimated-1RM progress chart per main lift (hand-drawn SVG)
- Back up / restore all data as JSON text

## File layout

```
home-gym-app/
├── index.html        # markup only; links css/ and js/
├── css/styles.css    # all styles (CSS variables at :root)
├── js/app.js         # core app logic, wrapped in one IIFE
├── js/config.js      # user-set SYNC_API backend URL (empty = local-only)
├── js/sync.js        # optional cross-device sync UI + push/pull/merge
├── backends/         # interchangeable sync backends — deploy ONE
│   ├── README.md     #   shared contract + comparison + GitHub/Gist note
│   ├── deno/         #   Deno Deploy + Deno KV (GitHub login)  ← recommended
│   ├── netlify/      #   Netlify Function + Netlify Blobs (GitHub login)
│   └── cloudflare/   #   Cloudflare Worker + KV (original)
├── README.md         # human-facing setup + run notes
└── CLAUDE.md         # this file
```

The core app is `index.html` + `css/styles.css` + `js/app.js`. Sync is additive
and optional: with `js/config.js` left blank, `sync.js` just shows setup text and
the app stays 100% local.

## How to run / preview

No build. Open `index.html` in a browser, or use a static server (recommended so
relative paths and storage behave normally):

- VS Code "Live Server" extension → "Go Live", **or**
- `npx serve .` / `python3 -m http.server` from the project root.

## Architecture notes (read before editing js/app.js)

The whole script is one IIFE. Key pieces, in order:

- **Config data** — `WARMUPS`, `RAMP`, `DAYS`, `MOVEMENTS`. These are plain
  objects/arrays that drive all rendering. To add an exercise or change a rep
  scheme, edit `DAYS`; to add a lift to the progress chart, edit `MOVEMENTS`.
- **Exercise IDs are the stable keys.** Each exercise has a unique `id`
  (e.g. `ua_inc`, `la_fsq`). History and the chart reference these IDs, so
  **never rename an existing id** without a data migration — it will orphan
  saved logs. Add new ids freely.
- **Storage layer** — `loadRaw()` / `saveRaw()` write to TWO targets:
  1. `window.storage` (only exists inside the Claude artifact sandbox)
  2. `localStorage` (the real browser — this is what matters in VS Code/hosting)
  A save "succeeds" if either works. This dual approach is intentional so the
  same file runs both in Claude and standalone. If we permanently leave the
  Claude artifact environment, the `window.storage` branch can be removed and
  this simplified to localStorage only — but it's harmless to keep.
- **Data model** — sessions are stored under key `hg_sessions_v2` as a JSON
  array. Each session:
  ```js
  { id:"s<timestamp>", date:"YYYY-MM-DD", bw:"<lb>",
    day:"upperA", dayName:"...", logs:{ "<exerciseId>": [ {w,r}, {w,r} ] } }
  ```
  Bump the version suffix (`_v3`, …) and write a migration if the shape changes.
- **Estimated 1RM** uses the **Epley formula**: `w * (1 + reps/30)`. Suggested
  starting weight = `round(e1RM * 0.80)` to nearest 5 lb. The progress chart
  takes the best e1RM per session per movement and plots the trend as inline SVG
  (`buildChartSVG`) — no chart library.
- **Render flow** — `renderDay()` rebuilds the active workout and then calls
  `renderHistory()` and `renderProgress()`. After any data mutation (save,
  delete, restore) those three should stay in sync.

## Design system (keep it cohesive)

- Aesthetic: industrial / rack-hardware. Dark steel + safety-amber accent.
- Colors are CSS variables in `:root` (`--steel-900..600`, `--amber`, `--green`,
  `--red`, `--txt`, `--txt-dim`). Use the variables; don't hardcode new hex values.
- Fonts (Google Fonts): **Anton** (display/headlines + big numbers),
  **Barlow Semi Condensed** (labels/buttons), **Barlow** (body). Don't introduce
  Inter/Roboto/system fonts.
- Mobile-first. The primary user is on an iPhone in a gym. Test narrow widths.
  Watch for iOS quirks (e.g. `input[type=date]` won't shrink — the date/bodyweight
  row uses a CSS grid with `min-width:0` to prevent overlap; preserve that).
- **Responsive layer** lives at the bottom of `styles.css` under a clearly marked
  comment block. The base styles are the phone layout (unchanged below ~720px).
  Breakpoints: `≥720px` (tablet/laptop — day buttons fill the bar, exercises go
  2-up, warm-up goes 2-column), `≥1080px` (desktop — exercises 3-up, chart capped
  and centered), and a `hover:hover` block for mouse hover states. Add new desktop
  rules to that layer rather than editing the mobile base.

## Cross-device sync (js/sync.js + backends/)

Optional. Lets the user share a workout log between phone and computer.

- **How it connects:** `js/config.js` exports `window.SYNC_API` (a backend URL).
  If blank, sync is off and the panel shows setup text. `sync.js` reads/writes a
  cloud blob via `GET/PUT {SYNC_API}/data/:code`, where `:code` is a user-shared
  "sync code" (the only access secret; 6–32 alphanumerics).
- **Backend is pluggable.** `backends/` holds three interchangeable
  implementations of the same `/data/:code` contract — deploy ONE and paste its
  URL into config.js. `deno/` (Deno Deploy + Deno KV, GitHub login — recommended),
  `netlify/` (Netlify Function + Netlify Blobs, GitHub login), `cloudflare/`
  (Worker + KV). All open CORS (`*`). See `backends/README.md` for the contract
  and the reasoning on why GitHub Gists alone aren't a good store (client token
  exposure). When changing the contract, update ALL backends + sync.js together.
- **App ↔ sync bridge:** `app.js` keeps `sessions` private but exposes
  `window.HG = { getSessions(), count(), merge(incoming), storageKey }` and fires
  a `hg:changed` event after local save/delete/restore. `sync.js` listens to that
  event for debounced auto-push, and calls `window.HG.merge()` on pull. **Keep
  this bridge stable** if you refactor app.js — sync.js depends on it.
- **Merge strategy:** union by session `id` (append-only, never deletes). Push is
  pull→union→put so two devices can't clobber each other. Verified to converge.
  Known limitation: deletes don't propagate across devices. Realtime sync and
  delete-propagation would need per-session tombstones or a timestamped op log.
- **Script order matters** in index.html: `app.js` → `config.js` → `sync.js`.

## Conventions

- Vanilla JS only, no dependencies in the app itself. No `fetch` to external APIs.
- Do NOT use a build step or add npm runtime deps without discussing first.
- Keep `index.html` markup-only; styles in `styles.css`, logic in `app.js`.
- This is general fitness software, not medical advice — keep the disclaimer in
  the footer.

## Good first tasks / backlog ideas

- Bodyweight trend line (data is already captured per session under `bw`).
- Per-workout total volume (Σ weight × reps) tracking.
- Editable past sessions (currently delete-only).
- "Add set" / "remove set" buttons on an exercise during logging.
- Optional: split the giant `DAYS`/`MOVEMENTS` config into a `js/data.js` module
  once the app grows (would then move to ES modules + `type="module"`).
- Cross-device sync: **implemented** (manual push/pull + optional auto-push). Pick
  a backend in `backends/` (Deno Deploy / Netlify / Cloudflare). Next steps if
  desired: propagate deletes (tombstones), conflict-free realtime sync, or
  optional end-to-end encryption of the cloud blob so the sync code also acts as a
  decryption key.

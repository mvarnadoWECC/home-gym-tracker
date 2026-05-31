# Sync backends — pick ONE

The app's sync client (`js/sync.js`) is **backend-agnostic**. It only needs an
HTTPS endpoint that implements this contract:

```
GET    /data/:code   -> 200 { "sessions": [...] }   (404 if nothing stored yet)
PUT    /data/:code   -> stores { "sessions": [...], "updated": <ms> }
OPTIONS *            -> CORS preflight (Access-Control-Allow-Origin: *)
:code = 6–32 alphanumeric chars; it is the only access key
```

Deploy one of the backends below, then set its URL in `js/config.js`
(`window.SYNC_API = "..."`). They're interchangeable — switching later is just a
URL change.

## Your options

| Backend | Account you use | Storage | Why pick it |
|---|---|---|---|
| **deno/** | **Deno Deploy — sign in with GitHub** | Deno KV (built in) | Best "just use GitHub." Link the repo and it auto-deploys; KV is included, nothing to provision. |
| **netlify/** | **Netlify — sign in with GitHub** | Netlify Blobs (built in) | Best if you also host the app on Netlify — site + sync deploy as one project, same origin. |
| **cloudflare/** | Cloudflare | Workers KV | The original. Fine if you already use Cloudflare; needs a KV namespace step. |

All three are free for personal use and need no separate database service. Each
folder has its own README with exact deploy steps.

**Recommendation:** since you asked about GitHub — use **deno/**. You sign in with
GitHub, point it at your repo, and storage is built in. No Cloudflare.

## "Can I use GitHub *directly* as the storage?"

Sort of, but it's not recommended:

- **GitHub Pages is static-only** — it can serve the app, but it can't run a write
  endpoint, so it can't be the sync API by itself.
- A **GitHub Gist (or repo) via the API** can hold the JSON, but writing to it from
  the browser means embedding a GitHub **token in client-side JavaScript**, where
  anyone who opens the page can read and abuse it (touch all your gists, burn your
  API limits). Even a fine-grained, gist-only token is exposed.
- The safe way to use a GitHub Gist as storage is to put a tiny server in front
  that holds the token secret — but that server has to run *somewhere*, which puts
  you right back on Deno Deploy / Netlify / Cloudflare. At that point their own
  built-in KV is simpler than going through Gists.

So: **GitHub is great for hosting the code and signing in** (use Deno Deploy or
Netlify), but use the platform's built-in KV for the actual data rather than
Gists.

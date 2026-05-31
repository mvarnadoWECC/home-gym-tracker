# Sync backend — Deno Deploy (recommended if you want to use GitHub)

Runs a tiny server on **Deno Deploy** using its **built-in Deno KV** store.
You sign in to Deno Deploy **with your GitHub account**, and storage is included —
**no Cloudflare account and no separate database to set up.**

Free tier is generous for personal use (≈1M requests/month; 1 GiB KV storage;
15k reads / 10k writes per day).

## Option A — connect your GitHub repo (zero terminal setup)

1. Push this whole project to a GitHub repo (you likely already have one).
2. Go to **https://console.deno.com** and sign in with GitHub.
3. **New Project → link your repo.** Set the entry point to
   `backends/deno/main.ts`.
4. Deploy. It gives you a URL like `https://home-gym-sync.YOURNAME.deno.dev`.

Because the repo is linked, every push redeploys automatically — GitHub does the
work.

## Option B — deploy from your terminal

```bash
# install Deno if needed:  curl -fsSL https://deno.land/install.sh | sh
cd backends/deno
deno install -gArf jsr:@deno/deployctl   # one-time: the deploy CLI
deployctl deploy --project=home-gym-sync main.ts
```

## Connect the app

Put the URL in `../../js/config.js`:

```js
window.SYNC_API = "https://home-gym-sync.YOURNAME.deno.dev"; // no trailing slash
```

Reload the app, generate a code on one device, enter the same code on the others.

## Test it

```bash
curl -X PUT https://YOUR-URL/data/TESTCODE1 \
  -H "Content-Type: application/json" \
  -d '{"sessions":[{"id":"s1","date":"2026-05-30","day":"benchmark","logs":{}}]}'
curl https://YOUR-URL/data/TESTCODE1
```

## Note on size

Deno KV caps a single value at 64 KiB. This backend stores the whole log under
one key, which is fine for a long time (hundreds of workouts). If you ever hit
the limit, switch to one key per session (`["bucket", code, sessionId]`) and use
`kv.list({ prefix: ["bucket", code] })` on read — ask Claude Code to do this.

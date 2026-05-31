# Sync backend (Cloudflare Worker)

A ~80-line Worker that stores your workout log in Cloudflare KV, keyed by a
sync code. Free tier is far more than enough for personal use.

## Deploy (one time, ~5 minutes)

You need a free Cloudflare account. From inside this `backends/cloudflare/` folder:

```bash
# 1. Log in (opens a browser)
npx wrangler login

# 2. Create the KV namespace
npx wrangler kv namespace create SYNC_KV
#    -> copy the printed id

# 3. Paste that id into wrangler.toml (replace PASTE_KV_ID_HERE)

# 4. Deploy
npx wrangler deploy
#    -> prints your Worker URL, e.g.
#       https://home-gym-sync.YOURNAME.workers.dev
```

## Connect the app

Open `../../js/config.js` and set:

```js
window.SYNC_API = "https://home-gym-sync.YOURNAME.workers.dev"; // no trailing slash
```

Reload the app. The Sync panel turns on. On each device, enter the **same**
sync code (tap *Generate Code* on the first device, then type that code on the
others) and use *Sync Now* / *Pull*.

## Test it without the app

```bash
# store
curl -X PUT https://YOUR-WORKER-URL/data/TESTCODE1 \
  -H "Content-Type: application/json" \
  -d '{"sessions":[{"id":"s1","date":"2026-05-30","day":"benchmark","logs":{}}]}'

# read back
curl https://YOUR-WORKER-URL/data/TESTCODE1
```

## Notes

- The sync code is the only access key — anyone with it can read/write that
  bucket. Use a generated 8-char code and don't share it. Don't store sensitive
  data.
- Merge is union-by-id, so syncing never deletes data. Deleting a workout on one
  device won't remove it from others (delete on each, or clear the KV key).
- To wipe a bucket: `npx wrangler kv key delete --binding SYNC_KV "bucket:YOURCODE"`.

# Sync backend — Netlify (best if you also host the app on Netlify)

Runs the sync endpoint as a **Netlify Function** backed by **Netlify Blobs** — a
zero-config key/value store built into Netlify. You sign in to Netlify **with
your GitHub account**, and Blobs needs **no separate database account or
provisioning**. If you host the static app on Netlify too, the site and the sync
function deploy together as one project.

## Deploy

```bash
cd backends/netlify
npm install @netlify/blobs        # add the Blobs SDK
npx netlify login                 # opens browser; sign in with GitHub
npx netlify deploy --prod         # link/create a site, then deploy
```

This publishes a site at e.g. `https://YOUR-SITE.netlify.app`, and the function
answers at `https://YOUR-SITE.netlify.app/data/:code`.

> Tip: you can deploy the **whole app** (static files + this function) as one
> Netlify site instead. Put the app at the site root and keep this
> `netlify/functions/` folder alongside it; then the app and its sync API share
> one origin (and you won't even need CORS).

## Connect the app

In `../../js/config.js`:

```js
window.SYNC_API = "https://YOUR-SITE.netlify.app"; // no trailing slash, no /data
```

(`sync.js` appends `/data/:code` itself.) Reload, generate a code on one device,
enter the same code on the others.

## Local testing

Netlify Blobs only works on Netlify compute, so for local dev run it through the
CLI: `npx netlify dev` (serves the function with Blobs emulated).

## Test it (after deploy)

```bash
curl -X PUT https://YOUR-SITE.netlify.app/data/TESTCODE1 \
  -H "Content-Type: application/json" \
  -d '{"sessions":[{"id":"s1","date":"2026-05-30","day":"benchmark","logs":{}}]}'
curl https://YOUR-SITE.netlify.app/data/TESTCODE1
```

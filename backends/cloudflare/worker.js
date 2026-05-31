/* ============================================================
   Home Gym Sync — Cloudflare Worker
   ------------------------------------------------------------
   A tiny key-value sync backend. Stores one JSON blob per "sync
   code" in a KV namespace. The app pushes/pulls the user's whole
   workout log by code.

   Routes:
     GET    /data/:code   -> returns stored JSON, or 404 if none
     PUT    /data/:code   -> stores the JSON body (max ~3MB)
     OPTIONS *            -> CORS preflight

   Security model: the sync code IS the access token. Anyone with a
   code can read/write that bucket. Codes are validated as 6–32
   alphanumeric chars. Fine for a personal workout log; do not store
   anything sensitive.

   Requires a KV namespace bound as SYNC_KV (see wrangler.toml).
   ============================================================ */

const CODE_RE = /^[A-Za-z0-9]{6,32}$/;
const MAX_BYTES = 3 * 1024 * 1024; // 3 MB ceiling

function cors(extra = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    ...extra,
  };
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: cors({ "Content-Type": "application/json" }),
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors() });
    }

    const url = new URL(request.url);
    const parts = url.pathname.split("/").filter(Boolean); // ["data", code]

    if (parts[0] !== "data" || parts.length !== 2) {
      return json({ error: "not_found" }, 404);
    }
    const code = parts[1];
    if (!CODE_RE.test(code)) {
      return json({ error: "invalid_code" }, 400);
    }
    if (!env.SYNC_KV) {
      return json({ error: "kv_not_bound" }, 500);
    }

    if (request.method === "GET") {
      const stored = await env.SYNC_KV.get("bucket:" + code);
      if (stored === null) return json({ error: "no_data" }, 404);
      return new Response(stored, {
        status: 200,
        headers: cors({ "Content-Type": "application/json" }),
      });
    }

    if (request.method === "PUT") {
      const text = await request.text();
      if (text.length > MAX_BYTES) {
        return json({ error: "too_large" }, 413);
      }
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        return json({ error: "invalid_json" }, 400);
      }
      if (!parsed || !Array.isArray(parsed.sessions)) {
        return json({ error: "expected_sessions_array" }, 400);
      }
      await env.SYNC_KV.put("bucket:" + code, JSON.stringify(parsed));
      return json({ ok: true, count: parsed.sessions.length });
    }

    return json({ error: "method_not_allowed" }, 405);
  },
};

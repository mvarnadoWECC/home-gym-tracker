// ============================================================
// Home Gym Sync — Netlify Function backend
// ------------------------------------------------------------
// Uses Netlify Blobs (zero-config key/value store built into
// Netlify) — no separate database account. Sign in to Netlify
// with your GitHub account; deploy the site + this function
// together.
//
// Implements the shared sync contract:
//   GET  /data/:code  -> { sessions:[...] }  (404 if none)
//   PUT  /data/:code  -> stores { sessions:[...], updated }
//   OPTIONS *         -> CORS preflight
// ============================================================
import { getStore } from "@netlify/blobs";

const CODE_RE = /^[A-Za-z0-9]{6,32}$/;

const cors = (extra = {}) => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  ...extra,
});
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: cors({ "Content-Type": "application/json" }),
  });

export default async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors() });

  const { pathname } = new URL(req.url);
  const code = pathname.split("/").filter(Boolean).pop();
  if (!code || !CODE_RE.test(code)) return json({ error: "invalid_code" }, 400);

  const store = getStore({ name: "homegym", consistency: "strong" });

  if (req.method === "GET") {
    const data = await store.get("bucket:" + code, { type: "json" });
    if (!data) return json({ error: "no_data" }, 404);
    return json(data);
  }

  if (req.method === "PUT") {
    let parsed;
    try {
      parsed = await req.json();
    } catch {
      return json({ error: "invalid_json" }, 400);
    }
    if (!parsed || !Array.isArray(parsed.sessions)) {
      return json({ error: "expected_sessions_array" }, 400);
    }
    await store.setJSON("bucket:" + code, parsed);
    return json({ ok: true, count: parsed.sessions.length });
  }

  return json({ error: "method_not_allowed" }, 405);
};

// Route this function at /data/:code
export const config = { path: "/data/:code" };

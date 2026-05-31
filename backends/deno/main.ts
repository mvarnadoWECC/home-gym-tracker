// ============================================================
// Home Gym Sync — Deno Deploy backend
// ------------------------------------------------------------
// Uses Deno's BUILT-IN key-value store (Deno KV) — no separate
// database account or provisioning. Sign in to Deno Deploy with
// your GitHub account; connect this repo and it deploys itself.
//
// Implements the shared sync contract:
//   GET  /data/:code  -> { sessions:[...] }  (404 if none)
//   PUT  /data/:code  -> stores { sessions:[...], updated }
//   OPTIONS *         -> CORS preflight
//
// The sync code is the only access key (6–32 alphanumerics).
// ============================================================

const CODE_RE = /^[A-Za-z0-9]{6,32}$/;
const MAX_CHARS = 60_000; // Deno KV values cap at 64 KiB; stay under it

const kv = await Deno.openKv();

function cors(extra: Record<string, string> = {}): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    ...extra,
  };
}
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: cors({ "Content-Type": "application/json" }),
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors() });

  const { pathname } = new URL(req.url);
  const parts = pathname.split("/").filter(Boolean); // ["data", "CODE"]
  if (parts[0] !== "data" || parts.length !== 2) return json({ error: "not_found" }, 404);

  const code = parts[1];
  if (!CODE_RE.test(code)) return json({ error: "invalid_code" }, 400);

  if (req.method === "GET") {
    const res = await kv.get<{ sessions: unknown[] }>(["bucket", code]);
    if (!res.value) return json({ error: "no_data" }, 404);
    return json(res.value);
  }

  if (req.method === "PUT") {
    const text = await req.text();
    if (text.length > MAX_CHARS) {
      return json({ error: "too_large", hint: "log exceeds Deno KV's 64 KiB value limit; see README for the chunking upgrade" }, 413);
    }
    let parsed: { sessions?: unknown[] };
    try {
      parsed = JSON.parse(text);
    } catch {
      return json({ error: "invalid_json" }, 400);
    }
    if (!parsed || !Array.isArray(parsed.sessions)) {
      return json({ error: "expected_sessions_array" }, 400);
    }
    await kv.set(["bucket", code], parsed);
    return json({ ok: true, count: parsed.sessions.length });
  }

  return json({ error: "method_not_allowed" }, 405);
});

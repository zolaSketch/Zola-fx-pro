import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Connection diagnostics.
 *
 * Visit /api/health to see, in one place, whether the LLM uplink is actually
 * working — and if not, precisely why. This exists because "JARVIS is not
 * answering" has several very different causes (no key, wrong base URL, wrong
 * model id, no egress) and guessing between them is miserable.
 */
export async function GET() {
  const key = process.env.OPENAI_API_KEY?.trim();
  const baseURL = (process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.JARVIS_MODEL?.trim() || "gpt-4o-mini";

  const report: Record<string, unknown> = {
    brain: key ? "llm (with local fallback)" : "local only — fully functional",
    keyConfigured: Boolean(key),
    keyPrefix: key ? `${key.slice(0, 6)}…${key.slice(-4)}` : null,
    baseURL,
    model,
    checks: {} as Record<string, unknown>,
  };
  const checks = report.checks as Record<string, unknown>;

  if (!key) {
    checks.note =
      "No OPENAI_API_KEY set. Every tool, the knowledge core and voice still work; only free-form chat is rule-based.";
    return NextResponse.json(report);
  }

  if (!/\/v1$/.test(baseURL)) {
    checks.baseUrlWarning =
      "Base URL should normally end in /v1 (e.g. https://opencode.ai/zen/v1).";
  }

  // 1. Can we list models? Cheap, and proves auth + egress.
  const started = Date.now();
  try {
    const res = await fetch(`${baseURL}/models`, {
      headers: { authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(12_000),
    });
    const body = await res.text();
    checks.models = {
      ok: res.ok,
      status: res.status,
      ms: Date.now() - started,
      ...(res.ok
        ? { sample: extractModelIds(body).slice(0, 12) }
        : { error: body.slice(0, 300) }),
    };
  } catch (e) {
    checks.models = { ok: false, error: describe(e), ms: Date.now() - started };
  }

  // 2. Can we actually complete a chat with the configured model?
  const t2 = Date.now();
  try {
    const res = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "Reply with the single word: online" }],
        max_tokens: 8,
        stream: false,
      }),
      signal: AbortSignal.timeout(20_000),
    });
    const text = await res.text();
    checks.chat = {
      ok: res.ok,
      status: res.status,
      ms: Date.now() - t2,
      ...(res.ok
        ? { reply: safeReply(text) }
        : { error: text.slice(0, 300), hint: hintFor(res.status) }),
    };
  } catch (e) {
    checks.chat = { ok: false, error: describe(e), ms: Date.now() - t2 };
  }

  const chat = checks.chat as { ok?: boolean };
  report.verdict = chat?.ok
    ? "LLM uplink operational."
    : "LLM unreachable — JARVIS will run on local cognition. See checks above.";

  return NextResponse.json(report);
}

function describe(e: unknown): string {
  const err = e as { name?: string; message?: string; cause?: { code?: string } };
  if (err?.name === "TimeoutError") return "Timed out — no network egress, or the host is unreachable.";
  const code = err?.cause?.code;
  if (code === "ENOTFOUND") return "DNS lookup failed — check the base URL host.";
  if (code === "ECONNREFUSED") return "Connection refused.";
  if (code === "ECONNRESET" || code === "UND_ERR_SOCKET")
    return "Connection reset — commonly a firewall or proxy blocking outbound HTTPS.";
  return err?.message ?? String(e);
}

function hintFor(status: number): string {
  if (status === 401 || status === 403) return "Key rejected. Check it is valid and matches this base URL.";
  if (status === 404) return "Model or endpoint not found. Check JARVIS_MODEL against /api/health model list.";
  if (status === 429) return "Rate limited or out of credit.";
  if (status >= 500) return "Upstream provider error. Try again shortly.";
  return "Unexpected status.";
}

function extractModelIds(body: string): string[] {
  try {
    const json = JSON.parse(body) as { data?: { id?: string }[] };
    return (json.data ?? []).map((m) => m.id ?? "").filter(Boolean);
  } catch {
    return [];
  }
}

function safeReply(body: string): string {
  try {
    const json = JSON.parse(body) as { choices?: { message?: { content?: string } }[] };
    return json.choices?.[0]?.message?.content?.trim() ?? "(empty)";
  } catch {
    return body.slice(0, 120);
  }
}

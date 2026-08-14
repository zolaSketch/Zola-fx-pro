import { fail, ok, type CapabilityResult } from "./types";

/**
 * Real knowledge lookup with layered sources, all key-free:
 *  1. Wikipedia REST summary (best for entities)
 *  2. Wikipedia full-text search (fallback when there is no exact page)
 *  3. DuckDuckGo Instant Answer (definitions, quick facts)
 */

interface WikiSummary {
  title: string;
  extract?: string;
  description?: string;
  content_urls?: { desktop?: { page?: string } };
  type?: string;
}

async function wikiSummary(q: string, signal?: AbortSignal) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q.replace(/\s+/g, "_"))}`;
  const res = await fetch(url, {
    signal,
    headers: { accept: "application/json", "user-agent": "JARVIS/1.0" },
  });
  if (!res.ok) return null;
  const j = (await res.json()) as WikiSummary;
  if (!j.extract || j.type === "disambiguation") return null;
  return j;
}

async function wikiSearch(q: string, signal?: AbortSignal) {
  const url =
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}` +
    `&srlimit=4&format=json&origin=*`;
  const res = await fetch(url, { signal, headers: { "user-agent": "JARVIS/1.0" } });
  if (!res.ok) return null;
  const j = (await res.json()) as {
    query?: { search?: { title: string; snippet: string }[] };
  };
  return j.query?.search ?? null;
}

async function duckduckgo(q: string, signal?: AbortSignal) {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`;
  const res = await fetch(url, { signal });
  if (!res.ok) return null;
  const j = (await res.json()) as {
    AbstractText?: string;
    AbstractURL?: string;
    Heading?: string;
    RelatedTopics?: { Text?: string }[];
  };
  if (j.AbstractText) return j;
  return null;
}

const strip = (s: string) => s.replace(/<[^>]*>/g, "");

export async function lookup(
  query: string,
  signal?: AbortSignal,
): Promise<CapabilityResult> {
  const q = query.trim();
  if (!q) return fail("What would you like me to look up, sir?");

  try {
    const summary = await wikiSummary(q, signal).catch(() => null);
    if (summary?.extract) {
      const text = summary.extract;
      // Speak the first two sentences; show the rest in the HUD.
      const spoken = text.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ");
      return ok(spoken, [
        `SOURCE ..... Wikipedia · ${summary.title}`,
        ...(summary.description ? [`SUBTITLE ... ${summary.description}`] : []),
        text,
        ...(summary.content_urls?.desktop?.page ? [summary.content_urls.desktop.page] : []),
      ], summary);
    }

    const ddg = await duckduckgo(q, signal).catch(() => null);
    if (ddg?.AbstractText) {
      return ok(ddg.AbstractText, [
        `SOURCE ..... DuckDuckGo${ddg.Heading ? ` · ${ddg.Heading}` : ""}`,
        ddg.AbstractText,
        ...(ddg.AbstractURL ? [ddg.AbstractURL] : []),
      ], ddg);
    }

    const hits = await wikiSearch(q, signal).catch(() => null);
    if (hits?.length) {
      return ok(
        `I found ${hits.length} references for ${q}, sir. The closest is ${hits[0].title}.`,
        hits.map((h) => `${h.title} — ${strip(h.snippet)}`),
        hits,
      );
    }

    return fail(`I found nothing reliable on ${q}, sir.`);
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    return fail("My uplink to the knowledge bases failed, sir.", [String(e)]);
  }
}

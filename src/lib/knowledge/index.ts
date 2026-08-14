import { PROVIDERS } from "./providers";
import type { Answer, Domain, Provider } from "./types";

export * from "./core";
export * from "./types";
export { PROVIDERS } from "./providers";

/**
 * Classify a question into a knowledge domain so the router queries the right
 * specialists first. Ordered most-specific first: the earlier patterns are
 * narrow, the later ones broad.
 */
export function classify(query: string): Domain {
  const q = query.toLowerCase();

  if (/\b\d+(\.\d+)?\s*[a-z°/]+\s+(to|in|into|as)\s+[a-z°/]/.test(q)) return "units";
  if (/\b[a-z]{3}\s*(to|in|into)\s*[a-z]{3}\b/.test(q) && /\b(usd|eur|gbp|jpy|etb|kes|cny|inr|aud|cad|chf|nok|sek|brl|zar)\b/i.test(q))
    return "money";
  if (/\b(bitcoin|btc|ethereum|eth|solana|crypto|dogecoin|xrp|cardano)\b/.test(q)) return "crypto";
  if (/^(define|definition of|meaning of)\b/.test(q) || /\bwhat does .+ mean\b/.test(q))
    return "definition";
  if (/\b(capital|population|currency|flag)\s+of\b/.test(q) || /\bcountry\b/.test(q))
    return "country";
  if (/\b(element|atomic (number|mass)|periodic table|chemical symbol)\b/.test(q))
    return "chemistry";
  if (/\b(planet|moon|solar system|orbit|galaxy|star|asteroid|mars|jupiter|saturn|venus|neptune|uranus|mercury|pluto)\b/.test(q))
    return "space";
  if (/\b(constant|speed of light|gravitational|planck|avogadro|boltzmann)\b/.test(q))
    return "science";
  if (/\b(book|novel|who wrote|author of)\b/.test(q)) return "books";
  if (/\b(film|movie|directed by|starring)\b/.test(q)) return "film";
  // Computed number work: primes, factors, bases, Roman numerals, chance.
  if (
    /\b(prime|factorise|factorize|factors of|gcd|lcm|hcf|roman numerals?|binary|hexadecimal|octal)\b/.test(q) ||
    /\b(roll|dice|coin|random number)\b/.test(q) ||
    // A bare Roman numeral, e.g. "what is MCMLXXXVII in decimal".
    /\b[MDCLXVI]{2,15}\b/.test(query) ||
    /\b\d{0,3}\s*d\s*\d{1,4}\b/.test(q) ||
    /\b(fact about|interesting about) (the )?number\b/.test(q)
  )
    return "numbers";
  if (/\bwho (is|was|are|were)\b/.test(q)) return "people";

  return "general";
}

export interface KnowledgeResult extends Answer {
  domain: Domain;
  /** Other providers that also answered, for transparency in the HUD. */
  alternates?: { source: string; summary: string }[];
}

const CACHE = new Map<string, { at: number; value: KnowledgeResult }>();
const TTL = 10 * 60 * 1000;

function pickProviders(query: string, domain: Domain): Provider[] {
  const scored = PROVIDERS.map((p) => {
    let score = 0;
    if (p.domains.includes(domain)) score += 10;
    if (p.domains.includes("general")) score += 1;
    if (p.offline) score += 3; // instant and always available
    if (p.canHandle?.(query, domain)) score += 8;
    return { p, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.p);
}

/**
 * Ask the knowledge federation.
 *
 * Offline specialists run first and short-circuit on a confident hit, so
 * constants, conversions, elements and planets answer instantly with no
 * network. Remaining providers race in parallel and the highest-confidence
 * answer wins.
 */
export async function ask(
  query: string,
  signal?: AbortSignal,
): Promise<KnowledgeResult | null> {
  const q = query.trim();
  if (!q) return null;

  const key = q.toLowerCase();
  const hit = CACHE.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.value;

  const domain = classify(q);
  const candidates = pickProviders(q, domain);
  if (!candidates.length) return null;

  const finish = (value: KnowledgeResult) => {
    CACHE.set(key, { at: Date.now(), value });
    if (CACHE.size > 200) CACHE.delete(CACHE.keys().next().value!);
    return value;
  };

  // 1. Offline specialists — instant, deterministic, no network.
  for (const p of candidates.filter((x) => x.offline)) {
    if (p.canHandle && !p.canHandle(q, domain)) continue;
    try {
      const a = await p.run(q, signal);
      if (a && a.confidence >= 0.85) return finish({ ...a, domain });
    } catch {
      /* try the next provider */
    }
  }

  // 2. Network providers race; collect everything that answers.
  const online = candidates.filter((x) => !x.offline).slice(0, 5);
  const results = await Promise.allSettled(
    online.map(async (p) => {
      if (p.canHandle && !p.canHandle(q, domain)) return null;
      return p.run(q, signal);
    }),
  );

  const answers = results
    .flatMap((r) => (r.status === "fulfilled" && r.value ? [r.value] : []))
    .sort((a, b) => b.confidence - a.confidence);

  if (!answers.length) return null;

  const best = answers[0];
  return finish({
    ...best,
    domain,
    alternates: answers.slice(1, 3).map((a) => ({ source: a.source, summary: a.summary })),
  });
}
